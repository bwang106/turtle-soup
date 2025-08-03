export interface Player {
  id: string;
  name: string;
  health: number;
  isReady: boolean;
  isHost: boolean;
  avatar?: string;
}

export interface GameState {
  roomId: string;
  players: Player[];
  currentTurn: string | null;
  gameStatus: 'waiting' | 'playing' | 'finished';
  soupStory: string;
  discoveredClues: Clue[];
  chatHistory: ChatMessage[];
  gameStartTime?: Date;
  maxHealth: number;
  timeLimit: number; // 分钟
}

export interface Clue {
  id: string;
  title: string;
  description: string;
  discoveredBy: string;
  discoveredAt: Date;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  type: 'question' | 'answer' | 'guess' | 'hint' | 'system';
  timestamp: Date;
  aiResponse?: string;
}

export interface QuestionResponse {
  answer: 'yes' | 'no' | 'irrelevant' | 'close';
  explanation?: string;
}

export interface GuessResult {
  isCorrect: boolean;
  message: string;
  fullStory?: string;
}

export interface HintResponse {
  hint: string;
  cost: number;
}

export interface CreateRoomRequest {
  hostName: string;
  maxPlayers: number;
  timeLimit: number;
}

export interface JoinRoomRequest {
  roomId: string;
  playerName: string;
}

export interface SubmitQuestionRequest {
  roomId: string;
  playerId: string;
  question: string;
}

export interface SubmitGuessRequest {
  roomId: string;
  playerId: string;
  guess: string;
}

export interface RequestHintRequest {
  roomId: string;
  playerId: string;
}

export interface SocketEvents {
  'player-joined': (player: Player) => void;
  'player-left': (playerId: string) => void;
  'game-started': (gameState: GameState) => void;
  'question-asked': (message: ChatMessage) => void;
  'ai-response': (response: QuestionResponse) => void;
  'guess-submitted': (message: ChatMessage) => void;
  'guess-result': (result: GuessResult) => void;
  'hint-requested': (hint: HintResponse) => void;
  'clue-discovered': (clue: Clue) => void;
  'player-health-changed': (playerId: string, health: number) => void;
  'game-ended': (winner: Player | null, fullStory: string) => void;
  'error': (message: string) => void;
} 