'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { Player, GameState, ChatMessage, Clue } from '../../../types/game';
import { 
  Send, 
  Heart, 
  Lightbulb, 
  Target, 
  ArrowLeft, 
  Clock, 
  Crown,
  MessageSquare,
  Users
} from 'lucide-react';

export default function GamePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = params?.roomId as string;
  const playerId = searchParams?.get('playerId');

  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [question, setQuestion] = useState('');
  const [guess, setGuess] = useState('');
  const [showGuessModal, setShowGuessModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initSocket = async () => {
      // 先初始化 Socket.IO 服务器
      await fetch('/api/socket');
      
      const newSocket = io({
        path: '/api/socket',
        transports: ['polling', 'websocket'],
        addTrailingSlash: false
      });
      setSocket(newSocket);

      // Socket 事件监听
      newSocket.on('game-state-updated', (state: GameState) => {
        setGameState(state);
        const player = state.players.find((p: Player) => p.id === playerId);
        if (player) {
          setCurrentPlayer(player);
          setIsMyTurn(state.currentTurn === playerId);
        }
      });

      newSocket.on('question-asked', (message: ChatMessage) => {
        console.log('New message:', message);
      });

      newSocket.on('ai-response', (response: any) => {
        console.log('AI response:', response);
      });

      newSocket.on('guess-result', (result: any) => {
        if (result.isCorrect) {
          alert('恭喜！有人猜对了！');
          router.push(`/result/${roomId}?winner=${result.winner?.id}`);
        }
      });

      newSocket.on('game-ended', (winner: Player | null, fullStory: string) => {
        router.push(`/result/${roomId}?winner=${winner?.id || 'none'}&story=${encodeURIComponent(fullStory)}`);
      });

      newSocket.on('error', (message: string) => {
        alert(message);
      });

      return () => {
        newSocket.close();
      };
    };

    initSocket();
  }, [roomId, playerId]);

  // 自动滚动到聊天底部
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameState?.chatHistory]);

  // 倒计时
  useEffect(() => {
    if (gameState?.gameStartTime) {
      const startTime = new Date(gameState.gameStartTime).getTime();
      const timeLimit = gameState.timeLimit * 60 * 1000; // 转换为毫秒
      
      const timer = setInterval(() => {
        const now = Date.now();
        const elapsed = now - startTime;
        const remaining = timeLimit - elapsed;
        
        if (remaining <= 0) {
          setTimeLeft(0);
          clearInterval(timer);
        } else {
          setTimeLeft(Math.ceil(remaining / 1000));
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState?.gameStartTime, gameState?.timeLimit]);

  const handleSubmitQuestion = () => {
    if (!question.trim() || !socket || !currentPlayer || currentPlayer.health <= 0) {
      return;
    }

    socket.emit('submit-question', roomId, currentPlayer.id, question.trim());
    setQuestion('');
  };

  const handleSubmitGuess = () => {
    if (!guess.trim() || !socket || !currentPlayer || currentPlayer.health <= 0) {
      return;
    }

    socket.emit('submit-guess', roomId, currentPlayer.id, guess.trim());
    setGuess('');
    setShowGuessModal(false);
  };

  const handleRequestHint = () => {
    if (!socket || !currentPlayer || currentPlayer.health <= 0) {
      return;
    }

    socket.emit('request-hint', roomId, currentPlayer.id);
  };

  const handleLeaveGame = () => {
    if (socket && currentPlayer) {
      socket.emit('leave-room', roomId, currentPlayer.id);
    }
    router.push('/');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!gameState || !currentPlayer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ArrowLeft 
                className="w-6 h-6 text-gray-600 cursor-pointer hover:text-gray-800"
                onClick={handleLeaveGame}
              />
              <h1 className="text-2xl font-bold text-gray-800">海龟汤游戏</h1>
              <div className="flex items-center space-x-2 text-gray-600">
                <Users className="w-5 h-5" />
                <span>{gameState.players.length} 人</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-red-500" />
                <span className={`font-mono ${timeLeft <= 300 ? 'text-red-600' : 'text-gray-600'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="text-gray-600">
                  {currentPlayer.health}/{gameState.maxHealth}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Players Panel */}
          <div className="bg-white rounded-xl shadow-xl p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">玩家状态</h2>
            <div className="space-y-3">
              {gameState.players.map((player) => (
                <div
                  key={player.id}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    player.id === currentPlayer.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-gray-50'
                  } ${player.health <= 0 ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {player.name.charAt(0).toUpperCase()}
                        </div>
                        {player.isHost && (
                          <Crown className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1" />
                        )}
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-800 text-sm">
                          {player.name}
                          {player.id === currentPlayer.id && (
                            <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-1 rounded">
                              你
                            </span>
                          )}
                        </p>
                        <div className="flex items-center space-x-1 mt-1">
                          {Array.from({ length: gameState.maxHealth }).map((_, i) => (
                            <Heart
                              key={i}
                              className={`w-3 h-3 ${
                                i < player.health ? 'text-red-500 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {gameState.currentTurn === player.id && (
                      <div className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                        轮到
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Panel */}
          <div className="bg-white rounded-xl shadow-xl p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                游戏对话
              </h2>
              {isMyTurn && currentPlayer.health > 0 && (
                <div className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                  你的回合
                </div>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
              {gameState.chatHistory.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg ${
                    message.playerId === 'ai'
                      ? 'bg-blue-50 border-l-4 border-blue-500'
                      : message.playerId === currentPlayer.id
                      ? 'bg-green-50 border-l-4 border-green-500'
                      : 'bg-gray-50 border-l-4 border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">
                      {message.playerName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{message.message}</p>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            
            {/* Input Area */}
            {currentPlayer.health > 0 && (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmitQuestion()}
                  placeholder={isMyTurn ? "输入你的问题..." : "等待其他玩家..."}
                  disabled={!isMyTurn}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
                <button
                  onClick={handleSubmitQuestion}
                  disabled={!isMyTurn || !question.trim() || currentPlayer.health <= 0}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Actions Panel */}
          <div className="bg-white rounded-xl shadow-xl p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">游戏操作</h2>
            
            <div className="space-y-4">
              {/* Hint Button */}
              <button
                onClick={handleRequestHint}
                disabled={currentPlayer.health <= 0}
                className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                <Lightbulb className="w-5 h-5 mr-2" />
                请求提示 (-1 血量)
              </button>
              
              {/* Guess Button */}
              <button
                onClick={() => setShowGuessModal(true)}
                disabled={currentPlayer.health <= 0}
                className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                <Target className="w-5 h-5 mr-2" />
                猜测答案 (-1 血量)
              </button>
              
              {/* Discovered Clues */}
              {gameState.discoveredClues.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-md font-semibold text-gray-800 mb-3">已发现的线索</h3>
                  <div className="space-y-2">
                    {gameState.discoveredClues.map((clue) => (
                      <div key={clue.id} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="font-medium text-sm text-green-800">{clue.title}</p>
                        <p className="text-xs text-green-600 mt-1">{clue.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Guess Modal */}
        {showGuessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">猜测答案</h3>
              <textarea
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="输入你的猜测..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
                rows={4}
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowGuessModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmitGuess}
                  disabled={!guess.trim()}
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  提交猜测
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 