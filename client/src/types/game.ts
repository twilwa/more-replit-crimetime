// Player type
export interface Player {
  id: number;
  username: string;
  crimeCoin: number;
  funCoin: number;
  reputation: string;
  level: number;
  experience: number;
  nextLevelExperience: number;
  successfulMissions: number;
  totalMissions: number;
  totalEarnings: number;
  biggestHeist: number;
  dailyMissions: number;
  notoriety: number;
  inventory: any[];
}

// Mission type
export interface Mission {
  id: number;
  name: string;
  description: string;
  difficulty: string;
  cost: number;
  reward: string;
  successRate: string;
  timeRequired: string;
  image: string;
}

// Leaderboard entry type
export interface LeaderboardEntry {
  id: number;
  username: string;
  crimeEarned: number;
  biggestHeist: number;
  notoriety: number;
  rank: number;
}

// Game state type
export interface GameState {
  player: Player;
  missions: Mission[];
  leaderboard: LeaderboardEntry[];
  isWalletConnected: boolean;
}

// Mission action type
export interface MissionAction {
  name: string;
  affectedStat: string;
  bonus: number;
  narrative: string;
}

// Mission rewards type
export interface MissionRewards {
  crimeCoin: number;
  funCoin: number;
  reputationGain: number;
  bonusItems?: { name: string; icon: string }[];
}

// Mission penalties type
export interface MissionPenalties {
  crimeCoinLost: number;
  funCoinGained: number;
  lessonLearned: string;
}
