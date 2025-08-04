'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { 
  Trophy, 
  Heart, 
  ArrowLeft, 
  Home, 
  RefreshCw,
  Crown,
  Users,
  Clock,
  Sparkles,
  Star,
  Award,
  Target,
  Lightbulb
} from 'lucide-react';

export default function ResultPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = params?.roomId as string;
  const winnerId = searchParams?.get('winner');
  const story = searchParams?.get('story');

  const handleBackToHome = () => {
    router.push('/');
  };

  const handlePlayAgain = () => {
    router.push('/');
  };

  const isWinner = winnerId && winnerId !== 'none';

  return (
    <div className="min-h-screen mystery-bg">
      {/* Header */}
      <div className="mystery-card border-b-0 rounded-b-none">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToHome}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
                <span>返回首页</span>
              </button>
              <div className="h-6 w-px bg-gray-600"></div>
              <div className="flex items-center space-x-2">
                <Trophy size={20} className="text-yellow-400" />
                <span className="text-sm text-gray-300">游戏结果</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          {/* 胜利/失败标题 */}
          <div className="mb-8">
            {isWinner ? (
              <div className="flex items-center justify-center space-x-4 mb-4">
                <Trophy size={48} className="text-yellow-400 animate-pulse" />
                <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                  恭喜获胜！
                </h1>
                <Trophy size={48} className="text-yellow-400 animate-pulse delay-500" />
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-4 mb-4">
                <Target size={48} className="text-gray-400" />
                <h1 className="text-5xl font-bold text-gray-300">
                  游戏结束
                </h1>
                <Target size={48} className="text-gray-400" />
              </div>
            )}
            <p className="text-xl text-gray-400">
              {isWinner ? '你成功解开了谜题！' : '时间到了，谜底揭晓...'}
            </p>
          </div>

          {/* 汤底展示 */}
          <div className="mystery-card p-8 mb-8">
            <div className="flex items-center justify-center mb-6">
              <Lightbulb size={32} className="text-yellow-400 mr-4" />
              <h2 className="text-3xl font-bold text-yellow-300">完整汤底</h2>
              <Lightbulb size={32} className="text-yellow-400 ml-4" />
            </div>
            <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-600/30 rounded-lg p-6">
              <p className="text-lg text-yellow-200 leading-relaxed">
                {story ? decodeURIComponent(story) : '汤底内容加载中...'}
              </p>
            </div>
          </div>

          {/* 游戏统计 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="mystery-card p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <Clock size={32} className="text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-blue-300 mb-2">游戏时长</h3>
              <p className="text-2xl font-bold text-blue-200">30 分钟</p>
            </div>
            
            <div className="mystery-card p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <Users size={32} className="text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-green-300 mb-2">参与玩家</h3>
              <p className="text-2xl font-bold text-green-200">4 人</p>
            </div>
            
            <div className="mystery-card p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <Lightbulb size={32} className="text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-purple-300 mb-2">发现线索</h3>
              <p className="text-2xl font-bold text-purple-200">3 条</p>
            </div>
          </div>

          {/* 玩家表现 */}
          <div className="mystery-card p-8 mb-8">
            <h3 className="text-2xl font-bold text-center mb-6 flex items-center justify-center text-purple-300">
              <Award size={28} className="mr-3" />
              玩家表现
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-900/20 border border-green-600/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <Crown size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-green-300">房主</p>
                      <p className="text-sm text-green-400">提问: 8次 | 线索: 2条</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star size={16} className="text-yellow-400" />
                    <span className="text-sm text-yellow-300">MVP</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-medium">
                      P
                    </div>
                    <div>
                      <p className="font-medium text-blue-300">玩家2</p>
                      <p className="text-sm text-blue-400">提问: 5次 | 线索: 1条</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-purple-900/20 border border-purple-600/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-medium">
                      P
                    </div>
                    <div>
                      <p className="font-medium text-purple-300">玩家3</p>
                      <p className="text-sm text-purple-400">提问: 3次 | 线索: 0条</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-800/20 border border-gray-600/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center text-white font-medium">
                      P
                    </div>
                    <div>
                      <p className="font-medium text-gray-300">玩家4</p>
                      <p className="text-sm text-gray-400">提问: 2次 | 线索: 0条</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 成就徽章 */}
          {isWinner && (
            <div className="mystery-card p-8 mb-8">
              <h3 className="text-2xl font-bold text-center mb-6 flex items-center justify-center text-yellow-300">
                <Star size={28} className="mr-3" />
                成就徽章
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Trophy size={32} className="text-white" />
                  </div>
                  <h4 className="font-semibold text-yellow-300 mb-1">谜题大师</h4>
                  <p className="text-sm text-yellow-400">成功解开谜题</p>
                </div>
                
                <div className="text-center p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Lightbulb size={32} className="text-white" />
                  </div>
                  <h4 className="font-semibold text-blue-300 mb-1">线索猎人</h4>
                  <p className="text-sm text-blue-400">发现最多线索</p>
                </div>
                
                <div className="text-center p-4 bg-green-900/20 border border-green-600/30 rounded-lg">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Target size={32} className="text-white" />
                  </div>
                  <h4 className="font-semibold text-green-300 mb-1">精准提问</h4>
                  <p className="text-sm text-green-400">提问质量最高</p>
                </div>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handlePlayAgain}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <RefreshCw size={20} />
              <span>再来一局</span>
            </button>
            
            <button
              onClick={handleBackToHome}
              className="px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <Home size={20} />
              <span>返回首页</span>
            </button>
          </div>
        </div>
      </div>

      {/* 装饰元素 */}
      <div className="fixed inset-0 pointer-events-none opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-yellow-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-blue-500 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
    </div>
  );
} 