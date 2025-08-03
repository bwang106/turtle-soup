import { Server as NetServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';
import { gameStore } from '@/lib/gameStore';
import { aiService } from '@/lib/aiService';
import { v4 as uuidv4 } from 'uuid';
import { Player } from '@/types/game';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: ServerIO;
    };
  };
};

const SocketHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (res.socket.server.io) {
    console.log('Socket is already running');
    res.end();
    return;
  }

  console.log('Setting up socket');
  const io = new ServerIO(res.socket.server, {
    path: '/socket.io/',
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
  res.socket.server.io = io;

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // 加入房间
    socket.on('join-room', (roomId: string, playerName: string) => {
      console.log(`Player ${playerName} joining room ${roomId}`);
      socket.join(roomId);
      
      const game = gameStore.getGame(roomId);
      if (!game) {
        socket.emit('error', '房间不存在');
        return;
      }
      
      // 检查玩家是否已经存在
      const existingPlayer = game.players.find(p => p.name === playerName);
      let player: Player | null = existingPlayer || null;
      
      if (!existingPlayer) {
        // 如果是新玩家，调用 joinGame
        player = gameStore.joinGame(roomId, playerName);
        if (!player) {
          socket.emit('error', '无法加入房间');
          return;
        }
      }
      
      // 发送玩家加入事件
      socket.emit('player-joined', player);
      socket.broadcast.to(roomId).emit('player-joined', player);
      
      // 发送当前游戏状态
      const currentGame = gameStore.getGame(roomId);
      if (currentGame) {
        socket.emit('game-state-updated', currentGame);
        socket.broadcast.to(roomId).emit('game-state-updated', currentGame);
      }
    });

    // 准备状态切换
    socket.on('toggle-ready', (roomId: string, playerId: string) => {
      const game = gameStore.getGame(roomId);
      if (game) {
        const player = game.players.find(p => p.id === playerId);
        if (player) {
          player.isReady = !player.isReady;
          socket.emit('game-state-updated', game);
          socket.broadcast.to(roomId).emit('game-state-updated', game);
        }
      }
    });

    // 开始游戏
    socket.on('start-game', (roomId: string) => {
      const success = gameStore.startGame(roomId);
      if (success) {
        const game = gameStore.getGame(roomId);
        if (game) {
          socket.emit('game-started', game);
          socket.broadcast.to(roomId).emit('game-started', game);
        }
      } else {
        socket.emit('error', '无法开始游戏');
      }
    });

    // 提交问题
    socket.on('submit-question', async (roomId: string, playerId: string, question: string) => {
      const game = gameStore.getGame(roomId);
      if (!game) {
        socket.emit('error', '游戏不存在');
        return;
      }

      const player = game.players.find(p => p.id === playerId);
      if (!player || player.health <= 0) {
        socket.emit('error', '无法提问');
        return;
      }

      // 添加问题到聊天记录
      const chatMessage = gameStore.addChatMessage(roomId, {
        playerId,
        playerName: player.name,
        message: question,
        type: 'question'
      });

      // 获取 AI 回答
      const aiResponse = await aiService.answerQuestion(question, game.soupStory);
      
      // 添加 AI 回答到聊天记录
      const aiMessage = gameStore.addChatMessage(roomId, {
        playerId: 'ai',
        playerName: 'AI主持人',
        message: getAnswerText(aiResponse.answer),
        type: 'answer',
        aiResponse: aiResponse.answer
      });

      // 减少血量
      gameStore.updatePlayerHealth(roomId, playerId, player.health - 1);

      // 广播消息
      socket.emit('question-asked', chatMessage);
      socket.broadcast.to(roomId).emit('question-asked', chatMessage);
      
      socket.emit('ai-response', aiResponse);
      socket.broadcast.to(roomId).emit('ai-response', aiResponse);
      
      socket.emit('question-asked', aiMessage);
      socket.broadcast.to(roomId).emit('question-asked', aiMessage);

      // 更新游戏状态
      const updatedGame = gameStore.getGame(roomId);
      if (updatedGame) {
        socket.emit('game-state-updated', updatedGame);
        socket.broadcast.to(roomId).emit('game-state-updated', updatedGame);
      }

      // 检查游戏是否结束
      if (updatedGame && checkGameEnd(updatedGame)) {
        gameStore.endGame(roomId);
        socket.emit('game-ended', null, '所有玩家血量耗尽');
        socket.broadcast.to(roomId).emit('game-ended', null, '所有玩家血量耗尽');
      }
    });

    // 提交猜测
    socket.on('submit-guess', async (roomId: string, playerId: string, guess: string) => {
      const game = gameStore.getGame(roomId);
      if (!game) {
        socket.emit('error', '游戏不存在');
        return;
      }

      const player = game.players.find(p => p.id === playerId);
      if (!player || player.health <= 0) {
        socket.emit('error', '无法猜测');
        return;
      }

      // 添加猜测到聊天记录
      const chatMessage = gameStore.addChatMessage(roomId, {
        playerId,
        playerName: player.name,
        message: `我猜测：${guess}`,
        type: 'guess'
      });

      // 检查猜测结果
      const result = await aiService.checkGuess(guess, game.soupStory);
      
      // 添加结果到聊天记录
      const resultMessage = gameStore.addChatMessage(roomId, {
        playerId: 'ai',
        playerName: 'AI主持人',
        message: result.message,
        type: 'answer'
      });

      // 减少血量
      gameStore.updatePlayerHealth(roomId, playerId, player.health - 1);

      // 广播消息
      socket.emit('guess-submitted', chatMessage);
      socket.broadcast.to(roomId).emit('guess-submitted', chatMessage);
      
      socket.emit('guess-result', result);
      socket.broadcast.to(roomId).emit('guess-result', result);
      
      socket.emit('question-asked', resultMessage);
      socket.broadcast.to(roomId).emit('question-asked', resultMessage);

      // 如果猜对了，结束游戏
      if (result.isCorrect) {
        gameStore.endGame(roomId);
        socket.emit('game-ended', player, result.fullStory || '');
        socket.broadcast.to(roomId).emit('game-ended', player, result.fullStory || '');
      } else {
        // 更新游戏状态
        const updatedGame = gameStore.getGame(roomId);
        if (updatedGame) {
          socket.emit('game-state-updated', updatedGame);
          socket.broadcast.to(roomId).emit('game-state-updated', updatedGame);
        }

        // 检查游戏是否结束
        if (updatedGame && checkGameEnd(updatedGame)) {
          gameStore.endGame(roomId);
          socket.emit('game-ended', null, '所有玩家血量耗尽');
          socket.broadcast.to(roomId).emit('game-ended', null, '所有玩家血量耗尽');
        }
      }
    });

    // 请求提示
    socket.on('request-hint', async (roomId: string, playerId: string) => {
      const game = gameStore.getGame(roomId);
      if (!game) {
        socket.emit('error', '游戏不存在');
        return;
      }

      const player = game.players.find(p => p.id === playerId);
      if (!player || player.health <= 0) {
        socket.emit('error', '无法请求提示');
        return;
      }

      // 生成提示
      const hint = await aiService.generateHint(game.soupStory, game.discoveredClues.map(c => c.title));
      
      // 添加提示到聊天记录
      const chatMessage = gameStore.addChatMessage(roomId, {
        playerId: 'ai',
        playerName: 'AI主持人',
        message: `提示：${hint}`,
        type: 'hint'
      });

      // 减少血量
      gameStore.updatePlayerHealth(roomId, playerId, player.health - 1);

      // 广播消息
      socket.emit('hint-requested', { hint, cost: 1 });
      socket.broadcast.to(roomId).emit('hint-requested', { hint, cost: 1 });
      
      socket.emit('question-asked', chatMessage);
      socket.broadcast.to(roomId).emit('question-asked', chatMessage);

      // 更新游戏状态
      const updatedGame = gameStore.getGame(roomId);
      if (updatedGame) {
        socket.emit('game-state-updated', updatedGame);
        socket.broadcast.to(roomId).emit('game-state-updated', updatedGame);
      }

      // 检查游戏是否结束
      if (updatedGame && checkGameEnd(updatedGame)) {
        gameStore.endGame(roomId);
        socket.emit('game-ended', null, '所有玩家血量耗尽');
        socket.broadcast.to(roomId).emit('game-ended', null, '所有玩家血量耗尽');
      }
    });

    // 离开房间
    socket.on('leave-room', (roomId: string, playerId: string) => {
      const success = gameStore.leaveGame(roomId, playerId);
      if (success) {
        socket.leave(roomId);
        socket.broadcast.to(roomId).emit('player-left', playerId);
        
        const game = gameStore.getGame(roomId);
        if (game) {
          socket.emit('game-state-updated', game);
          socket.broadcast.to(roomId).emit('game-state-updated', game);
        }
      }
    });

    // 断开连接
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  res.end();
};

// 辅助函数
function getAnswerText(answer: string): string {
  const answerMap = {
    'yes': '是',
    'no': '不是',
    'irrelevant': '无关',
    'close': '你已经接近了'
  };
  return answerMap[answer as keyof typeof answerMap] || '是';
}

function checkGameEnd(game: any): boolean {
  return game.players.every((player: any) => player.health <= 0);
}

export default SocketHandler; 