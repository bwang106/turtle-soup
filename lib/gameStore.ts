import { GameState, Player, ChatMessage, Clue } from '../types/game';
import { v4 as uuidv4 } from 'uuid';

class GameStore {
  private games: Map<string, GameState> = new Map();

  createGame(roomId: string, hostName: string, maxPlayers: number = 4, timeLimit: number = 30): GameState {
    const host: Player = {
      id: uuidv4(),
      name: hostName,
      health: 5,
      isReady: true,
      isHost: true,
    };

    const gameState: GameState = {
      roomId,
      players: [host],
      currentTurn: null,
      gameStatus: 'waiting',
      soupStory: this.generateSoupStory(),
      discoveredClues: [],
      chatHistory: [],
      maxHealth: 5,
      timeLimit,
    };

    this.games.set(roomId, gameState);
    return gameState;
  }

  getGame(roomId: string): GameState | undefined {
    return this.games.get(roomId);
  }

  joinGame(roomId: string, playerName: string): Player | null {
    const game = this.games.get(roomId);
    if (!game || game.gameStatus !== 'waiting' || game.players.length >= 4) {
      return null;
    }

    const newPlayer: Player = {
      id: uuidv4(),
      name: playerName,
      health: 5,
      isReady: false,
      isHost: false,
    };

    game.players.push(newPlayer);
    return newPlayer;
  }

  leaveGame(roomId: string, playerId: string): boolean {
    const game = this.games.get(roomId);
    if (!game) return false;

    const playerIndex = game.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return false;

    game.players.splice(playerIndex, 1);

    // 如果房主离开，转移房主权限
    if (game.players.length > 0 && game.players[playerIndex]?.isHost) {
      game.players[0].isHost = true;
    }

    // 如果没有玩家了，删除游戏
    if (game.players.length === 0) {
      this.games.delete(roomId);
    }

    return true;
  }

  startGame(roomId: string): boolean {
    const game = this.games.get(roomId);
    if (!game || game.gameStatus !== 'waiting' || game.players.length < 1) {
      return false;
    }

    game.gameStatus = 'playing';
    game.currentTurn = game.players[0].id;
    game.gameStartTime = new Date();

    // 添加游戏开始消息
    this.addChatMessage(roomId, {
      playerId: 'system',
      playerName: '系统',
      message: `游戏开始！汤底：${game.soupStory}`,
      type: 'system'
    });

    return true;
  }

  addChatMessage(roomId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
    const game = this.games.get(roomId);
    if (!game) throw new Error('Game not found');

    const chatMessage: ChatMessage = {
      ...message,
      id: uuidv4(),
      timestamp: new Date(),
    };

    game.chatHistory.push(chatMessage);
    return chatMessage;
  }

  addClue(roomId: string, clue: Omit<Clue, 'id' | 'discoveredAt'>): Clue {
    const game = this.games.get(roomId);
    if (!game) throw new Error('Game not found');

    const newClue: Clue = {
      ...clue,
      id: uuidv4(),
      discoveredAt: new Date(),
    };

    game.discoveredClues.push(newClue);
    return newClue;
  }

  updatePlayerHealth(roomId: string, playerId: string, health: number): boolean {
    const game = this.games.get(roomId);
    if (!game) return false;

    const player = game.players.find(p => p.id === playerId);
    if (!player) return false;

    player.health = Math.max(0, health);
    return true;
  }

  nextTurn(roomId: string): string | null {
    const game = this.games.get(roomId);
    if (!game || game.players.length === 0) return null;

    const currentIndex = game.players.findIndex(p => p.id === game.currentTurn);
    const nextIndex = (currentIndex + 1) % game.players.length;
    game.currentTurn = game.players[nextIndex].id;

    return game.currentTurn;
  }

  endGame(roomId: string): void {
    const game = this.games.get(roomId);
    if (game) {
      game.gameStatus = 'finished';
    }
  }

  private generateSoupStory(): string {
    const stories = [
      "一个男人走进一家餐厅，点了一碗海龟汤。他尝了一口，然后自杀了。为什么？",
      "一个女人在沙漠中迷路了。她找到了一具尸体，旁边有一瓶水。她喝了水，然后死了。为什么？",
      "一个男人住在10楼。每天他都会坐电梯到1楼出门。但是回家时，他总是坐电梯到7楼，然后走楼梯到10楼。为什么？",
      "一对夫妇在餐厅吃饭。丈夫点了一份牛排，妻子点了一份鱼。丈夫尝了一口妻子的鱼，然后死了。为什么？",
      "一个男人走进一家酒吧，向酒保要了一杯水。酒保拿出一把枪指着他。男人说谢谢，然后离开了。为什么？"
    ];

    return stories[Math.floor(Math.random() * stories.length)];
  }

  // 清理过期游戏（超过2小时）
  cleanupExpiredGames(): void {
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    for (const [roomId, game] of Array.from(this.games.entries())) {
      if (game.gameStartTime && game.gameStartTime < twoHoursAgo) {
        this.games.delete(roomId);
      }
    }
  }
}

export const gameStore = new GameStore(); 