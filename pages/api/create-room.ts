import { NextApiRequest, NextApiResponse } from 'next';
import { gameStore } from '../../lib/gameStore';
import { v4 as uuidv4 } from 'uuid';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { hostName, maxPlayers = 4, timeLimit = 30 } = req.body;

    if (!hostName) {
      return res.status(400).json({ error: 'Host name is required' });
    }

    const roomId = uuidv4().substring(0, 8);
    console.log('创建房间:', { roomId, hostName, maxPlayers, timeLimit });
    const gameState = gameStore.createGame(roomId, hostName, maxPlayers, timeLimit);
    console.log('房间创建后，游戏存储中的房间数量:', gameStore.getGamesCount());

    res.status(200).json({
      roomId,
      gameState,
      message: 'Room created successfully'
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 