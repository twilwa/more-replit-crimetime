import { 
  User, InsertUser, 
  Player, InsertPlayer,
  Mission, InsertMission,
  Leaderboard, InsertLeaderboard,
  MissionHistory, InsertMissionHistory
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Player operations
  getPlayer(id: number): Promise<Player | undefined>;
  getDefaultPlayer(): Promise<Player>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayer(id: number, playerData: Partial<Player>): Promise<Player>;
  
  // Mission operations
  getMission(id: number): Promise<Mission | undefined>;
  getAllMissions(): Promise<Mission[]>;
  createMission(mission: InsertMission): Promise<Mission>;
  
  // Leaderboard operations
  getLeaderboard(period: string): Promise<Leaderboard[]>;
  updateLeaderboard(entry: InsertLeaderboard): Promise<Leaderboard>;
  
  // Mission history operations
  recordMissionHistory(
    playerId: number,
    missionId: number,
    success: boolean,
    crimeCoinChange: number,
    funCoinChange: number,
    experienceGained?: number
  ): Promise<MissionHistory>;
  getMissionHistory(playerId: number): Promise<MissionHistory[]>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private players: Map<number, Player>;
  private missions: Map<number, Mission>;
  private leaderboardEntries: Map<number, Leaderboard>;
  private missionHistories: Map<number, MissionHistory>;
  
  private userIdCounter: number;
  private playerIdCounter: number;
  private missionIdCounter: number;
  private leaderboardIdCounter: number;
  private missionHistoryIdCounter: number;

  constructor() {
    this.users = new Map();
    this.players = new Map();
    this.missions = new Map();
    this.leaderboardEntries = new Map();
    this.missionHistories = new Map();
    
    this.userIdCounter = 1;
    this.playerIdCounter = 1;
    this.missionIdCounter = 1;
    this.leaderboardIdCounter = 1;
    this.missionHistoryIdCounter = 1;
    
    // Initialize with some sample data
    this.initializeData();
  }

  // Initialize sample data
  private initializeData(): void {
    // Create default user
    const defaultUser: User = {
      id: this.userIdCounter++,
      username: "Player",
      password: "hashed_password", // In a real app, this would be hashed
      wallet_address: null
    };
    this.users.set(defaultUser.id, defaultUser);
    
    // Create default player
    const defaultPlayer: Player = {
      id: this.playerIdCounter++,
      user_id: defaultUser.id,
      crime_coin: 1337,
      fun_coin: 42,
      reputation: "Rookie Thief",
      level: 3,
      experience: 350,
      successful_missions: 21,
      total_missions: 29,
      total_earnings: 4269,
      biggest_heist: 420,
      daily_missions: 3,
      notoriety: 1,
      inventory: []
    };
    this.players.set(defaultPlayer.id, defaultPlayer);
    
    // Create sample missions
    const missions: Mission[] = [
      {
        id: this.missionIdCounter++,
        name: "Street Tagger",
        description: "Tag a rival gang's territory with your crew's logo. Easy money, low risk.",
        difficulty: "Easy",
        cost: 1,
        min_reward: 2,
        max_reward: 5,
        success_rate: 95,
        time_required: "10 min",
        image_url: "https://images.unsplash.com/photo-1569880153113-76e33fc52d5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
      },
      {
        id: this.missionIdCounter++,
        name: "Corner Store Heist",
        description: "Rob the local corner store. Classic risk, decent reward. Watch for security cameras!",
        difficulty: "Medium",
        cost: 10,
        min_reward: 20,
        max_reward: 40,
        success_rate: 75,
        time_required: "30 min",
        image_url: "https://images.unsplash.com/photo-1616469829167-0bd76a80c913?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
      },
      {
        id: this.missionIdCounter++,
        name: "Crypto Wallet Hack",
        description: "Hack into a forgotten crypto wallet. High-tech crime, high rewards, but risky.",
        difficulty: "Hard",
        cost: 50,
        min_reward: 100,
        max_reward: 300,
        success_rate: 45,
        time_required: "2 hours",
        image_url: "https://images.unsplash.com/photo-1633265486501-0cf524a07213?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
      }
    ];
    
    missions.forEach(mission => {
      this.missions.set(mission.id, mission);
    });
    
    // Create sample leaderboard entries
    const leaderboardEntries: Leaderboard[] = [
      {
        id: this.leaderboardIdCounter++,
        player_id: 101, // Different from our default player
        crime_earned: 42069,
        biggest_heist: 15000,
        notoriety: 5,
        rank: 1,
        period: "day"
      },
      {
        id: this.leaderboardIdCounter++,
        player_id: 102,
        crime_earned: 31337,
        biggest_heist: 12000,
        notoriety: 4,
        rank: 2,
        period: "day"
      },
      {
        id: this.leaderboardIdCounter++,
        player_id: 103,
        crime_earned: 28456,
        biggest_heist: 9800,
        notoriety: 3,
        rank: 3,
        period: "day"
      }
    ];
    
    leaderboardEntries.forEach(entry => {
      this.leaderboardEntries.set(entry.id, entry);
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Player operations
  async getPlayer(id: number): Promise<Player | undefined> {
    return this.players.get(id);
  }

  async getDefaultPlayer(): Promise<Player> {
    // Return the first player (our default player)
    const player = this.players.get(1);
    if (!player) {
      throw new Error("Default player not found");
    }
    return player;
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const id = this.playerIdCounter++;
    const player: Player = { ...insertPlayer, id };
    this.players.set(id, player);
    return player;
  }

  async updatePlayer(id: number, playerData: Partial<Player>): Promise<Player> {
    const player = await this.getPlayer(id);
    if (!player) {
      throw new Error(`Player with ID ${id} not found`);
    }
    
    const updatedPlayer = { ...player, ...playerData };
    this.players.set(id, updatedPlayer);
    return updatedPlayer;
  }
  
  // Mission operations
  async getMission(id: number): Promise<Mission | undefined> {
    return this.missions.get(id);
  }

  async getAllMissions(): Promise<Mission[]> {
    return Array.from(this.missions.values());
  }

  async createMission(insertMission: InsertMission): Promise<Mission> {
    const id = this.missionIdCounter++;
    const mission: Mission = { ...insertMission, id };
    this.missions.set(id, mission);
    return mission;
  }
  
  // Leaderboard operations
  async getLeaderboard(period: string): Promise<Leaderboard[]> {
    // Filter by period and sort by rank
    return Array.from(this.leaderboardEntries.values())
      .filter(entry => entry.period === period)
      .sort((a, b) => a.rank - b.rank);
  }

  async updateLeaderboard(insertLeaderboard: InsertLeaderboard): Promise<Leaderboard> {
    const id = this.leaderboardIdCounter++;
    const entry: Leaderboard = { ...insertLeaderboard, id };
    this.leaderboardEntries.set(id, entry);
    return entry;
  }
  
  // Mission history operations
  async recordMissionHistory(
    playerId: number,
    missionId: number,
    success: boolean,
    crimeCoinChange: number,
    funCoinChange: number,
    experienceGained: number = 0
  ): Promise<MissionHistory> {
    const id = this.missionHistoryIdCounter++;
    const timestamp = new Date().toISOString();
    
    const historyEntry: MissionHistory = {
      id,
      player_id: playerId,
      mission_id: missionId,
      timestamp,
      success,
      crime_coin_change: crimeCoinChange,
      fun_coin_change: funCoinChange,
      experience_gained: experienceGained
    };
    
    this.missionHistories.set(id, historyEntry);
    
    // Update player stats based on mission outcome
    const player = await this.getPlayer(playerId);
    if (player) {
      const updatedPlayer: Partial<Player> = {
        crime_coin: player.crime_coin + crimeCoinChange,
        fun_coin: player.fun_coin + funCoinChange,
        experience: player.experience + experienceGained,
        total_missions: player.total_missions + 1
      };
      
      if (success) {
        updatedPlayer.successful_missions = player.successful_missions + 1;
        updatedPlayer.total_earnings = player.total_earnings + crimeCoinChange;
        
        if (crimeCoinChange > player.biggest_heist) {
          updatedPlayer.biggest_heist = crimeCoinChange;
        }
      }
      
      await this.updatePlayer(playerId, updatedPlayer);
    }
    
    return historyEntry;
  }

  async getMissionHistory(playerId: number): Promise<MissionHistory[]> {
    return Array.from(this.missionHistories.values())
      .filter(history => history.player_id === playerId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

export const storage = new MemStorage();
