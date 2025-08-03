'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { Player, GameState } from '@/types/game';
import { Users, Play, Copy, ArrowLeft, Crown, Heart } from 'lucide-react';

export default function LobbyPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const playerId = searchParams.get('playerId');

  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const initSocket = async () => {
      console.log('初始化 Socket.IO 连接...');
      console.log('房间ID:', roomId);
      console.log('玩家ID:', playerId);
      
      // 先初始化 Socket.IO 服务器
      await fetch('/api/socket');
      
      const newSocket = io();
      setSocket(newSocket);

      // 从 URL 参数获取初始游戏状态
      const urlParams = new URLSearchParams(window.location.search);
      const gameStateParam = urlParams.get('gameState');
      
      console.log('URL 参数中的游戏状态:', gameStateParam ? '存在' : '不存在');
      
      if (gameStateParam) {
        try {
          const initialGameState = JSON.parse(decodeURIComponent(gameStateParam));
          console.log('解析的游戏状态:', initialGameState);
          setGameState(initialGameState);
          
          const player = initialGameState.players.find(p => p.id === playerId);
          if (player) {
            console.log('找到玩家:', player);
            setCurrentPlayer(player);
            // 加入房间
            newSocket.emit('join-room', roomId, player.name);
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
            
            const player = gameState.players.find(p => p.id === playerId);
            if (player) {
              console.log('找到玩家:', player);
              setCurrentPlayer(player);
              newSocket.emit('join-room', roomId, player.name);
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

      // Socket 事件监听
      newSocket.on('player-joined', (player: Player) => {
        console.log('Player joined:', player);
      });

      newSocket.on('game-state-updated', (state: GameState) => {
        console.log('Game state updated:', state);
        setGameState(state);
        const player = state.players.find(p => p.id === playerId);
        if (player) {
          setCurrentPlayer(player);
        }
      });

      newSocket.on('game-started', (state: GameState) => {
        router.push(`/game/${roomId}?playerId=${playerId}`);
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

  const handleToggleReady = () => {
    if (socket && currentPlayer) {
      socket.emit('toggle-ready', roomId, currentPlayer.id);
    }
  };

  const handleStartGame = () => {
    if (socket && currentPlayer?.isHost) {
      setIsStarting(true);
      socket.emit('start-game', roomId);
    }
  };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeaveRoom = () => {
    if (socket && currentPlayer) {
      socket.emit('leave-room', roomId, currentPlayer.id);
    }
    router.push('/');
  };

  const canStartGame = gameState?.players.length >= 1 && 
    gameState.players.every(p => p.isReady) &&
    currentPlayer?.isHost;

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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ArrowLeft 
                className="w-6 h-6 text-gray-600 mr-4 cursor-pointer hover:text-gray-800"
                onClick={handleLeaveRoom}
              />
              <h1 className="text-3xl font-bold text-gray-800">游戏大厅</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">房间号</p>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-lg font-bold text-blue-600">{roomId}</span>
                  <button
                    onClick={handleCopyRoomId}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="复制房间号"
                  >
                    <Copy className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                {copied && (
                  <p className="text-xs text-green-600 mt-1">已复制</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Game Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-xl p-6">
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 text-blue-500 mr-2" />
              <h3 className="text-lg font-semibold">玩家列表</h3>
            </div>
            <p className="text-gray-600">
              {gameState.players.length} / 4 人
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-xl p-6">
            <div className="flex items-center mb-4">
              <Heart className="w-6 h-6 text-red-500 mr-2" />
              <h3 className="text-lg font-semibold">初始血量</h3>
            </div>
            <p className="text-gray-600">
              {gameState.maxHealth} 点
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-xl p-6">
            <div className="flex items-center mb-4">
              <Play className="w-6 h-6 text-green-500 mr-2" />
              <h3 className="text-lg font-semibold">时间限制</h3>
            </div>
            <p className="text-gray-600">
              {gameState.timeLimit} 分钟
            </p>
          </div>
        </div>

        {/* Players List */}
        <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">玩家列表</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gameState.players.map((player) => (
              <div
                key={player.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  player.id === currentPlayer.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                      {player.isHost && (
                        <Crown className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1" />
                      )}
                    </div>
                    
                    <div>
                      <p className="font-semibold text-gray-800">
                        {player.name}
                        {player.id === currentPlayer.id && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                            你
                          </span>
                        )}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex space-x-1">
                          {Array.from({ length: gameState.maxHealth }).map((_, i) => (
                            <Heart
                              key={i}
                              className={`w-4 h-4 ${
                                i < player.health ? 'text-red-500 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {player.health}/{gameState.maxHealth}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {player.isReady ? (
                      <span className="text-green-600 text-sm font-medium">已准备</span>
                    ) : (
                      <span className="text-gray-500 text-sm">未准备</span>
                    )}
                    
                    {player.id === currentPlayer.id && !player.isReady && (
                      <button
                        onClick={handleToggleReady}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        准备
                      </button>
                    )}
                    
                    {player.id === currentPlayer.id && player.isReady && (
                      <button
                        onClick={handleToggleReady}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        取消
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {gameState.players.length < 4 && (
            <div className="mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-center text-gray-500">
                等待更多玩家加入...
              </p>
            </div>
          )}
        </div>

        {/* Game Controls */}
        <div className="bg-white rounded-xl shadow-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">游戏控制</h3>
              <p className="text-gray-600">
                {canStartGame 
                  ? '所有玩家已准备，可以开始游戏'
                  : '等待所有玩家准备就绪'
                }
              </p>
            </div>
            
            {currentPlayer.isHost && (
              <button
                onClick={handleStartGame}
                disabled={!canStartGame || isStarting}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 flex items-center"
              >
                <Play className="w-5 h-5 mr-2" />
                {isStarting ? '开始中...' : '开始游戏'}
              </button>
            )}
            
            {!currentPlayer.isHost && (
              <div className="text-gray-500">
                等待房主开始游戏
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 