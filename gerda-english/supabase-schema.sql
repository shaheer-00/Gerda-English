-- Gerda English Learning App - Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Notes Table
CREATE TABLE notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mistakes Table
CREATE TABLE mistakes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  original_text TEXT NOT NULL,
  corrected_text TEXT NOT NULL,
  error_type TEXT CHECK (error_type IN ('grammar', 'vocabulary', 'spelling', 'listening', 'reading')),
  note_id UUID REFERENCES notes(id) ON DELETE SET NULL,
  quiz_id UUID,
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quizzes Table
CREATE TABLE quizzes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL,
  xp_reward INTEGER DEFAULT 100,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz Attempts Table
CREATE TABLE quiz_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  answers JSONB NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  xp_earned INTEGER DEFAULT 0
);

-- Rewards Table
CREATE TABLE rewards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  media_url TEXT NOT NULL,
  media_type TEXT CHECK (media_type IN ('video', 'image')),
  xp_required INTEGER NOT NULL,
  thumbnail_url TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Progress Table
CREATE TABLE user_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak INTEGER DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_quizzes UUID[] DEFAULT '{}',
  unlocked_rewards UUID[] DEFAULT '{}'
);

-- Calendar Events Table
CREATE TABLE calendar_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  xp_reward INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_mistakes_user_id ON mistakes(user_id);
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX idx_calendar_events_date ON calendar_events(date);

-- Row Level Security (RLS)
-- This app has no server-side auth layer: the browser talks to Supabase
-- directly with the anon key, and the "user" is a single hardcoded id
-- ('gerda'). There is no session context for Postgres to check a real
-- user_id against, so policies here are intentionally open (any anon
-- request can read/write). The admin route is protected only by not
-- being linked from the UI. If this ever needs real access control,
-- switch to Supabase Auth and rewrite these policies against auth.uid().
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mistakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Open access" ON notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Open access" ON mistakes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Open access" ON quizzes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Open access" ON quiz_attempts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Open access" ON rewards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Open access" ON user_progress FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Open access" ON calendar_events FOR ALL USING (true) WITH CHECK (true);

-- Function to initialize user progress
CREATE OR REPLACE FUNCTION initialize_user_progress()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    INSERT INTO user_progress (user_id, total_xp, level, streak)
    VALUES (NEW.user_id, 0, 1, 0)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to initialize progress on first note creation
CREATE TRIGGER init_progress_on_first_note
  AFTER INSERT ON notes
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_progress();
