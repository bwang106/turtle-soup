'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Player, GameState } from '../../../types/game';
import { 
  Users, 
  Play, 
  Copy, 
  ArrowLeft, 
  Crown, 
  Heart, 
  Clock,
  Sparkles,
  Zap,
  CheckCircle,
  XCircle,
  UserPlus,
  Settings
} from 'lucide-react';

export default function LobbyPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = params?.roomId as string;
  const playerId = searchParams?.get('playerId');

  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    const initLobby = async () => {
      console.log('初始化大厅连接...');
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
            setIsHost(player.isHost);
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
              setIsHost(player.isHost);
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

    initLobby();

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
              setIsHost(player.isHost);
            }
            
            // 检查游戏是否开始
            if (result.gameState.gameStatus === 'playing') {
              const gameStateParam = encodeURIComponent(JSON.stringify(result.gameState));
              router.push(`/game/${roomId}?playerId=${playerId}&gameState=${gameStateParam}`);
            }
          }
        }
      } catch (error) {
        console.error('轮询游戏状态失败:', error);
      }
    }, 2000); // 每2秒轮询一次

    setPollingInterval(interval);
  };

  const handleToggleReady = async () => {
    if (!currentPlayer) return;

    try {
      const response = await fetch('/api/join-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'toggle-ready',
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
      console.error('切换准备状态失败:', error);
    }
  };

  const handleStartGame = async () => {
    if (!isHost) return;

    setIsStarting(true);
    try {
      const response = await fetch('/api/join-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'start-game',
          roomId,
          playerId,
          currentGameState: gameState
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log('游戏开始成功，跳转到游戏页面');
          const gameStateParam = encodeURIComponent(JSON.stringify(result.gameState));
          router.push(`/game/${roomId}?playerId=${playerId}&gameState=${gameStateParam}`);
        }
      }
    } catch (error) {
      console.error('开始游戏失败:', error);
    } finally {
      setIsStarting(false);
    }
  };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeaveRoom = () => {
    router.push('/');
  };

  const canStartGame = () => {
    if (!gameState || !isHost) return false;
    return gameState.gameStatus === 'waiting' && 
           gameState.players.length >= 1 && 
           gameState.players.every((p: Player) => p.isReady);
  };

  if (!gameState || !currentPlayer) {
    return (
      <div className="min-h-screen mystery-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300">加载中...</p>
          <p className="text-sm text-gray-500 mt-2">游戏状态: {gameState ? '已加载' : '未加载'}</p>
          <p className="text-sm text-gray-500">当前玩家: {currentPlayer ? '已加载' : '未加载'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mystery-bg">
      {/* Header */}
      <div className="mystery-card border-b-0 rounded-b-none">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLeaveRoom}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
                <span>返回</span>
              </button>
              <div className="h-6 w-px bg-gray-600"></div>
              <div className="flex items-center space-x-2">
                <Users size={20} className="text-purple-400" />
                <span className="text-sm text-gray-300">游戏大厅</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock size={16} className="text-orange-400" />
                <span className="text-sm font-medium text-orange-300">{gameState.timeLimit} 分钟</span>
              </div>
                              <div className="flex items-center space-x-2">
                  <Users size={16} className="text-blue-400" />
                  <span className="text-sm font-medium text-blue-300">
                    {gameState.players.length}/4
                  </span>
                </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：房间信息 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 房间信息卡片 */}
            <div className="mystery-card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-purple-300">
                <Settings size={20} className="mr-2" />
                房间信息
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">房间号</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-purple-300">{roomId}</span>
                    <button
                      onClick={handleCopyRoomId}
                      className="p-1 text-gray-400 hover:text-purple-400 transition-colors"
                      title="复制房间号"
                    >
                      {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">房主</span>
                  <span className="text-gray-200">
                    {gameState.players.find((p: Player) => p.isHost)?.name || '未知'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">时间限制</span>
                  <span className="text-gray-200">{gameState.timeLimit} 分钟</span>
                </div>
                                 <div className="flex items-center justify-between">
                   <span className="text-gray-400">最大玩家</span>
                   <span className="text-gray-200">4 人</span>
                 </div>
              </div>
            </div>

            {/* 游戏规则 */}
            <div className="mystery-card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-blue-300">
                <Sparkles size={20} className="mr-2" />
                游戏规则
              </h3>
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p>提出可以用"是"或"否"回答的问题</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p>AI回答：是 / 不是 / 无关 / 你很接近了</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p>每名玩家 5 点血量，只有请求提示才消耗</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p>尝试猜测完整故事来获胜</p>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：玩家列表和操作 */}
          <div className="lg:col-span-2">
            <div className="mystery-card p-6">
              <div className="flex items-center justify-between mb-6">
                                 <h3 className="text-xl font-semibold flex items-center text-green-300">
                   <Users size={24} className="mr-3" />
                   玩家列表 ({gameState.players.length}/4)
                 </h3>
                 {gameState.players.length < 4 && (
                  <div className="flex items-center space-x-2 text-gray-400">
                    <UserPlus size={16} />
                    <span className="text-sm">等待更多玩家加入...</span>
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-8">
                {gameState.players.map((player) => (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                      player.id === currentPlayer.id 
                        ? 'bg-purple-900/20 border-purple-400/30' 
                        : 'bg-gray-800/20 border-gray-600/30'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {player.isHost && <Crown size={16} className="text-yellow-400" />}
                        <span className="font-medium text-gray-200">{player.name}</span>
                        {player.id === currentPlayer.id && (
                          <span className="text-xs bg-purple-600 text-purple-200 px-2 py-1 rounded-full">
                            你
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Heart size={14} className="text-red-400" />
                        <span className="text-sm text-gray-300">{player.health}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {player.isReady ? (
                          <div className="flex items-center space-x-1 text-green-400">
                            <CheckCircle size={16} />
                            <span className="text-sm">已准备</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1 text-gray-400">
                            <XCircle size={16} />
                            <span className="text-sm">未准备</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 操作按钮 */}
              <div className="flex flex-col sm:flex-row gap-4">
                {!currentPlayer.isReady ? (
                  <button
                    onClick={handleToggleReady}
                    className="flex-1 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                  >
                    <CheckCircle size={20} />
                    <span>准备就绪</span>
                  </button>
                ) : (
                  <button
                    onClick={handleToggleReady}
                    className="flex-1 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                  >
                    <XCircle size={20} />
                    <span>取消准备</span>
                  </button>
                )}

                {isHost && (
                  <button
                    onClick={handleStartGame}
                    disabled={!canStartGame() || isStarting}
                    className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                  >
                    {isStarting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>开始中...</span>
                      </>
                    ) : (
                      <>
                        <Play size={20} />
                        <span>开始游戏</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* 开始游戏提示 */}
              {isHost && !canStartGame() && (
                <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                  <div className="flex items-center space-x-2 text-yellow-300">
                    <Sparkles size={16} />
                    <span className="text-sm">
                      {gameState.players.length < 1 
                        ? '等待玩家加入...' 
                        : '所有玩家准备就绪后才能开始游戏'
                      }
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 