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

export type MotionStatus = 'pending' | 'processing' | 'done' | 'failed';

export type MotionAnalysis = {
  id: string;
  short_id: string;
  user_id: string;
  title: string;
  reference_url: string | null;
  my_video_url: string | null;
  my_video_paths: string[];
  focus: string | null;
  status: MotionStatus;
  feedback: string | null;
  keyframes_ref: string[] | null;
  keyframes_mine: string[] | null;
  error: string | null;
  created_at: string;
  updated_at: string;
};
