// Core Game Data Contracts & TypeScript Definitions

export type UnitType =
  | "infantry"
  | "armored"
  | "tank"
  | "aircraft"
  | "submarine"
  | "mine";

export type StrikeResult = "hit" | "miss" | "mine" | "blocked" | "pending";

export type DifficultyLevel = "easy" | "medium" | "hard";

export type RoomStatus =
  | "waiting"
  | "deployment"
  | "playing"
  | "finished"
  | "abandoned";

export type ToolType = "radar" | "shield" | "double_strike";

export type MediaType = "image" | "audio" | "video" | null;

export interface TeamTool {
  type: ToolType;
  used: boolean;
  name: string;
}

export interface Team {
  id: string;
  room_id: string;
  team_index: number;
  name: string;
  score: number;
  points?: number;
  available_strikes: number;
  shield_active: boolean;
  pit_active?: boolean;
  is_ready?: boolean;
  joined?: boolean;
  member_id?: string | null;
  board?: any;
  tools?: Record<string, boolean>;
  used_tools?: any;
  created_at?: string;
  updated_at?: string;
}

export interface GameRoom {
  id: string;
  code?: string;
  status: RoomStatus;
  judge_id?: string;
  active_question_id?: string | null;
  question_started_at?: string | null;
  selected_categories?: string[];
  winner_team_index?: number | null;
  timer_override_start?: number | null;
  current_turn?: number;
  abandoned_by?: string | null;
  team_1_name?: string;
  team_2_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Question {
  id: string;
  category_id: string;
  category_name?: string;
  category_image_url?: string | null;
  category_image?: string | null;
  group_name?: string;
  difficulty: DifficultyLevel;
  question_text: string;
  answer_text?: string;
  media_url?: string | null;
  media_type?: MediaType;
  image_duration?: number | null;
  media_play_count?: number | null;
  show_question_first?: boolean;
  points?: number;
  strikes?: number;
  time_seconds?: number;
  timer_seconds?: number;
  is_active?: boolean;
  is_used?: boolean;
  position?: number;
}

export interface CombatEvent {
  id: string;
  room_id: string;
  event_type: "strike" | "tool" | "reveal" | "system" | "radar_scan" | (string & {});
  actor_team_index?: number;
  target_team_index: number;
  cell_index: number;
  result?: StrikeResult;
  unit_type?: UnitType | null;
  points_delta?: number;
  is_optimistic?: boolean;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface QuestionAnswer {
  text: string;
  imageUrl?: string;
}

export interface QuestionCategory {
  id: string;
  name: string;
  desc?: string;
  description?: string;
  image_url?: string | null;
  group_id?: string | null;
  group_name?: string | null;
  sort_order?: number | null;
  position?: number | null;
  is_active?: boolean;
}

export interface QuestionCategoryGroup {
  id: string;
  name?: string;
  title?: string;
  position?: number | null;
  created_at?: string;
}

