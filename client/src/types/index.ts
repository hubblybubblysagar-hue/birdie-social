import { User, Profile, Course, Match, Message, TeeTime, Post } from "@shared/schema";

export interface MatchWithUser extends Match {
  otherUser?: User;
}

export interface MessageWithUser extends Message {
  sender?: User;
}

export interface TeeTimeWithCourse extends TeeTime {
  course?: Course;
}

export interface PostWithUserAndCourse extends Post {
  user?: User;
  course?: Course;
}
