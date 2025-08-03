import { NextApiRequest, NextApiResponse } from 'next';
import { gameStore } from '@/lib/gameStore';
import { aiService } from '@/lib/aiService';
import { Player } from '@/types/game';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, roomId, playerId, data } = req.body;

    switch (action) {
      case 'join-room':
        const { playerName } = data;
        const game = gameStore.getGame(roomId);
        if (!game) {
          return res.status(404).json({ error: '房间不存在' });
        }
        
        const existingPlayer = game.players.find(p => p.name === playerName);
        let player: Player | null = existingPlayer || null;
        
        if (!existingPlayer) {
          player = gameStore.joinGame(roomId, playerName);
          if (!player) {
            return res.status(400).json({ error: '无法加入房间' });
          }
        }
        
        return res.json({ 
          success: true, 
          player,
          gameState: gameStore.getGame(roomId)
        });

      case 'get-game-state':
        const currentGame = gameStore.getGame(roomId);
        if (!currentGame) {
          return res.status(404).json({ error: '游戏不存在' });
        }
        return res.json({ gameState: currentGame });

      case 'submit-question':
        const { question } = data;
        const gameForQuestion = gameStore.getGame(roomId);
        if (!gameForQuestion) {
          return res.status(404).json({ error: '游戏不存在' });
        }

        const playerForQuestion = gameForQuestion.players.find(p => p.id === playerId);
        if (!playerForQuestion || playerForQuestion.health <= 0) {
          return res.status(400).json({ error: '无法提问' });
        }

        // 添加问题到聊天记录
        const chatMessage = gameStore.addChatMessage(roomId, {
          playerId,
          playerName: playerForQuestion.name,
          message: question,
          type: 'question'
        });

        // 获取 AI 回答
        const aiResponse = await aiService.answerQuestion(question, gameForQuestion.soupStory);
        
        // 添加 AI 回答到聊天记录
        const aiMessage = gameStore.addChatMessage(roomId, {
          playerId: 'ai',
          playerName: 'AI主持人',
          message: getAnswerText(aiResponse.answer),
          type: 'answer',
          aiResponse: aiResponse.answer
        });

        // 减少血量
        gameStore.updatePlayerHealth(roomId, playerId, playerForQuestion.health - 1);

        return res.json({
          success: true,
          chatMessage,
          aiResponse,
          aiMessage,
          gameState: gameStore.getGame(roomId)
        });

      case 'start-game':
        const gameForStart = gameStore.getGame(roomId);
        if (!gameForStart) {
          return res.status(404).json({ error: '游戏不存在' });
        }

        const playerForStart = gameForStart.players.find(p => p.id === playerId);
        if (!playerForStart || !playerForStart.isHost) {
          return res.status(400).json({ error: '只有房主可以开始游戏' });
        }

        const success = gameStore.startGame(roomId);
        if (success) {
          return res.json({
            success: true,
            gameState: gameStore.getGame(roomId)
          });
        } else {
          return res.status(400).json({ error: '无法开始游戏' });
        }

      case 'toggle-ready':
        const gameForReady = gameStore.getGame(roomId);
        if (!gameForReady) {
          return res.status(404).json({ error: '游戏不存在' });
        }

        const playerForReady = gameForReady.players.find(p => p.id === playerId);
        if (!playerForReady) {
          return res.status(400).json({ error: '玩家不存在' });
        }

        playerForReady.isReady = !playerForReady.isReady;
        return res.json({
          success: true,
          gameState: gameStore.getGame(roomId)
        });

      case 'submit-guess':
        const { guess } = data;
        const gameForGuess = gameStore.getGame(roomId);
        if (!gameForGuess) {
          return res.status(404).json({ error: '游戏不存在' });
        }

        const playerForGuess = gameForGuess.players.find(p => p.id === playerId);
        if (!playerForGuess || playerForGuess.health <= 0) {
          return res.status(400).json({ error: '无法猜测' });
        }

        // 添加猜测到聊天记录
        const guessMessage = gameStore.addChatMessage(roomId, {
          playerId,
          playerName: playerForGuess.name,
          message: `我猜测：${guess}`,
          type: 'guess'
        });

        // 检查猜测结果
        const result = await aiService.checkGuess(guess, gameForGuess.soupStory);
        
        // 添加结果到聊天记录
        const resultMessage = gameStore.addChatMessage(roomId, {
          playerId: 'ai',
          playerName: 'AI主持人',
          message: result.message,
          type: 'answer'
        });

        // 减少血量
        gameStore.updatePlayerHealth(roomId, playerId, playerForGuess.health - 1);

        return res.json({
          success: true,
          guessMessage,
          result,
          resultMessage,
          gameState: gameStore.getGame(roomId)
        });

      default:
        return res.status(400).json({ error: '未知操作' });
    }
  } catch (error) {
    console.error('Error in join-room API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

function getAnswerText(answer: string): string {
  const answerMap = {
    'yes': '是',
    'no': '不是',
    'irrelevant': '无关',
    'close': '你已经接近了'
  };
  return answerMap[answer as keyof typeof answerMap] || '是';
} 