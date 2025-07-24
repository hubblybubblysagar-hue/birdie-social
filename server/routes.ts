import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertProfileSchema, insertSwipeSchema, insertMatchSchema, insertMessageSchema, insertTeeTimeSchema, insertPostSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // set up authentication routes
  setupAuth(app);

  // Profile routes
  app.get("/api/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const userId = req.user!.id;
    const profile = await storage.getProfile(userId);
    
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    
    res.json(profile);
  });
  
  app.post("/api/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      const existingProfile = await storage.getProfile(userId);
      
      if (existingProfile) {
        return res.status(400).json({ message: "Profile already exists" });
      }
      
      const profileData = insertProfileSchema.parse({
        ...req.body,
        userId,
      });
      
      const profile = await storage.createProfile(profileData);
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      }
      throw error;
    }
  });
  
  app.put("/api/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      const profile = await storage.updateProfile(userId, req.body);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      }
      throw error;
    }
  });
  
  // User update route
  app.put("/api/user", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      const updatedUser = await storage.updateUser(userId, req.body);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      throw error;
    }
  });
  
  // Swipes and matches
  app.get("/api/profiles", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const userId = req.user!.id;
    const profiles = await storage.getProfilesForSwiping(userId);
    res.json(profiles);
  });
  
  app.post("/api/swipe", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const swiperId = req.user!.id;
      const swipeData = insertSwipeSchema.parse({
        ...req.body,
        swiperId,
      });
      
      const swipe = await storage.createSwipe(swipeData);
      
      // Check if it's a match (only when swiping right)
      let match = null;
      if (swipeData.direction === "right") {
        const isMatch = await storage.checkForMatch(swiperId, swipeData.swipeeId);
        
        if (isMatch) {
          // Create a match
          const matchData = {
            user1Id: swiperId,
            user2Id: swipeData.swipeeId,
            status: "active",
          };
          
          match = await storage.createMatch(matchData);
        }
      }
      
      res.json({ swipe, match });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid swipe data", errors: error.errors });
      }
      throw error;
    }
  });
  
  app.get("/api/matches", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const userId = req.user!.id;
    const matches = await storage.getMatches(userId);
    
    // For each match, get the other user's info
    const matchesWithUserInfo = await Promise.all(
      matches.map(async (match) => {
        const otherUserId = match.user1Id === userId ? match.user2Id : match.user1Id;
        const otherUser = await storage.getUser(otherUserId);
        return { ...match, otherUser };
      })
    );
    
    res.json(matchesWithUserInfo);
  });
  
  // Messages
  app.get("/api/matches/:matchId/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const userId = req.user!.id;
    const matchId = parseInt(req.params.matchId, 10);
    
    // Verify user is part of this match
    const match = await storage.getMatch(matchId);
    if (!match || (match.user1Id !== userId && match.user2Id !== userId)) {
      return res.status(403).json({ message: "Not authorized to access these messages" });
    }
    
    const messages = await storage.getMessages(matchId);
    res.json(messages);
  });
  
  app.post("/api/matches/:matchId/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const senderId = req.user!.id;
      const matchId = parseInt(req.params.matchId, 10);
      
      // Verify user is part of this match
      const match = await storage.getMatch(matchId);
      if (!match || (match.user1Id !== senderId && match.user2Id !== senderId)) {
        return res.status(403).json({ message: "Not authorized to send messages in this match" });
      }
      
      // Determine receiver ID (the other user in the match)
      const receiverId = match.user1Id === senderId ? match.user2Id : match.user1Id;
      
      const messageData = insertMessageSchema.parse({
        ...req.body,
        matchId,
        senderId,
        receiverId,
      });
      
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      throw error;
    }
  });
  
  // Course routes
  app.get("/api/courses", async (_req, res) => {
    const courses = await storage.getCourses();
    res.json(courses);
  });
  
  app.get("/api/courses/:id", async (req, res) => {
    const courseId = parseInt(req.params.id, 10);
    const course = await storage.getCourse(courseId);
    
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    
    res.json(course);
  });
  
  // Tee time routes
  app.get("/api/tee-times", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const userId = req.user!.id;
    const teeTimes = await storage.getTeeTimes(userId);
    
    // Get course info for each tee time
    const teeTimesWithCourseInfo = await Promise.all(
      teeTimes.map(async (teeTime) => {
        const course = await storage.getCourse(teeTime.courseId);
        return { ...teeTime, course };
      })
    );
    
    res.json(teeTimesWithCourseInfo);
  });
  
  app.post("/api/tee-times", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const createdBy = req.user!.id;
      const teeTimeData = insertTeeTimeSchema.parse({
        ...req.body,
        createdBy,
        date: new Date(req.body.date),
      });
      
      const teeTime = await storage.createTeeTime(teeTimeData);
      res.status(201).json(teeTime);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid tee time data", errors: error.errors });
      }
      throw error;
    }
  });
  
  // Post routes
  app.get("/api/posts", async (_req, res) => {
    const posts = await storage.getPosts();
    
    // Get user info for each post
    const postsWithUserInfo = await Promise.all(
      posts.map(async (post) => {
        const user = await storage.getUser(post.userId);
        
        // Get course info if available
        let course = undefined;
        if (post.courseId) {
          course = await storage.getCourse(post.courseId);
        }
        
        return { ...post, user, course };
      })
    );
    
    res.json(postsWithUserInfo);
  });
  
  app.get("/api/users/:userId/posts", async (req, res) => {
    const userId = parseInt(req.params.userId, 10);
    const posts = await storage.getUserPosts(userId);
    
    // Get user info
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Get course info for each post
    const postsWithInfo = await Promise.all(
      posts.map(async (post) => {
        let course = undefined;
        if (post.courseId) {
          course = await storage.getCourse(post.courseId);
        }
        
        return { ...post, user, course };
      })
    );
    
    res.json(postsWithInfo);
  });
  
  app.post("/api/posts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      
      const postData = insertPostSchema.parse({
        ...req.body,
        userId,
        playedDate: req.body.playedDate ? new Date(req.body.playedDate) : undefined,
      });
      
      const post = await storage.createPost(postData);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid post data", errors: error.errors });
      }
      throw error;
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
