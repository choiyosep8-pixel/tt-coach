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

export type MatchRecord = {
  id: string;
  user_id: string;
  played_at: string;
  opponent_name: string | null;
  type_id: string | null;
  my_score: number | null;
  opp_score: number | null;
  worked: string | null;
  failed: string | null;
  notes: string | null;
  created_at: string;
};
