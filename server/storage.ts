import { 
  users, type User, type InsertUser,
  profiles, type Profile, type InsertProfile,
  courses, type Course, type InsertCourse,
  matches, type Match, type InsertMatch,
  swipes, type Swipe, type InsertSwipe,
  messages, type Message, type InsertMessage,
  teeTimes, type TeeTime, type InsertTeeTime,
  posts, type Post, type InsertPost
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Profile methods
  getProfile(userId: number): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(userId: number, profile: Partial<Profile>): Promise<Profile | undefined>;
  
  // Course methods
  getCourse(id: number): Promise<Course | undefined>;
  getCourses(): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  
  // Match methods
  getMatch(id: number): Promise<Match | undefined>;
  getMatches(userId: number): Promise<Match[]>;
  createMatch(match: InsertMatch): Promise<Match>;
  
  // Swipe methods
  createSwipe(swipe: InsertSwipe): Promise<Swipe>;
  checkForMatch(user1Id: number, user2Id: number): Promise<boolean>;
  getSwipedProfiles(userId: number): Promise<number[]>;
  getProfilesWhoLikedMe(userId: number): Promise<number[]>;
  getProfilesForSwiping(userId: number): Promise<User[]>;
  
  // Message methods
  getMessages(matchId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Tee time methods
  getTeeTime(id: number): Promise<TeeTime | undefined>;
  getTeeTimes(userId: number): Promise<TeeTime[]>;
  createTeeTime(teeTime: InsertTeeTime): Promise<TeeTime>;
  
  // Post methods
  getPost(id: number): Promise<Post | undefined>;
  getPosts(): Promise<Post[]>;
  getUserPosts(userId: number): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private profiles: Map<number, Profile>;
  private courses: Map<number, Course>;
  private matches: Map<number, Match>;
  private swipes: Map<number, Swipe>;
  private messages: Map<number, Message>;
  private teeTimes: Map<number, TeeTime>;
  private posts: Map<number, Post>;
  
  currentUserId: number;
  currentProfileId: number;
  currentCourseId: number;
  currentMatchId: number;
  currentSwipeId: number;
  currentMessageId: number;
  currentTeeTimeId: number;
  currentPostId: number;
  
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.profiles = new Map();
    this.courses = new Map();
    this.matches = new Map();
    this.swipes = new Map();
    this.messages = new Map();
    this.teeTimes = new Map();
    this.posts = new Map();
    
    this.currentUserId = 1;
    this.currentProfileId = 1;
    this.currentCourseId = 1;
    this.currentMatchId = 1;
    this.currentSwipeId = 1;
    this.currentMessageId = 1;
    this.currentTeeTimeId = 1;
    this.currentPostId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    // Seed some courses
    this.seedCourses();
  }

  private seedCourses() {
    const sampleCourses = [
      {
        name: "Pebble Beach Golf Links",
        location: "Pebble Beach, CA",
        description: "One of the most beautiful courses in the world along the Monterey Peninsula.",
        imageUrl: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa",
        priceRange: "$$$$",
        rating: 5
      },
      {
        name: "Torrey Pines Golf Course",
        location: "La Jolla, CA",
        description: "A beautiful coastal municipal course that hosts the Farmers Insurance Open.",
        imageUrl: "https://images.unsplash.com/photo-1600166898405-da9535204843",
        priceRange: "$$$",
        rating: 4
      },
      {
        name: "Augusta National",
        location: "Augusta, GA",
        description: "Home of the Masters Tournament and one of the most prestigious golf clubs.",
        imageUrl: "https://images.unsplash.com/photo-1610148354090-c0c759100c6a",
        priceRange: "$$$$$",
        rating: 5
      },
      {
        name: "Pinehurst No. 2",
        location: "Pinehurst, NC",
        description: "A historic championship course that has hosted multiple U.S. Opens.",
        imageUrl: "https://images.unsplash.com/photo-1599460546755-ec4920c20cf9",
        priceRange: "$$$$",
        rating: 5
      }
    ];
    
    sampleCourses.forEach(course => {
      this.createCourse(course);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt,
      age: insertUser.age ?? null,
      profilePicture: insertUser.profilePicture ?? null,
      profilePhotos: insertUser.profilePhotos ?? null,
      bio: insertUser.bio ?? null,
      handicap: insertUser.handicap ?? null,
      skillLevel: insertUser.skillLevel ?? null,
      occupation: insertUser.occupation ?? null,
      gender: insertUser.gender ?? null,
      address: insertUser.address ?? null,
      clubMembership: insertUser.clubMembership ?? null,
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser: User = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Profile methods
  async getProfile(userId: number): Promise<Profile | undefined> {
    return Array.from(this.profiles.values()).find(
      (profile) => profile.userId === userId,
    );
  }
  
  async createProfile(profile: InsertProfile): Promise<Profile> {
    const id = this.currentProfileId++;
    const newProfile: Profile = { 
      ...profile, 
      id,
      preferredCourses: profile.preferredCourses ?? null,
      availability: profile.availability ?? null,
      location: profile.location ?? null,
      distancePreference: profile.distancePreference ?? null,
    };
    this.profiles.set(id, newProfile);
    return newProfile;
  }
  
  async updateProfile(userId: number, profileData: Partial<Profile>): Promise<Profile | undefined> {
    const profile = await this.getProfile(userId);
    if (!profile) return undefined;
    
    const updatedProfile: Profile = { ...profile, ...profileData };
    this.profiles.set(profile.id, updatedProfile);
    return updatedProfile;
  }
  
  // Course methods
  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }
  
  async getCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }
  
  async createCourse(course: InsertCourse): Promise<Course> {
    const id = this.currentCourseId++;
    const newCourse: Course = { ...course, id };
    this.courses.set(id, newCourse);
    return newCourse;
  }
  
  // Match methods
  async getMatch(id: number): Promise<Match | undefined> {
    return this.matches.get(id);
  }
  
  async getMatches(userId: number): Promise<Match[]> {
    return Array.from(this.matches.values()).filter(
      (match) => match.user1Id === userId || match.user2Id === userId
    );
  }
  
  async createMatch(match: InsertMatch): Promise<Match> {
    const id = this.currentMatchId++;
    const matchedAt = new Date();
    const newMatch: Match = { ...match, id, matchedAt };
    this.matches.set(id, newMatch);
    return newMatch;
  }
  
  // Swipe methods
  async createSwipe(swipe: InsertSwipe): Promise<Swipe> {
    const id = this.currentSwipeId++;
    const createdAt = new Date();
    const newSwipe: Swipe = { ...swipe, id, createdAt };
    this.swipes.set(id, newSwipe);
    return newSwipe;
  }
  
  async checkForMatch(user1Id: number, user2Id: number): Promise<boolean> {
    // Check if user2 has already swiped right on user1
    const existingSwipe = Array.from(this.swipes.values()).find(
      (swipe) => swipe.swiperId === user2Id && swipe.swipeeId === user1Id && swipe.direction === "right"
    );
    
    return !!existingSwipe;
  }
  
  async getSwipedProfiles(userId: number): Promise<number[]> {
    // Get all profiles this user has swiped on (either left or right)
    const swipedProfiles = Array.from(this.swipes.values())
      .filter((swipe) => swipe.swiperId === userId)
      .map((swipe) => swipe.swipeeId);
    
    return swipedProfiles;
  }
  
  async getProfilesWhoLikedMe(userId: number): Promise<number[]> {
    // Get profiles who have swiped right on this user
    const profilesWhoLikedMe = Array.from(this.swipes.values())
      .filter((swipe) => swipe.swipeeId === userId && swipe.direction === "right")
      .map((swipe) => swipe.swiperId);
    
    return profilesWhoLikedMe;
  }
  
  async getProfilesForSwiping(userId: number): Promise<User[]> {
    // Get already swiped profiles to exclude
    const swipedProfileIds = await this.getSwipedProfiles(userId);
    
    // Also exclude the current user
    swipedProfileIds.push(userId);
    
    // Return all users not in the swiped list
    const profilesToSwipe = Array.from(this.users.values())
      .filter((user) => !swipedProfileIds.includes(user.id));
    
    return profilesToSwipe;
  }
  
  // Message methods
  async getMessages(matchId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((message) => message.matchId === matchId)
      .sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());
  }
  
  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const sentAt = new Date();
    const newMessage: Message = { ...message, id, sentAt, isRead: false };
    this.messages.set(id, newMessage);
    return newMessage;
  }
  
  // Tee time methods
  async getTeeTime(id: number): Promise<TeeTime | undefined> {
    return this.teeTimes.get(id);
  }
  
  async getTeeTimes(userId: number): Promise<TeeTime[]> {
    return Array.from(this.teeTimes.values())
      .filter((teeTime) => 
        teeTime.createdBy === userId || 
        (teeTime.participants && teeTime.participants.includes(userId))
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }
  
  async createTeeTime(teeTime: InsertTeeTime): Promise<TeeTime> {
    const id = this.currentTeeTimeId++;
    const newTeeTime: TeeTime = { ...teeTime, id };
    this.teeTimes.set(id, newTeeTime);
    return newTeeTime;
  }
  
  // Post methods
  async getPost(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }
  
  async getPosts(): Promise<Post[]> {
    return Array.from(this.posts.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getUserPosts(userId: number): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter((post) => post.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createPost(post: InsertPost): Promise<Post> {
    const id = this.currentPostId++;
    const createdAt = new Date();
    const newPost: Post = { ...post, id, createdAt };
    this.posts.set(id, newPost);
    return newPost;
  }
}

export const storage = new MemStorage();
