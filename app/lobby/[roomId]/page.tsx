'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Player, GameState } from '@/types/game';
import { Users, Play, Copy, ArrowLeft, Crown, Heart } from 'lucide-react';

export default function LobbyPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = params?.roomId as string;
  const playerId = searchParams?.get('playerId');

  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [copied, setCopied] = useState(false);

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
            // 加入房间
            await joinRoom(player.name);
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
              await joinRoom(player.name);
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

  const joinRoom = async (playerName: string) => {
    try {
      const response = await fetch('/api/join-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'join-room',
          roomId,
          data: { playerName }
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setGameState(result.gameState);
          setCurrentPlayer(result.player);
        }
      }
    } catch (error) {
      console.error('加入房间失败:', error);
    }
  };

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
            roomId
          })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.gameState) {
            setGameState(result.gameState);
            const player = result.gameState.players.find((p: Player) => p.id === playerId);
            if (player) {
              setCurrentPlayer(player);
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
    
    // 这里可以添加切换准备状态的逻辑
    console.log('切换准备状态');
  };

  const handleStartGame = async () => {
    if (!currentPlayer?.isHost) return;
    
    setIsStarting(true);
    try {
      // 这里可以添加开始游戏的逻辑
      console.log('开始游戏');
      router.push(`/game/${roomId}?playerId=${playerId}`);
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
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    router.push('/');
  };

  const canStartGame = (gameState?.players?.length || 0) >= 1 && gameState?.players?.every((p: Player) => p.isReady) && currentPlayer?.isHost;

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
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleLeaveRoom}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回首页
          </button>
          <h1 className="text-2xl font-bold text-gray-800">游戏大厅</h1>
          <div className="w-20"></div>
        </div>

        {/* 房间信息 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">房间信息</h2>
            <button
              onClick={handleCopyRoomId}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Copy className="w-4 h-4 mr-1" />
              {copied ? '已复制' : '复制房间号'}
            </button>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">房间号</p>
            <p className="font-mono text-lg font-bold text-gray-800">{roomId}</p>
          </div>
        </div>

        {/* 玩家列表 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <Users className="w-5 h-5 mr-2 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-800">玩家列表</h2>
            <span className="ml-auto text-sm text-gray-500">
              {gameState?.players?.length || 0} / 4 人
            </span>
          </div>
          <div className="space-y-3">
            {gameState.players.map((player: Player) => (
              <div
                key={player.id}
                className={`flex items-center p-3 rounded-lg border ${
                  player.id === currentPlayer?.id
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center flex-1">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-800">{player.name}</span>
                      {player.isHost && <Crown className="w-4 h-4 ml-2 text-yellow-500" />}
                    </div>
                    <div className="flex items-center mt-1">
                      <Heart className="w-4 h-4 text-red-500 mr-1" />
                      <span className="text-sm text-gray-600">{player.health} 血量</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  {player.isReady ? (
                    <span className="text-green-600 text-sm font-medium">已准备</span>
                  ) : (
                    <span className="text-gray-500 text-sm">未准备</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-center space-x-4">
          {!currentPlayer.isHost && (
            <button
              onClick={handleToggleReady}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                currentPlayer.isReady
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-500 text-white hover:bg-gray-600'
              }`}
            >
              {currentPlayer.isReady ? '取消准备' : '准备'}
            </button>
          )}
          
          {currentPlayer.isHost && (
            <button
              onClick={handleStartGame}
              disabled={!canStartGame || isStarting}
              className={`px-8 py-3 rounded-lg font-medium transition-colors flex items-center ${
                canStartGame
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Play className="w-5 h-5 mr-2" />
              {isStarting ? '开始中...' : '开始游戏'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 