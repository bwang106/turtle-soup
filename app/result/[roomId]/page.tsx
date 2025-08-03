'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Trophy, BookOpen, Home, Users, Clock, Heart } from 'lucide-react';

export default function ResultPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const winnerId = searchParams.get('winner');
  const story = searchParams.get('story');

  const [gameStats, setGameStats] = useState({
    totalPlayers: 4,
    gameDuration: '15:30',
    totalQuestions: 12,
    hintsUsed: 3
  });

  const isWinner = winnerId && winnerId !== 'none';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-6">
            {isWinner ? (
              <div className="flex items-center justify-center mb-4">
                <Trophy className="w-16 h-16 text-yellow-500 mr-4" />
                <h1 className="text-4xl font-bold text-gray-800">游戏结束</h1>
              </div>
            ) : (
              <div className="flex items-center justify-center mb-4">
                <BookOpen className="w-16 h-16 text-blue-500 mr-4" />
                <h1 className="text-4xl font-bold text-gray-800">游戏结束</h1>
              </div>
            )}
            
            <p className="text-xl text-gray-600">
              {isWinner 
                ? '恭喜！有人成功猜出了答案！'
                : '时间到！没有人猜出正确答案。'
              }
            </p>
          </div>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-xl p-6 text-center">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800">参与玩家</h3>
            <p className="text-2xl font-bold text-blue-600">{gameStats.totalPlayers}</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-xl p-6 text-center">
            <Clock className="w-8 h-8 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800">游戏时长</h3>
            <p className="text-2xl font-bold text-green-600">{gameStats.gameDuration}</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-xl p-6 text-center">
            <BookOpen className="w-8 h-8 text-purple-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800">总提问数</h3>
            <p className="text-2xl font-bold text-purple-600">{gameStats.totalQuestions}</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-xl p-6 text-center">
            <Heart className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800">提示使用</h3>
            <p className="text-2xl font-bold text-red-600">{gameStats.hintsUsed}</p>
          </div>
        </div>

        {/* Full Story */}
        <div className="bg-white rounded-xl shadow-xl p-8 mb-8">
          <div className="flex items-center mb-6">
            <BookOpen className="w-8 h-8 text-blue-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-800">完整故事</h2>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-l-4 border-blue-500">
            <p className="text-lg text-gray-700 leading-relaxed">
              {story ? decodeURIComponent(story) : 
                "这是一个关于逻辑推理的故事。玩家需要通过提问来收集线索，最终猜出故事的完整真相。每个细节都可能包含重要的信息，需要仔细分析和推理。"
              }
            </p>
          </div>
        </div>

        {/* Game Analysis */}
        <div className="bg-white rounded-xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">游戏分析</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">游戏亮点</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>玩家积极参与，提问质量较高</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>团队合作良好，信息共享及时</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>逻辑推理能力得到充分展现</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">改进建议</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>可以尝试更复杂的故事背景</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>增加更多线索和提示机制</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>优化时间分配和血量管理</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 flex items-center justify-center"
          >
            <Home className="w-5 h-5 mr-2" />
            返回主页
          </button>
          
          <button
            onClick={() => router.push(`/lobby/${roomId}`)}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 flex items-center justify-center"
          >
            <Users className="w-5 h-5 mr-2" />
            再来一局
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>感谢参与海龟汤逻辑推理游戏！</p>
          <p className="text-sm mt-2">期待下次再战！</p>
        </div>
      </div>
    </div>
  );
} 