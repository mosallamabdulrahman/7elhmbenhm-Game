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
  icon?: string | null;
  cover_image_url?: string | null;
  is_active?: boolean;
  question_count?: number;
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
