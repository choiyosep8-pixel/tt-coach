import type { SessionKind } from './session-kinds';

export type OpponentType = {
  id: string;
  slug: string;
  label: string;
  icon: string | null;
  description: string | null;
  sort_order: number;
};

export type CounterStrategy = {
  id: string;
  user_id: string;
  type_id: string;
  kind: 'strategy' | 'failure' | 'note';
  title: string;
  body: string | null;
  source_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Session = {
  id: string;
  user_id: string;
  session_date: string;
  kind: SessionKind;
  title: string | null;
  opponent_type_id: string | null;
  opponent_name: string | null;
  my_score: number | null;
  opp_score: number | null;
  worked: string | null;
  failed: string | null;
  video_paths: string[];
  reference_url: string | null;
  feedback: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type MonthlyGoal = {
  id: string;
  user_id: string;
  year_month: string;
  goal: string | null;
  focus_1: string | null;
  focus_2: string | null;
  focus_3: string | null;
  created_at: string;
  updated_at: string;
};

export type PlayerProfile = {
  user_id: string;
  strengths: string | null;
  weaknesses: string | null;
  injuries: string | null;
  coach_direction: string | null;
  long_term_goal: string | null;
  updated_at: string;
};

export type MotionStatus = 'pending' | 'processing' | 'done' | 'failed';

export type FeedbackAxis = {
  key: string;
  label: string;
  score: number;          // 0~100 (Reference=100 기준)
  color: string;          // hex
  ref_note: string;
  mine_note: string;
};

export type FeedbackCue = {
  title: string;
  detail: string;
};

export type FeedbackData = {
  overall_score: number;
  confidence: 'low' | 'medium' | 'high';
  headline: string;
  axes: FeedbackAxis[];
  wins: string[];
  losses: string[];
  cues: FeedbackCue[];
  limitations?: string[];
  next_recording_tips?: string[];
};

export type MotionAnalysis = {
  id: string;
  short_id: string;
  user_id: string;
  title: string;
  reference_url: string | null;
  reference_subject: string | null;
  reference_position: string | null;
  reference_hand: string | null;
  reference_start_sec: number | null;
  reference_end_sec: number | null;
  my_video_url: string | null;
  my_subject: string | null;
  my_position: string | null;
  my_hand: string | null;
  my_start_sec: number | null;
  my_end_sec: number | null;
  my_video_paths: string[];
  focus: string | null;
  status: MotionStatus;
  feedback: string | null;
  feedback_data: FeedbackData | null;
  keyframes_ref: string[] | null;
  keyframes_mine: string[] | null;
  error: string | null;
  created_at: string;
  updated_at: string;
};
