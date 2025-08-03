'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
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

  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [question, setQuestion] = useState('');
  const [guess, setGuess] = useState('');
  const [showGuessModal, setShowGuessModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initGame = async () => {
      console.log('初始化游戏连接...');
      console.log('房间ID:', roomId);
      console.log('玩家ID:', playerId);
      
      // 从 URL 参数获取初始游戏状态
      const urlParams = new URLSearchParams(window.location.search);
      const gameStateParam = urlParams.get('gameState');
      
      console.log('URL 参数中的游戏状态:', gameStateParam ? '存在' : '不存在');
      
      if (gameStateParam) {
        try {
          const initialGameState = JSON.parse(decodeURIComponent(gameStateParam));
          console.log('解析的游戏状态:', initialGameState);
          setGameState(initialGameState);
          
          const player = initialGameState.players.find((p: Player) => p.id === playerId);
          if (player) {
            console.log('找到玩家:', player);
            setCurrentPlayer(player);
            setIsMyTurn(initialGameState.currentTurn === playerId);
          } else {
            console.log('未找到玩家，玩家ID:', playerId);
          }
        } catch (error) {
          console.error('解析游戏状态失败:', error);
        }
      } else {
        console.log('尝试从服务器获取游戏状态...');
        // 如果没有游戏状态参数，尝试从服务器获取
        try {
          const response = await fetch(`/api/get-game-state?roomId=${roomId}`);
          if (response.ok) {
            const gameState = await response.json();
            console.log('从服务器获取的游戏状态:', gameState);
            setGameState(gameState);
            
            const player = gameState.players.find((p: Player) => p.id === playerId);
            if (player) {
              console.log('找到玩家:', player);
              setCurrentPlayer(player);
              setIsMyTurn(gameState.currentTurn === playerId);
            } else {
              console.log('未找到玩家，玩家ID:', playerId);
            }
          } else {
            console.error('获取游戏状态失败，状态码:', response.status);
          }
        } catch (error) {
          console.error('获取游戏状态失败:', error);
        }
      }

      // 开始轮询游戏状态
      startPolling();
    };

    initGame();

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [roomId, playerId]);

  const startPolling = () => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/join-room', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'get-game-state',
            roomId,
            currentGameState: gameState
          })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.gameState) {
            setGameState(result.gameState);
            const player = result.gameState.players.find((p: Player) => p.id === playerId);
            if (player) {
              setCurrentPlayer(player);
              setIsMyTurn(result.gameState.currentTurn === playerId);
            }
            
            // 检查游戏是否结束
            if (result.gameState.gameStatus === 'ended') {
              router.push(`/result/${roomId}?winner=${result.gameState.winner?.id || 'none'}&story=${encodeURIComponent(result.gameState.soupStory)}`);
            }
          }
        }
      } catch (error) {
        console.error('轮询游戏状态失败:', error);
      }
    }, 2000); // 每2秒轮询一次

    setPollingInterval(interval);
  };

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

  const handleSubmitQuestion = async () => {
    if (!question.trim() || !currentPlayer || currentPlayer.health <= 0) {
      return;
    }

    try {
      const response = await fetch('/api/join-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'submit-question',
          roomId,
          playerId,
          data: { question: question.trim() },
          currentGameState: gameState
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setGameState(result.gameState);
          setQuestion('');
        }
      }
    } catch (error) {
      console.error('提交问题失败:', error);
    }
  };

  const handleSubmitGuess = async () => {
    if (!guess.trim() || !currentPlayer || currentPlayer.health <= 0) {
      return;
    }

    try {
      const response = await fetch('/api/join-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'submit-guess',
          roomId,
          playerId,
          data: { guess: guess.trim() },
          currentGameState: gameState
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setGameState(result.gameState);
          setGuess('');
          setShowGuessModal(false);
          
          // 如果猜对了，跳转到结果页
          if (result.gameState.gameStatus === 'ended') {
            router.push(`/result/${roomId}?winner=${result.gameState.winner?.id || 'none'}&story=${encodeURIComponent(result.gameState.soupStory)}`);
          }
        }
      }
    } catch (error) {
      console.error('提交猜测失败:', error);
    }
  };

  const handleRequestHint = async () => {
    if (!currentPlayer || currentPlayer.health <= 0) {
      return;
    }

    try {
      const response = await fetch('/api/join-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'request-hint',
          roomId,
          playerId,
          currentGameState: gameState
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setGameState(result.gameState);
        }
      }
    } catch (error) {
      console.error('请求提示失败:', error);
    }
  };

  const handleLeaveGame = () => {
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLeaveGame}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>返回</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <Users size={20} className="text-blue-600" />
                <span className="text-sm text-gray-600">房间: {roomId}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock size={16} className="text-orange-500" />
                <span className="text-sm font-medium">{formatTime(timeLeft)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart size={16} className="text-red-500" />
                <span className="text-sm font-medium">{currentPlayer.health}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：玩家列表和血量 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Users size={20} className="mr-2" />
                玩家列表
              </h3>
              <div className="space-y-3">
                {gameState.players.map((player) => (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      player.id === currentPlayer.id ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {player.isHost && <Crown size={16} className="text-yellow-500" />}
                      <span className="font-medium">{player.name}</span>
                      {gameState.currentTurn === player.id && (
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Heart size={14} className="text-red-500" />
                      <span className="text-sm">{player.health}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 线索区域 */}
            {gameState.discoveredClues.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-4 mt-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Lightbulb size={20} className="mr-2" />
                  已发现的线索
                </h3>
                <div className="space-y-2">
                  {gameState.discoveredClues.map((clue, index) => (
                    <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">{clue.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 中间：聊天区域 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border h-96 flex flex-col">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold flex items-center">
                  <MessageSquare size={20} className="mr-2" />
                  游戏对话
                </h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {gameState.chatHistory.map((message, index) => (
                  <div key={index} className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {message.playerName.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm">{message.playerName}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                                             <div className="bg-gray-100 rounded-lg p-3">
                         <p className="text-sm">{message.message}</p>
                       </div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* 输入区域 */}
              <div className="p-4 border-t">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmitQuestion()}
                    placeholder="输入你的问题..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!isMyTurn || currentPlayer.health <= 0}
                  />
                  <button
                    onClick={handleSubmitQuestion}
                    disabled={!question.trim() || !isMyTurn || currentPlayer.health <= 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={16} />
                  </button>
                  <button
                    onClick={() => setShowGuessModal(true)}
                    disabled={currentPlayer.health <= 0}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Target size={16} />
                  </button>
                  <button
                    onClick={handleRequestHint}
                    disabled={currentPlayer.health <= 0}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Lightbulb size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 猜测模态框 */}
      {showGuessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">尝试猜测答案</h3>
            <textarea
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="输入你的猜测..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              rows={3}
            />
            <div className="flex space-x-3">
              <button
                onClick={handleSubmitGuess}
                disabled={!guess.trim()}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                提交猜测
              </button>
              <button
                onClick={() => setShowGuessModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 