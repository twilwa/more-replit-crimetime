import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertPlayerSchema, insertMissionSchema, insertLeaderboardSchema } from "@shared/schema";
import { log } from "./vite";

// Utility functions for mission gameplay
// These would typically be in a separate file, but we're keeping them here for simplicity

// Generate random mission actions based on difficulty
function generateMissionActions(difficulty: string, count = 3) {
  const actions = [];
  const difficultyMultiplier = 
    difficulty === 'Easy' ? 1.2 :
    difficulty === 'Medium' ? 1.0 :
    difficulty === 'Hard' ? 0.8 : 0.6;
  
  const actionTypes = [
    {
      name: "Hack Security",
      affectedStat: "stealth",
      narratives: [
        "bypass the security system with your hacking skills",
        "inject a virus into the security mainframe",
        "loop the security camera feed"
      ]
    },
    {
      name: "Bribe Guard",
      affectedStat: "intimidation",
      narratives: [
        "offer a substantial bribe to look the other way",
        "convince the guard that it's better for everyone if they take the night off",
        "flash a wad of cash to persuade the security staff"
      ]
    },
    {
      name: "Parkour Route",
      affectedStat: "speed",
      narratives: [
        "find an alternative path across the rooftops",
        "scale the building using your parkour skills",
        "navigate the ventilation system with impressive agility"
      ]
    },
    {
      name: "Take a Chance",
      affectedStat: "luck",
      narratives: [
        "rely on your notorious good fortune",
        "throw caution to the wind and just go for it",
        "bet it all on red and hope for the best"
      ]
    }
  ];
  
  // Pick random actions based on the count
  const selectedTypes = [];
  while (selectedTypes.length < count) {
    const randomType = actionTypes[Math.floor(Math.random() * actionTypes.length)];
    if (!selectedTypes.includes(randomType)) {
      selectedTypes.push(randomType);
    }
  }
  
  // Generate actions from the selected types
  for (const type of selectedTypes) {
    const bonusValue = Math.floor(Math.random() * 15) + 10;  // 10-25 bonus
    const riskLevel = Math.floor(Math.random() * 50) + 20;   // 20-70 risk
    const narrative = type.narratives[Math.floor(Math.random() * type.narratives.length)];
    
    actions.push({
      name: type.name,
      affectedStat: type.affectedStat,
      bonus: Math.floor(bonusValue * difficultyMultiplier),
      risk: riskLevel,
      narrative: narrative,
      description: `Increases your ${type.affectedStat} by ${Math.floor(bonusValue * difficultyMultiplier)}% with ${riskLevel}% risk`
    });
  }
  
  // Add a special action for very tough situations
  if (difficulty === 'Hard' || difficulty === 'Very Hard') {
    actions.push({
      name: "Bold Move",
      affectedStat: "success", // directly affects success chance
      bonus: 15,
      risk: 40,
      narrative: "make an extremely risky but potentially rewarding move",
      description: "Directly increases your chance of success by 15% but at high risk"
    });
  }
  
  return actions;
}

