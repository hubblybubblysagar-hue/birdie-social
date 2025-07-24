import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  age: integer("age"),
  profilePicture: text("profile_picture"),
  profilePhotos: jsonb("profile_photos").$type<string[]>(), // Multiple photos/videos
  bio: text("bio"),
  handicap: integer("handicap"),
  skillLevel: text("skill_level"), // "Beginner", "Intermediate", "Advanced"
  occupation: text("occupation"),
  gender: text("gender"), // "male", "female", "other"
  address: text("address"),
  clubMembership: text("club_membership"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schema for users
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  age: true,
  profilePicture: true,
  profilePhotos: true,
  bio: true,
  handicap: true,
  skillLevel: true,
  occupation: true,
  gender: true,
  address: true,
  clubMembership: true,
});

// User profile
export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  preferredCourses: jsonb("preferred_courses").$type<string[]>(),
  availability: jsonb("availability").$type<string[]>(), // Array of days ("Mon", "Tue", etc.)
  location: text("location"),
  distancePreference: integer("distance_preference"), // in miles
});

// Insert schema for profiles
export const insertProfileSchema = createInsertSchema(profiles).pick({
  userId: true,
  preferredCourses: true,
  availability: true,
  location: true,
  distancePreference: true,
});

// Golf Courses
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  priceRange: text("price_range"),
  rating: integer("rating"),
});

// Insert schema for courses
export const insertCourseSchema = createInsertSchema(courses).pick({
  name: true,
  location: true,
  description: true,
  imageUrl: true,
  priceRange: true,
  rating: true,
});

// Matches between users
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  user1Id: integer("user1_id").notNull().references(() => users.id),
  user2Id: integer("user2_id").notNull().references(() => users.id),
  matchedAt: timestamp("matched_at").defaultNow(),
  status: text("status").notNull(), // "active", "inactive"
});

// Insert schema for matches
export const insertMatchSchema = createInsertSchema(matches).pick({
  user1Id: true,
  user2Id: true,
  status: true,
});

// User Swipes
export const swipes = pgTable("swipes", {
  id: serial("id").primaryKey(),
  swiperId: integer("swiper_id").notNull().references(() => users.id),
  swipeeId: integer("swipee_id").notNull().references(() => users.id),
  direction: text("direction").notNull(), // "left" or "right"
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schema for swipes
export const insertSwipeSchema = createInsertSchema(swipes).pick({
  swiperId: true,
  swipeeId: true,
  direction: true,
});

// Messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull().references(() => matches.id),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  sentAt: timestamp("sent_at").defaultNow(),
  isRead: boolean("is_read").default(false),
});

// Insert schema for messages
export const insertMessageSchema = createInsertSchema(messages).pick({
  matchId: true,
  senderId: true,
  receiverId: true,
  content: true,
});

// Tee Times
export const teeTimes = pgTable("tee_times", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => courses.id),
  date: timestamp("date").notNull(),
  status: text("status").notNull(), // "pending", "confirmed", "cancelled"
  createdBy: integer("created_by").notNull().references(() => users.id),
  participants: jsonb("participants").$type<number[]>(), // Array of user IDs
});

// Insert schema for tee times
export const insertTeeTimeSchema = createInsertSchema(teeTimes).pick({
  courseId: true,
  date: true,
  status: true,
  createdBy: true,
  participants: true,
});

// Feed Posts
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  courseId: integer("course_id").references(() => courses.id),
  score: integer("score"),
  playedDate: timestamp("played_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schema for posts
export const insertPostSchema = createInsertSchema(posts).pick({
  userId: true,
  content: true,
  imageUrl: true,
  courseId: true,
  score: true,
  playedDate: true,
});

// Define types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;

export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;

export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matches.$inferSelect;

export type InsertSwipe = z.infer<typeof insertSwipeSchema>;
export type Swipe = typeof swipes.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertTeeTime = z.infer<typeof insertTeeTimeSchema>;
export type TeeTime = typeof teeTimes.$inferSelect;

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;
