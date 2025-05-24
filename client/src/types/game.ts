// Item effects type
export interface ItemEffect {
  type: 'boost' | 'protection';
  stat: 'stealth' | 'intimidation' | 'speed' | 'luck';
  value: number;
}

// Inventory item type
export interface InventoryItem {
  id: number;
  name: string;
  description: string;
  category: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  icon: string;
  effects: ItemEffect[];
  equippable: boolean;
  equipped?: boolean;
  isNFT?: boolean;
  tokenId?: string;
}

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
  inventory: InventoryItem[];
}

// Mission type
export interface Mission {
  id: number;
  name: string;
  description: string;
  difficulty: string;
  cost: number;
  min_reward: number;
  max_reward: number;
  success_rate: number;
  time_required: string;
  image_url: string;
  
  // Frontend display properties (derived from backend data)
  reward?: string;
  successRate?: string;
  timeRequired?: string;
  image?: string;
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
  description?: string;
  risk?: number; // 0-100 risk level
  cooldown?: number; // turns before can be used again
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
