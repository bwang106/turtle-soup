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

    // 设置环境变量
    process.env.OPENAI_API_KEY = apiKey;

    // 重新初始化AI服务
    const { AIService } = await import('../../lib/aiService');
    const aiService = AIService.getInstance();
    aiService.setOpenAIKey(apiKey);

    res.status(200).json({ 
      success: true, 
      message: 'OpenAI API configured successfully' 
    });
  } catch (error) {
    console.error('配置AI服务失败:', error);
    res.status(500).json({ 
      error: 'Failed to configure AI service' 
    });
  }
} 