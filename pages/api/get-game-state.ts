import { NextApiRequest, NextApiResponse } from 'next';
import { gameStore } from '@/lib/gameStore';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { roomId } = req.query;

    if (!roomId || typeof roomId !== 'string') {
      return res.status(400).json({ error: 'Room ID is required' });
    }

    const gameState = gameStore.getGame(roomId);
    
    if (!gameState) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.status(200).json(gameState);
  } catch (error) {
    console.error('Error getting game state:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 