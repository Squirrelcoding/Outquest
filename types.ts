import { Database } from '@/database.types';

export type DBComment = Database["public"]["Tables"]["comment"]["Row"];
export type Profile = Database["public"]["Tables"]["profile"]["Row"];
export type Quest = Database["public"]["Tables"]["quest"]["Row"];
export type Subquest = Database["public"]["Tables"]["subquest"]["Row"];
export type CommentLike = Database["public"]["Tables"]["comment score"]["Row"];
export type LeaderboardMetaRow = Database["public"]["Tables"]["leaderboard meta"]["Row"];
export type City = Database["public"]["Tables"]["cities"]["Row"];
export type Completion = Database["public"]["Tables"]["completion"]["Row"];
export type Achievement = Database["public"]["Tables"]["achievement"]["Row"];
export type AchievementID = Database["public"]["Tables"]["achievement id"]["Row"];