'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Users, Clock, Play, LogIn } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [formData, setFormData] = useState({
    hostName: '',
    roomId: '',
    playerName: '',
    maxPlayers: 4,
    timeLimit: 30
  });

  const handleCreateRoom = async () => {
    console.log('开始创建房间...');
    console.log('表单数据:', formData);
    
    if (!formData.hostName.trim()) {
      alert('请输入房主名称');
      return;
    }

    setIsCreating(true);
    try {
      console.log('发送 API 请求...');
      const response = await fetch('/api/create-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hostName: formData.hostName,
          maxPlayers: formData.maxPlayers,
          timeLimit: formData.timeLimit
        }),
      });

      console.log('API 响应状态:', response.status);
      const data = await response.json();
      console.log('API 响应数据:', data);
      
      if (response.ok) {
        console.log('创建成功，跳转到游戏大厅...');
        const gameStateParam = encodeURIComponent(JSON.stringify(data.gameState));
        router.push(`/lobby/${data.roomId}?playerId=${data.gameState.players[0].id}&gameState=${gameStateParam}`);
      } else {
        console.error('创建失败:', data.error);
        alert(data.error || '创建房间失败');
      }
    } catch (error) {
      console.error('创建房间时发生错误:', error);
      alert('创建房间失败');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!formData.roomId.trim() || !formData.playerName.trim()) {
      alert('请输入房间号和玩家名称');
      return;
    }

    setIsJoining(true);
    try {
      const response = await fetch('/api/join-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: formData.roomId,
          playerName: formData.playerName
        }),
      });

      const data = await response.json();
      if (response.ok) {
        const gameStateParam = encodeURIComponent(JSON.stringify(data.gameState));
        router.push(`/lobby/${data.gameState.roomId}?playerId=${data.player.id}&gameState=${gameStateParam}`);
      } else {
        alert(data.error || '加入房间失败');
      }
    } catch (error) {
      console.error('Error joining room:', error);
      alert('加入房间失败');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-gray-800 mb-4">
            海龟汤
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            逻辑推理游戏 - 与 AI 主持人一起探索谜题
          </p>
          
          {/* Game Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">多人游戏</h3>
              <p className="text-gray-600">支持 1-4 名玩家在线参与</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">血量系统</h3>
              <p className="text-gray-600">每名玩家 5 点血量，提问消耗血量</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <Clock className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">限时挑战</h3>
              <p className="text-gray-600">30 分钟时间限制，增加紧张感</p>
            </div>
          </div>
        </div>

        {/* Game Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Room */}
          <div className="bg-white rounded-xl shadow-xl p-8">
            <div className="flex items-center mb-6">
              <Play className="w-8 h-8 text-blue-500 mr-3" />
              <h2 className="text-2xl font-bold text-gray-800">创建游戏</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  房主名称
                </label>
                <input
                  type="text"
                  value={formData.hostName}
                  onChange={(e) => setFormData({ ...formData, hostName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="输入你的名字"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    最大玩家数
                  </label>
                  <select
                    value={formData.maxPlayers}
                    onChange={(e) => setFormData({ ...formData, maxPlayers: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={2}>2 人</option>
                    <option value={3}>3 人</option>
                    <option value={4}>4 人</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    时间限制 (分钟)
                  </label>
                  <select
                    value={formData.timeLimit}
                    onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={15}>15 分钟</option>
                    <option value={30}>30 分钟</option>
                    <option value={45}>45 分钟</option>
                    <option value={60}>60 分钟</option>
                  </select>
                </div>
              </div>
              
              <button
                onClick={handleCreateRoom}
                disabled={isCreating}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
              >
                {isCreating ? '创建中...' : '创建游戏'}
              </button>
            </div>
          </div>

          {/* Join Room */}
          <div className="bg-white rounded-xl shadow-xl p-8">
            <div className="flex items-center mb-6">
              <LogIn className="w-8 h-8 text-green-500 mr-3" />
              <h2 className="text-2xl font-bold text-gray-800">加入游戏</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  房间号
                </label>
                <input
                  type="text"
                  value={formData.roomId}
                  onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="输入 8 位房间号"
                  maxLength={8}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  玩家名称
                </label>
                <input
                  type="text"
                  value={formData.playerName}
                  onChange={(e) => setFormData({ ...formData, playerName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="输入你的名字"
                />
              </div>
              
              <button
                onClick={handleJoinRoom}
                disabled={isJoining}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
              >
                {isJoining ? '加入中...' : '加入游戏'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>© 2024 海龟汤逻辑推理游戏. 享受推理的乐趣！</p>
        </div>
      </div>
    </div>
  );
} 