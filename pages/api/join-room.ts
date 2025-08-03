import { NextApiRequest, NextApiResponse } from 'next';
import { gameStore } from '@/lib/gameStore';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { roomId, playerName } = req.body;

    if (!roomId || !playerName) {
      return res.status(400).json({ error: 'Room ID and player name are required' });
    }

    const game = gameStore.getGame(roomId);
    if (!game) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (game.gameStatus !== 'waiting') {
      return res.status(400).json({ error: 'Game has already started' });
    }

    if (game.players.length >= 4) {
      return res.status(400).json({ error: 'Room is full' });
    }

    const player = gameStore.joinGame(roomId, playerName);
    if (!player) {
      return res.status(400).json({ error: 'Failed to join room' });
    }

    res.status(200).json({
      player,
      gameState: game,
      message: 'Joined room successfully'
    });
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 