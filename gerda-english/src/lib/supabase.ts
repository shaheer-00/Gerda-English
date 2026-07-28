import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Database Types
export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  mistakes?: Mistake[];
}

export interface Mistake {
  id: string;
  user_id: string;
  original_text: string;
  corrected_text: string;
  error_type: 'grammar' | 'vocabulary' | 'spelling' | 'listening' | 'reading';
  note_id?: string;
  quiz_id?: string;
  explanation?: string;
  created_at: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  xp_reward: number;
  created_by: string;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  type: 'multiple_choice' | 'fill_blank' | 'listening' | 'reading';
  question_text: string;
  audio_url?: string;
  image_url?: string;
  options?: string[];
  correct_answer: string;
  explanation?: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  answers: Record<string, string>;
  completed_at: string;
  xp_earned: number;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  media_url: string;
  media_type: 'video' | 'image';
  xp_required: number;
  thumbnail_url?: string;
  created_by: string;
  created_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  total_xp: number;
  level: number;
  streak: number;
  last_activity: string;
  completed_quizzes: string[];
  unlocked_rewards: string[];
  completed_mock_exams?: string[];
}

export interface CalendarEvent {
  id: string;
  user_id: string;
  date: string;
  title: string;
  description?: string;
  completed: boolean;
  xp_reward: number;
  created_at: string;
}

export interface MockExamQuestion {
  id: string;
  question_text: string;
  type: 'multiple_choice' | 'fill_blank';
  options?: string[];
  correct_answer: string;
  explanation?: string;
}

export interface MockExamSection {
  type: 'listening' | 'reading';
  section_number: number;
  title: string;
  instructions: string;
  passage_text?: string;
  listening_script?: string;
  questions: MockExamQuestion[];
}

export interface MockExam {
  id: string;
  title: string;
  module: 'academic';
  sections: MockExamSection[];
  created_at: string;
}

export interface MockExamSectionScore {
  raw: number;
  band: number;
}

export interface MockExamAttempt {
  id: string;
  user_id: string;
  mock_exam_id: string;
  section_scores: {
    listening: MockExamSectionScore;
    reading: MockExamSectionScore;
  };
  estimated_band: number;
  answers: Record<string, string>;
  time_spent_seconds: number;
  completed_at: string;
}
