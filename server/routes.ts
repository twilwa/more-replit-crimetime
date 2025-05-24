import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertPlayerSchema, insertMissionSchema, insertLeaderboardSchema } from "@shared/schema";

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
