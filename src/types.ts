export interface Poll {
  id: string;
  title: string;
  subtitle?: string;
  slide_target: string;
  options: string[];
  created_at?: string;
}

export interface Vote {
  id: string;
  question_id: string;
  option_index: number;
  option_text: string;
  created_at: string;
}

export interface VoteSummary {
  [optionIndex: number]: {
    text: string;
    count: number;
    percentage: number;
  };
}