// Calculate success chance based on player stats and mission difficulty
function calculateSuccessChance(playerStats: Record<string, number>, difficulty: string) {
  // Base chance is determined by mission difficulty
  let baseChance = 
    difficulty === 'Easy' ? 0.8 :
    difficulty === 'Medium' ? 0.6 :
    difficulty === 'Hard' ? 0.4 : 0.3;
  
  // Calculate average stat value
  const totalStats = Object.values(playerStats).reduce((sum, val) => sum + val, 0);
  const averageStat = totalStats / Object.values(playerStats).length;
  
  // Convert average stat to a bonus (0-30%)
  const statBonus = (averageStat - 50) / 100;
  
  // Calculate final chance (capped between 0.1 and 0.95)
  const finalChance = Math.min(0.95, Math.max(0.1, baseChance + statBonus));
  
  return finalChance;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes - prefix all routes with /api
  
  // Player routes
  app.get("/api/player", async (req, res) => {
    try {
      // For now, return a default player since we don't have auth yet
      const player = await storage.getDefaultPlayer();
      res.json(player);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/player", async (req, res) => {
    try {
      const playerData = insertPlayerSchema.parse(req.body);
      const player = await storage.createPlayer(playerData);
      res.status(201).json(player);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/player", async (req, res) => {
    try {
      // For now, update the default player since we don't have auth yet
      const playerId = 1; // Default player ID
      const player = await storage.updatePlayer(playerId, req.body);
      res.json(player);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Mission routes
  app.get("/api/missions", async (req, res) => {
    try {
      const missions = await storage.getAllMissions();
      res.json(missions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/missions", async (req, res) => {
    try {
      const missionData = insertMissionSchema.parse(req.body);
      const mission = await storage.createMission(missionData);
      res.status(201).json(mission);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Leaderboard routes
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const period = req.query.period || "day";
      const leaderboardData = await storage.getLeaderboard(period as string);
      res.json(leaderboardData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Mission history routes
  app.post("/api/mission-history", async (req, res) => {
    try {
      const historySchema = z.object({
        playerId: z.number(),
        missionId: z.number(),
        success: z.boolean(),
        crimeCoinChange: z.number(),
        funCoinChange: z.number(),
        experienceGained: z.number().optional()
      });

      const data = historySchema.parse(req.body);
      const history = await storage.recordMissionHistory(
        data.playerId,
        data.missionId,
        data.success,
        data.crimeCoinChange,
        data.funCoinChange,
        data.experienceGained
      );
      
      res.status(201).json(history);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/mission-history/:playerId", async (req, res) => {
    try {
      const playerId = parseInt(req.params.playerId);
      const history = await storage.getMissionHistory(playerId);
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Mission gameplay endpoints
  app.post("/api/missions/start", async (req, res) => {
    try {
      log("Mission start request received");
      const startSchema = z.object({
        playerId: z.number(),
        missionId: z.number()
      });
      
      const { playerId, missionId } = startSchema.parse(req.body);
      
      // Get the mission and player
      const mission = await storage.getMission(missionId);
      const player = await storage.getPlayer(playerId);
      
      if (!mission || !player) {
        return res.status(404).json({ success: false, message: "Mission or player not found" });
      }
      
      // Check if player has enough crime coins
      if (player.crime_coin < mission.cost) {
        return res.status(400).json({ 
          success: false, 
          message: "Not enough $CRIME to start mission" 
        });
      }
      
      // Deduct mission cost from player
      const updatedPlayer = await storage.updatePlayer(playerId, {
        crime_coin: player.crime_coin - mission.cost
      });
      
      // Generate random mission actions
      const actions = generateMissionActions(mission.difficulty);
      
      // Generate initial player stats
      const playerStats = {
        stealth: Math.floor(Math.random() * 30) + 50,
        intimidation: Math.floor(Math.random() * 30) + 60,
        speed: Math.floor(Math.random() * 30) + 40,
        luck: Math.floor(Math.random() * 30) + 20
      };
      
      res.json({
        success: true,
        mission,
        player: updatedPlayer,
        actions,
        playerStats,
        missionState: "You're about to start the mission. Ready to commit some crime?"
      });
    } catch (error: any) {
      log("Error in mission start:", error.message);
      res.status(400).json({ success: false, message: error.message });
    }
  });
  
  app.post("/api/missions/action", async (req, res) => {
    try {
      log("Mission action request received");
      const actionSchema = z.object({
        playerId: z.number(),
        missionId: z.number(),
        action: z.object({
          name: z.string(),
          affectedStat: z.string(),
          bonus: z.number(),
          narrative: z.string(),
          description: z.string().optional(),
          risk: z.number().optional(),
        })
      });
      
      const { playerId, missionId, action } = actionSchema.parse(req.body);
      
      // Get the mission
      const mission = await storage.getMission(missionId);
      if (!mission) {
        return res.status(404).json({ success: false, message: "Mission not found" });
      }
      
      // Calculate progress increase (between 20-35%)
      const progressIncrease = Math.floor(Math.random() * 15) + 20;
      
      // Generate a narrative response based on the action
      const narratives = [
        `You ${action.narrative}. The mission progresses...`,
        `As you ${action.narrative}, you feel more confident.`,
        `${action.narrative} - a bold move that advances your mission.`,
        `Smart choice! ${action.narrative} and you gain ground.`
      ];
      const randomNarrative = narratives[Math.floor(Math.random() * narratives.length)];
      
      res.json({
        success: true,
        progressIncrease,
        narrative: randomNarrative,
        statIncrease: {
          stat: action.affectedStat,
          value: action.bonus
        }
      });
    } catch (error: any) {
      log("Error in mission action:", error.message);
      res.status(400).json({ success: false, message: error.message });
    }
  });
  
  app.post("/api/missions/complete", async (req, res) => {
    try {
      log("Mission complete request received");
      const completeSchema = z.object({
        playerId: z.number(),
        missionId: z.number(),
        playerStats: z.record(z.string(), z.number()),
        attempt: z.boolean().optional() // true if attempting completion, false if aborting
      });
      
      const { playerId, missionId, playerStats, attempt = true } = completeSchema.parse(req.body);
      
      // Get the mission and player
      const mission = await storage.getMission(missionId);
      const player = await storage.getPlayer(playerId);
      
      if (!mission || !player) {
        return res.status(404).json({ success: false, message: "Mission or player not found" });
      }
      
      if (!attempt) {
        // Player is aborting the mission
        // They get back 25% of the cost and gain some fun coins
        const refundAmount = Math.floor(mission.cost * 0.25);
        const funCoinGain = Math.floor(Math.random() * 10) + 5;
        
        const updatedPlayer = await storage.updatePlayer(playerId, {
          crime_coin: player.crime_coin + refundAmount,
          fun_coin: player.fun_coin + funCoinGain
        });
        
        await storage.recordMissionHistory(
          playerId,
          missionId,
          false,
          refundAmount,
          funCoinGain
        );
        
        return res.json({
          success: true,
          aborted: true,
          player: updatedPlayer,
          crimeCoinRefunded: refundAmount,
          funCoinGained: funCoinGain,
          message: "Mission aborted. You managed to escape with some of your investment."
        });
      }
      
      // Calculate success chance based on player stats and mission difficulty
      const successChance = calculateSuccessChance(playerStats, mission.difficulty);
      
      // Determine if mission is successful based on chance
      const isSuccessful = Math.random() <= successChance;
      
      if (isSuccessful) {
        // Mission succeeded
        // Calculate reward based on mission difficulty and some randomness
        const baseReward = mission.min_reward + Math.floor(Math.random() * (mission.max_reward - mission.min_reward));
        const rewardMultiplier = 1 + (Math.random() * 0.5); // 1.0 to 1.5x multiplier
        const crimeCoinReward = Math.floor(baseReward * rewardMultiplier);
        const funCoinReward = Math.floor(Math.random() * 20) + 10;
        const experienceGained = Math.floor(baseReward / 10) + Math.floor(Math.random() * 10);
        
        // Update player stats
        const updatedPlayer = await storage.updatePlayer(playerId, {
          crime_coin: player.crime_coin + crimeCoinReward,
          fun_coin: player.fun_coin + funCoinReward,
          experience: player.experience + experienceGained,
          successful_missions: player.successful_missions + 1,
          total_missions: player.total_missions + 1,
          total_earnings: player.total_earnings + crimeCoinReward,
          biggest_heist: Math.max(player.biggest_heist, crimeCoinReward),
          notoriety: player.notoriety + Math.floor(crimeCoinReward / 50)
        });
        
        // Record mission history
        await storage.recordMissionHistory(
          playerId,
          missionId,
          true,
          crimeCoinReward,
          funCoinReward,
          experienceGained
        );
        
        // Update leaderboard
        await storage.updateLeaderboard({
          player_id: playerId,
          period: 'day',
          crime_earned: crimeCoinReward,
          biggest_heist: crimeCoinReward,
          notoriety: Math.floor(crimeCoinReward / 50)
        });
        
        res.json({
          success: true,
          missionSuccess: true,
          player: updatedPlayer,
          crimeCoinReward,
          funCoinReward,
          experienceGained,
          message: "Mission completed successfully! You've earned a nice reward."
        });
      } else {
        // Mission failed
        // Player loses some crime coins but gains fun coins for the story
        const crimeCoinLost = Math.floor(mission.cost * 0.5);
        const funCoinGained = Math.floor(Math.random() * 15) + 5;
        
        // Generate a random failure reason
        const failureReasons = [
          "Security spotted you at the last second.",
          "Your getaway driver panicked and left early.",
          "An unexpected police patrol showed up.",
          "You tripped the silent alarm without realizing it.",
          "A rival crew got there just before you did."
        ];
        const failureReason = failureReasons[Math.floor(Math.random() * failureReasons.length)];
        
        // Update player stats
        const updatedPlayer = await storage.updatePlayer(playerId, {
          fun_coin: player.fun_coin + funCoinGained,
          total_missions: player.total_missions + 1
        });
        
        // Record mission history
        await storage.recordMissionHistory(
          playerId,
          missionId,
          false,
          -crimeCoinLost,
          funCoinGained
        );
        
        res.json({
          success: true,
          missionSuccess: false,
          player: updatedPlayer,
          crimeCoinLost,
          funCoinGained,
          failureReason,
          message: "Mission failed, but at least you got a good story out of it."
        });
      }
    } catch (error: any) {
      log("Error in mission complete:", error.message);
      res.status(400).json({ success: false, message: error.message });
    }
  });

  // Wallet connection mock endpoint
  app.post("/api/wallet/connect", (req, res) => {
    // Simulate wallet connection
    setTimeout(() => {
      res.json({ success: true, message: "Wallet connected successfully" });
    }, 1000);
  });

  const httpServer = createServer(app);
  return httpServer;
}
