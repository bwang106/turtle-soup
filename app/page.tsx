'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Users, Clock, Play, LogIn, Sparkles, Zap, Crown, Settings, Bot } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [openaiKey, setOpenaiKey] = useState('');
  const [isConfiguring, setIsConfiguring] = useState(false);
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
          action: 'join-room',
          roomId: formData.roomId,
          data: { playerName: formData.playerName }
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

  const handleConfigureAI = async () => {
    if (!openaiKey.trim()) {
      alert('请输入OpenAI API密钥');
      return;
    }

    setIsConfiguring(true);
    try {
      const response = await fetch('/api/configure-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: openaiKey.trim() }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('AI配置成功！现在游戏将使用GPT-3.5进行智能回答。');
        setShowAIConfig(false);
        setOpenaiKey('');
      } else {
        alert(data.error || 'AI配置失败');
      }
    } catch (error) {
      console.error('配置AI失败:', error);
      alert('AI配置失败');
    } finally {
      setIsConfiguring(false);
    }
  };

  return (
    <div className="min-h-screen mystery-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* 背景装饰元素 */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-indigo-500 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="max-w-6xl w-full relative z-10">
        {/* 主标题区域 */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="w-12 h-12 text-purple-400 mr-4 animate-pulse" />
            <h1 className="text-7xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              海龟汤
            </h1>
            <Sparkles className="w-12 h-12 text-purple-400 ml-4 animate-pulse delay-500" />
          </div>
          <p className="text-2xl text-gray-300 mb-8 typewriter">
            逻辑推理游戏 - 与 AI 主持人一起探索谜题
          </p>
          
          {/* AI配置按钮 */}
          <div className="mb-8">
            <button
              onClick={() => setShowAIConfig(!showAIConfig)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105"
            >
              <Bot size={20} />
              <span>配置AI助手</span>
            </button>
          </div>

          {/* AI配置面板 */}
          {showAIConfig && (
            <div className="mystery-card p-6 max-w-md mx-auto mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-green-300">
                <Settings size={20} className="mr-2" />
                OpenAI API 配置
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    OpenAI API 密钥
                  </label>
                  <input
                    type="password"
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400 transition-all"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleConfigureAI}
                    disabled={isConfiguring}
                    className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                  >
                    {isConfiguring ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>配置中...</span>
                      </>
                    ) : (
                      <>
                        <Bot size={16} />
                        <span>配置AI</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowAIConfig(false)}
                    className="px-4 py-3 bg-gray-600 text-gray-200 rounded-lg hover:bg-gray-700 transition-all duration-300 transform hover:scale-105"
                  >
                    取消
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  配置后，游戏将使用GPT-3.5进行智能回答，提供更真实的游戏体验。
                </p>
              </div>
            </div>
          )}
          
          {/* 游戏特色展示 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="mystery-card p-8 text-center group hover:glow-effect">
              <Users className="w-16 h-16 text-purple-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold mb-3 text-purple-300">多人游戏</h3>
              <p className="text-gray-400">支持 1-4 名玩家在线参与，体验团队推理的乐趣</p>
            </div>
            <div className="mystery-card p-8 text-center group hover:glow-effect">
              <Heart className="w-16 h-16 text-red-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold mb-3 text-red-300">血量系统</h3>
              <p className="text-gray-400">每名玩家 5 点血量，策略性地使用提示和猜测</p>
            </div>
            <div className="mystery-card p-8 text-center group hover:glow-effect">
              <Clock className="w-16 h-16 text-green-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold mb-3 text-green-300">限时挑战</h3>
              <p className="text-gray-400">30 分钟时间限制，增加紧张感和策略性</p>
            </div>
          </div>
        </div>

        {/* 游戏选项区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* 创建房间 */}
          <div className="mystery-card p-8 group hover:glow-effect">
            <div className="flex items-center mb-8">
              <Crown className="w-10 h-10 text-yellow-400 mr-4" />
              <h2 className="text-3xl font-bold text-yellow-300">创建游戏</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  房主名称
                </label>
                <input
                  type="text"
                  value={formData.hostName}
                  onChange={(e) => setFormData({ ...formData, hostName: e.target.value })}
                  className="w-full px-6 py-4 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 transition-all"
                  placeholder="输入你的名字"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    最大玩家数
                  </label>
                  <select
                    value={formData.maxPlayers}
                    onChange={(e) => setFormData({ ...formData, maxPlayers: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                  >
                    <option value={2}>2 人</option>
                    <option value={3}>3 人</option>
                    <option value={4}>4 人</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    时间限制
                  </label>
                  <select
                    value={formData.timeLimit}
                    onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                  >
                    <option value={15}>15 分钟</option>
                    <option value={30}>30 分钟</option>
                    <option value={45}>45 分钟</option>
                  </select>
                </div>
              </div>
              
              <button
                onClick={handleCreateRoom}
                disabled={isCreating}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    创建中...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    创建房间
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 加入房间 */}
          <div className="mystery-card p-8 group hover:glow-effect">
            <div className="flex items-center mb-8">
              <LogIn className="w-10 h-10 text-blue-400 mr-4" />
              <h2 className="text-3xl font-bold text-blue-300">加入游戏</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  房间号
                </label>
                <input
                  type="text"
                  value={formData.roomId}
                  onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                  className="w-full px-6 py-4 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all"
                  placeholder="输入房间号"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  玩家名称
                </label>
                <input
                  type="text"
                  value={formData.playerName}
                  onChange={(e) => setFormData({ ...formData, playerName: e.target.value })}
                  className="w-full px-6 py-4 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all"
                  placeholder="输入你的名字"
                />
              </div>
              
              <button
                onClick={handleJoinRoom}
                disabled={isJoining}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
              >
                {isJoining ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    加入中...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    加入房间
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 底部装饰 */}
        <div className="text-center mt-16">
          <p className="text-gray-500 text-sm">
            准备好挑战你的逻辑推理能力了吗？
          </p>
        </div>
      </div>
    </div>
  );
} 