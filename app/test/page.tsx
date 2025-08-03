'use client';

import { useState } from 'react';

export default function TestPage() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testCreateRoom = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/create-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hostName: '测试用户',
          maxPlayers: 4,
          timeLimit: 30
        }),
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`错误: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">API 测试页面</h1>
        
        <button
          onClick={testCreateRoom}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg mb-6"
        >
          {loading ? '测试中...' : '测试创建房间 API'}
        </button>
        
        {result && (
          <div className="bg-white p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">API 响应:</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 