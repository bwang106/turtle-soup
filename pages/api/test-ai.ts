import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    // 验证API密钥格式
    if (!apiKey.startsWith('sk-')) {
      return res.status(400).json({ error: 'Invalid API key format' });
    }

    // 测试OpenAI API连接
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '你是一个海龟汤游戏的主持人。请简单回答"是"或"不是"。'
          },
          {
            role: 'user',
            content: '测试问题：这是一个测试吗？'
          }
        ],
        max_tokens: 10,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(400).json({ 
        error: 'OpenAI API连接失败', 
        details: errorData.error?.message || '未知错误' 
      });
    }

    const data = await response.json();
    const answer = data.choices[0].message.content.trim();

    res.status(200).json({ 
      success: true, 
      message: 'AI连接测试成功',
      testAnswer: answer,
      model: data.model
    });
  } catch (error) {
    console.error('AI测试失败:', error);
    res.status(500).json({ 
      error: 'AI测试失败',
      details: error instanceof Error ? error.message : '未知错误'
    });
  }
} 