import { 
  User, InsertUser, 
  Player, InsertPlayer,
  Mission, InsertMission,
  Leaderboard, InsertLeaderboard,
  MissionHistory, InsertMissionHistory,
  users, players, missions, leaderboard, missionHistory
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

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

// In-memory storage implementation for development
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
    
    this.initializeData();
  }
  
  private initializeData(): void {
    // Create default user
    const defaultUser: User = {
      id: this.userIdCounter++,
      username: "player",
      password: "password",
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
      inventory: [
        {
          id: 1,
          name: "Ski Mask",
          description: "A basic ski mask to hide your identity. Crime 101 essential gear.",
          category: "Disguise",
          rarity: "common",
          icon: "fa-mask",
          effects: [
            {
              type: "boost",
              stat: "stealth",
              value: 5
            }
          ],
          equippable: true,
          equipped: false
        },
        {
          id: 2,
          name: "Lockpick Set",
          description: "Standard set of lockpicks. Gets the job done for most basic locks.",
          category: "Tools",
          rarity: "common",
          icon: "fa-key",
          effects: [
            {
              type: "boost",
              stat: "speed",
              value: 5
            }
          ],
          equippable: true,
          equipped: false
        },
        {
          id: 3,
          name: "Crypto Wallet",
          description: "Digital wallet for storing your ill-gotten gains. Has enhanced security features.",
          category: "Tech",
          rarity: "uncommon",
          icon: "fa-wallet",
          effects: [
            {
              type: "protection",
              stat: "luck",
              value: 10
            }
          ],
          equippable: true,
          equipped: false,
          isNFT: true,
          tokenId: "CRIM3-0x42069"
        }
      ]
    };
    this.players.set(defaultPlayer.id, defaultPlayer);
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
    return this.players.get(1) as Player;
  }
  
  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const id = this.playerIdCounter++;
    const player: Player = { ...insertPlayer, id };
    this.players.set(id, player);
    return player;
  }
  
  async updatePlayer(id: number, playerData: Partial<Player>): Promise<Player> {
    const player = this.players.get(id);
    if (!player) {
      throw new Error(`Player with id ${id} not found`);
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
    // If no missions have been added yet, create initial missions
    if (this.missions.size === 0) {
      const initialMissions = [
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
        },
        {
          id: this.missionIdCounter++,
          name: "NFT Counterfeit",
          description: "Create and sell counterfeit NFTs to unsuspecting collectors. A high-tech approach to art theft.",
          difficulty: "Medium",
          cost: 15,
          min_reward: 30,
          max_reward: 60,
          success_rate: 65,
          time_required: "45 min",
          image_url: "https://images.unsplash.com/photo-1645378999496-33c8c2afe38d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
        },
        {
          id: this.missionIdCounter++,
          name: "Rug Pull Reversal",
          description: "Infiltrate a rug pull dev's wallet and return funds to scammed victims. Chaotic good crime.",
          difficulty: "Hard",
          cost: 75,
          min_reward: 150,
          max_reward: 400,
          success_rate: 40,
          time_required: "3 hours",
          image_url: "https://images.unsplash.com/photo-1614854262318-831574f15f1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
        },
        {
          id: this.missionIdCounter++,
          name: "Meme Coin Pump",
          description: "Create artificial hype for a worthless meme coin and cash out before the dump. Classic crypto scheme.",
          difficulty: "Medium",
          cost: 25,
          min_reward: 50,
          max_reward: 100,
          success_rate: 70,
          time_required: "1 hour",
          image_url: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
        }
      ];
      
      initialMissions.forEach(mission => {
        this.missions.set(mission.id, mission);
      });
    }
    
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
    let entries = Array.from(this.leaderboardEntries.values()).filter(entry => entry.period === period);
    
    if (entries.length === 0) {
      // Add some initial leaderboard entries if empty
      const initialEntries = [
        {
          id: this.leaderboardIdCounter++,
          player_id: null,
          crime_earned: 42069,
          biggest_heist: 8000,
          notoriety: 10,
          rank: 1,
          period
        },
        {
          id: this.leaderboardIdCounter++,
          player_id: null,
          crime_earned: 36420,
          biggest_heist: 5000,
          notoriety: 8,
          rank: 2,
          period
        },
        {
          id: this.leaderboardIdCounter++,
          player_id: null,
          crime_earned: 21337,
          biggest_heist: 3000,
          notoriety: 6,
          rank: 3,
          period
        }
      ];
      
      initialEntries.forEach(entry => {
        this.leaderboardEntries.set(entry.id, entry);
      });
      
      entries = initialEntries;
    }
    
    return entries.sort((a, b) => b.crime_earned - a.crime_earned);
  }
  
  async updateLeaderboard(insertLeaderboard: InsertLeaderboard): Promise<Leaderboard> {
    // Check if an entry already exists for this player in this period
    const existingEntry = Array.from(this.leaderboardEntries.values()).find(entry => 
      entry.player_id === insertLeaderboard.player_id && entry.period === insertLeaderboard.period
    );
    
    if (existingEntry) {
      // Update existing entry
      const updatedEntry: Leaderboard = {
        ...existingEntry,
        ...insertLeaderboard,
        id: existingEntry.id
      };
      this.leaderboardEntries.set(existingEntry.id, updatedEntry);
      return updatedEntry;
    } else {
      // Create new entry
      const id = this.leaderboardIdCounter++;
      const entry: Leaderboard = { ...insertLeaderboard, id };
      this.leaderboardEntries.set(id, entry);
      return entry;
    }
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
    
    const historyEntry: MissionHistory = {
      id,
      player_id: playerId,
      mission_id: missionId,
      timestamp: new Date().toISOString(),
      success,
      crime_coin_change: crimeCoinChange,
      fun_coin_change: funCoinChange,
      experience_gained: experienceGained
    };
    
    this.missionHistories.set(id, historyEntry);
    return historyEntry;
  }
  
  async getMissionHistory(playerId: number): Promise<MissionHistory[]> {
    return Array.from(this.missionHistories.values())
      .filter(history => history.player_id === playerId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async getPlayer(id: number): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.id, id));
    return player || undefined;
  }
  
  async getDefaultPlayer(): Promise<Player> {
    // Check if we already have a default player
    const [player] = await db.select().from(players).limit(1);
    if (player) return player;
    
    // Create a default player if none exists
    const defaultPlayer: InsertPlayer = {
      user_id: null,
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
      inventory: [
        {
          id: 1,
          name: "Ski Mask",
          description: "A basic ski mask to hide your identity. Crime 101 essential gear.",
          category: "Disguise",
          rarity: "common",
          icon: "fa-mask",
          effects: [
            {
              type: "boost",
              stat: "stealth",
              value: 5
            }
          ],
          equippable: true,
          equipped: false
        },
        {
          id: 2,
          name: "Lockpick Set",
          description: "Standard set of lockpicks. Gets the job done for most basic locks.",
          category: "Tools",
          rarity: "common",
          icon: "fa-key",
          effects: [
            {
              type: "boost",
              stat: "speed",
              value: 5
            }
          ],
          equippable: true,
          equipped: false
        },
        {
          id: 3,
          name: "Crypto Wallet",
          description: "Digital wallet for storing your ill-gotten gains. Has enhanced security features.",
          category: "Tech",
          rarity: "uncommon",
          icon: "fa-wallet",
          effects: [
            {
              type: "protection",
              stat: "luck",
              value: 10
            }
          ],
          equippable: true,
          equipped: false,
          isNFT: true,
          tokenId: "CRIM3-0x42069"
        }
      ]
    };
    
    const [newPlayer] = await db
      .insert(players)
      .values(defaultPlayer)
      .returning();
    
    return newPlayer;
  }
  
  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const [player] = await db
      .insert(players)
      .values(insertPlayer)
      .returning();
    
    return player;
  }
  
  async updatePlayer(id: number, playerData: Partial<Player>): Promise<Player> {
    const [updatedPlayer] = await db
      .update(players)
      .set(playerData)
      .where(eq(players.id, id))
      .returning();
    
    if (!updatedPlayer) {
      throw new Error(`Player with id ${id} not found`);
    }
    
    return updatedPlayer;
  }
  
  async getMission(id: number): Promise<Mission | undefined> {
    const [mission] = await db.select().from(missions).where(eq(missions.id, id));
    return mission || undefined;
  }
  
  async getAllMissions(): Promise<Mission[]> {
    const allMissions = await db.select().from(missions);
    
    // If no missions exist, seed the database with initial missions
    if (allMissions.length === 0) {
      const initialMissions: InsertMission[] = [
        {
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
          name: "Crypto Wallet Hack",
          description: "Hack into a forgotten crypto wallet. High-tech crime, high rewards, but risky.",
          difficulty: "Hard",
          cost: 50,
          min_reward: 100,
          max_reward: 300,
          success_rate: 45,
          time_required: "2 hours",
          image_url: "https://images.unsplash.com/photo-1633265486501-0cf524a07213?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
        },
        {
          name: "NFT Counterfeit",
          description: "Create and sell counterfeit NFTs to unsuspecting collectors. A high-tech approach to art theft.",
          difficulty: "Medium",
          cost: 15,
          min_reward: 30,
          max_reward: 60,
          success_rate: 65,
          time_required: "45 min",
          image_url: "https://images.unsplash.com/photo-1645378999496-33c8c2afe38d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
        },
        {
          name: "Rug Pull Reversal",
          description: "Infiltrate a rug pull dev's wallet and return funds to scammed victims. Chaotic good crime.",
          difficulty: "Hard",
          cost: 75,
          min_reward: 150,
          max_reward: 400,
          success_rate: 40,
          time_required: "3 hours",
          image_url: "https://images.unsplash.com/photo-1614854262318-831574f15f1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
        },
        {
          name: "Meme Coin Pump",
          description: "Create artificial hype for a worthless meme coin and cash out before the dump. Classic crypto scheme.",
          difficulty: "Medium",
          cost: 25,
          min_reward: 50,
          max_reward: 100,
          success_rate: 70,
          time_required: "1 hour",
          image_url: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
        }
      ];
      
      await db.insert(missions).values(initialMissions);
      return await db.select().from(missions);
    }
    
    return allMissions;
  }
  
  async createMission(insertMission: InsertMission): Promise<Mission> {
    const [mission] = await db
      .insert(missions)
      .values(insertMission)
      .returning();
    
    return mission;
  }
  
  async getLeaderboard(period: string): Promise<Leaderboard[]> {
    const leaderboardEntries = await db
      .select()
      .from(leaderboard)
      .where(eq(leaderboard.period, period))
      .orderBy(desc(leaderboard.crime_earned));
    
    // If no leaderboard exists for this period, seed with initial data
    if (leaderboardEntries.length === 0) {
      const initialLeaderboard: InsertLeaderboard[] = [
        {
          player_id: null,
          crime_earned: 42069,
          biggest_heist: 8000,
          notoriety: 10,
          rank: 1,
          period: period
        },
        {
          player_id: null,
          crime_earned: 36420,
          biggest_heist: 5000,
          notoriety: 8,
          rank: 2,
          period: period
        },
        {
          player_id: null,
          crime_earned: 21337,
          biggest_heist: 3000,
          notoriety: 6,
          rank: 3,
          period: period
        }
      ];
      
      await db.insert(leaderboard).values(initialLeaderboard);
      return await db
        .select()
        .from(leaderboard)
        .where(eq(leaderboard.period, period))
        .orderBy(desc(leaderboard.crime_earned));
    }
    
    return leaderboardEntries;
  }
  
  async updateLeaderboard(insertLeaderboard: InsertLeaderboard): Promise<Leaderboard> {
    // Check if entry already exists
    const [existingEntry] = await db
      .select()
      .from(leaderboard)
      .where(and(
        eq(leaderboard.player_id, insertLeaderboard.player_id || 0),
        eq(leaderboard.period, insertLeaderboard.period)
      ));
    
    if (existingEntry) {
      // Update existing entry
      const [updatedEntry] = await db
        .update(leaderboard)
        .set({
          crime_earned: insertLeaderboard.crime_earned,
          biggest_heist: insertLeaderboard.biggest_heist,
          notoriety: insertLeaderboard.notoriety,
          rank: insertLeaderboard.rank
        })
        .where(eq(leaderboard.id, existingEntry.id))
        .returning();
      
      return updatedEntry;
    } else {
      // Create new entry
      const [newEntry] = await db
        .insert(leaderboard)
        .values(insertLeaderboard)
        .returning();
      
      return newEntry;
    }
  }
  
  async recordMissionHistory(
    playerId: number,
    missionId: number,
    success: boolean,
    crimeCoinChange: number,
    funCoinChange: number,
    experienceGained: number = 0
  ): Promise<MissionHistory> {
    const historyEntry: InsertMissionHistory = {
      player_id: playerId,
      mission_id: missionId,
      timestamp: new Date().toISOString(),
      success,
      crime_coin_change: crimeCoinChange,
      fun_coin_change: funCoinChange,
      experience_gained: experienceGained
    };
    
    const [record] = await db
      .insert(missionHistory)
      .values(historyEntry)
      .returning();
    
    return record;
  }
  
  async getMissionHistory(playerId: number): Promise<MissionHistory[]> {
    return await db
      .select()
      .from(missionHistory)
      .where(eq(missionHistory.player_id, playerId))
      .orderBy(desc(sql`${missionHistory.timestamp}`));
  }
}

// Use database storage
export const storage = new DatabaseStorage();