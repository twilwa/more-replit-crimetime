import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  wallet_address: text("wallet_address")
});

// Players table for game data
export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id),
  crime_coin: integer("crime_coin").notNull().default(1000),
  fun_coin: integer("fun_coin").notNull().default(10),
  reputation: text("reputation").notNull().default("Rookie Thief"),
  level: integer("level").notNull().default(1),
  experience: integer("experience").notNull().default(0),
  successful_missions: integer("successful_missions").notNull().default(0),
  total_missions: integer("total_missions").notNull().default(0),
  total_earnings: integer("total_earnings").notNull().default(0),
  biggest_heist: integer("biggest_heist").notNull().default(0),
  daily_missions: integer("daily_missions").notNull().default(0),
  notoriety: integer("notoriety").notNull().default(1),
  inventory: jsonb("inventory").notNull().default([])
});

// Missions table
export const missions = pgTable("missions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull(),
  cost: integer("cost").notNull(),
  min_reward: integer("min_reward").notNull(),
  max_reward: integer("max_reward").notNull(),
  success_rate: integer("success_rate").notNull(),
  time_required: text("time_required").notNull(),
  image_url: text("image_url").notNull()
});

// Leaderboard table
export const leaderboard = pgTable("leaderboard", {
  id: serial("id").primaryKey(),
  player_id: integer("player_id").references(() => players.id),
  crime_earned: integer("crime_earned").notNull().default(0),
  biggest_heist: integer("biggest_heist").notNull().default(0),
  notoriety: integer("notoriety").notNull().default(1),
  rank: integer("rank").notNull().default(0),
  period: text("period").notNull() // "day", "week", "all_time"
});

// Mission history table
export const missionHistory = pgTable("mission_history", {
  id: serial("id").primaryKey(),
  player_id: integer("player_id").references(() => players.id),
  mission_id: integer("mission_id").references(() => missions.id),
  timestamp: text("timestamp").notNull(),
  success: boolean("success").notNull(),
  crime_coin_change: integer("crime_coin_change").notNull(),
  fun_coin_change: integer("fun_coin_change").notNull(),
  experience_gained: integer("experience_gained").notNull().default(0)
});

// Schema validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  wallet_address: true
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true
});

export const insertMissionSchema = createInsertSchema(missions).omit({
  id: true
});

export const insertLeaderboardSchema = createInsertSchema(leaderboard).omit({
  id: true
});

export const insertMissionHistorySchema = createInsertSchema(missionHistory).omit({
  id: true
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;

export type InsertMission = z.infer<typeof insertMissionSchema>;
export type Mission = typeof missions.$inferSelect;

export type InsertLeaderboard = z.infer<typeof insertLeaderboardSchema>;
export type Leaderboard = typeof leaderboard.$inferSelect;

export type InsertMissionHistory = z.infer<typeof insertMissionHistorySchema>;
export type MissionHistory = typeof missionHistory.$inferSelect;
