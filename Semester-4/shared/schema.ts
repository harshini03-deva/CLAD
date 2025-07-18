import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  password: text("password").notNull(),
  name: text("name"),
  avatar: text("avatar"),
  bio: text("bio"),
  preferences: jsonb("preferences"),
  streaks: integer("streaks").default(0),
  lastVisit: timestamp("last_visit"),
  googleId: text("google_id").unique(),
});

// Articles Table
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  apiId: text("api_id").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"),
  url: text("url").notNull(),
  imageUrl: text("image_url"),
  publishedAt: timestamp("published_at").notNull(),
  sourceId: text("source_id"),
  sourceName: text("source_name").notNull(),
  category: text("category").notNull(),
  estimatedReadingTime: integer("estimated_reading_time").default(3),
  createdAt: timestamp("created_at").defaultNow()
});

// Bookmarks Table
export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  articleId: integer("article_id").notNull().references(() => articles.id),
  createdAt: timestamp("created_at").defaultNow()
});

// Badges Table
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  badgeId: text("badge_id").notNull().unique(),
  title: text("title").notNull(),
  icon: text("icon").notNull(),
  backgroundColor: text("background_color").notNull(),
  description: text("description").notNull(),
});

// User Badges Table
export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  badgeId: integer("badge_id").notNull().references(() => badges.id),
  awardedAt: timestamp("awarded_at").defaultNow()
});

// Games Data Table
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'riddle', 'tongue-twister', 'sudoku', 'crossword'
  data: jsonb("data").notNull(),
  difficulty: text("difficulty"), // 'easy', 'medium', 'hard'
  createdAt: timestamp("created_at").defaultNow()
});

// User Game Progress Table
export const gameProgress = pgTable("game_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  gameId: integer("game_id").notNull().references(() => games.id),
  completed: boolean("completed").default(false),
  score: integer("score"),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at")
});

// AI Insights Table
export const aiInsights = pgTable("ai_insights", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'trend', 'factCheck', 'analysis'
  title: text("title").notNull(),
  content: text("content").notNull(),
  sentiment: text("sentiment"), // 'positive', 'negative', 'neutral'
  confidence: integer("confidence"),
  relatedArticles: jsonb("related_articles"),
  category: text("category"), // 'technology', 'health', 'business', etc.
  createdAt: timestamp("created_at").defaultNow()
});

// Communities Table
export const communities = pgTable("communities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  topics: jsonb("topics").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

// Community Members Table
export const communityMembers = pgTable("community_members", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull().references(() => communities.id),
  userId: integer("user_id").notNull().references(() => users.id),
  joinedAt: timestamp("joined_at").defaultNow()
});

// Community Posts Table
export const communityPosts = pgTable("community_posts", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull().references(() => communities.id),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertArticleSchema = createInsertSchema(articles).omit({ id: true, createdAt: true });
export const insertBookmarkSchema = createInsertSchema(bookmarks).omit({ id: true, createdAt: true });
export const insertBadgeSchema = createInsertSchema(badges).omit({ id: true });
export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({ id: true, awardedAt: true });
export const insertGameSchema = createInsertSchema(games).omit({ id: true, createdAt: true });
export const insertGameProgressSchema = createInsertSchema(gameProgress).omit({ id: true, startedAt: true, completedAt: true });
export const insertAiInsightSchema = createInsertSchema(aiInsights).omit({ id: true, createdAt: true });
export const insertCommunitySchema = createInsertSchema(communities).omit({ id: true, createdAt: true });
export const insertCommunityMemberSchema = createInsertSchema(communityMembers).omit({ id: true, joinedAt: true });
export const insertCommunityPostSchema = createInsertSchema(communityPosts).omit({ id: true, createdAt: true });

// Create types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type InsertGameProgress = z.infer<typeof insertGameProgressSchema>;
export type InsertAiInsight = z.infer<typeof insertAiInsightSchema>;
export type InsertCommunity = z.infer<typeof insertCommunitySchema>;
export type InsertCommunityMember = z.infer<typeof insertCommunityMemberSchema>;
export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;

export type User = typeof users.$inferSelect;
export type Article = typeof articles.$inferSelect;
export type Bookmark = typeof bookmarks.$inferSelect;
export type Badge = typeof badges.$inferSelect;
export type UserBadge = typeof userBadges.$inferSelect;
export type Game = typeof games.$inferSelect;
export type GameProgress = typeof gameProgress.$inferSelect;
export type AiInsight = typeof aiInsights.$inferSelect;
export type Community = typeof communities.$inferSelect;
export type CommunityMember = typeof communityMembers.$inferSelect;
export type CommunityPost = typeof communityPosts.$inferSelect;

// YouTube video type (not stored in DB)
export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl: string;
  tags: string[];
}
