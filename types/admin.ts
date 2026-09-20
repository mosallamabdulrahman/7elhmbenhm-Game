// Admin Dashboard Contracts & TypeScript Definitions

export interface CategoryGroup {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface QuestionCategory {
  id: string;
  group_id?: string | null;
  name: string;
  description?: string | null;
  icon?: string | null;
  image_url?: string | null;
  cover_image_url?: string | null;
  is_active?: boolean;
  sort_order?: number;
  question_count?: number;
  created_at?: string;
  updated_at?: string;
}

export type QuestionDifficulty = "easy" | "medium" | "hard";

export interface AdminQuestion {
  id: string;
  category_id: string;
  question_text: string;
  answer_text: string;
  difficulty: QuestionDifficulty;
  strikes: number;
  position?: number;
  is_active: boolean;
  media_url?: string | null;
  media_type?: "image" | "audio" | "video" | null;
  image_duration?: number | null;
  media_play_count?: number | null;
  answer_image_url?: string | null;
  timer_seconds?: number;
  show_question_first?: boolean;
  created_at?: string;
  updated_at?: string;
}

export type SupportMessageStatus = "unread" | "read" | "resolved";

export interface SupportMessage {
  id: string;
  room_id?: string | null;
  sender_role: "referee" | "player" | string;
  sender_name?: string | null;
  sender_email: string;
  subject: string;
  message: string;
  image_url?: string | null;
  page_url?: string | null;
  status: SupportMessageStatus;
  created_at: string;
  updated_at?: string;
}

export interface QuestionStats {
  used: number;
  correct: number;
  incorrect: number;
}

export type AdminTab =
  | "dashboard"
  | "groups"
  | "categories"
  | "questions"
  | "support"
  | "users"
  | "stats";

export interface AdminToast {
  msg: string;
  type: "success" | "error" | "info";
}

export interface BulkActionPayload {
  action: string;
  ids: string[];
  category_id?: string;
  group_id?: string;
}
