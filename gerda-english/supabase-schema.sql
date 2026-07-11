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

-- Row Level Security (RLS) Policies
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mistakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Notes policies
CREATE POLICY "Users can view their own notes"
  ON notes FOR SELECT
  USING (user_id = current_setting('app.current_user_id', TRUE));

CREATE POLICY "Users can insert their own notes"
  ON notes FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', TRUE));

CREATE POLICY "Users can update their own notes"
  ON notes FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', TRUE));

CREATE POLICY "Users can delete their own notes"
  ON notes FOR DELETE
  USING (user_id = current_setting('app.current_user_id', TRUE));

-- Mistakes policies
CREATE POLICY "Users can view their own mistakes"
  ON mistakes FOR SELECT
  USING (user_id = current_setting('app.current_user_id', TRUE));

CREATE POLICY "Users can insert their own mistakes"
  ON mistakes FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', TRUE));

-- Quizzes policies (everyone can view, only admins can create)
CREATE POLICY "Everyone can view quizzes"
  ON quizzes FOR SELECT
  USING (true);

CREATE POLICY "Admins can create quizzes"
  ON quizzes FOR INSERT
  WITH CHECK (created_by = current_setting('app.current_user_id', TRUE));

-- Quiz attempts policies
CREATE POLICY "Users can view their own attempts"
  ON quiz_attempts FOR SELECT
  USING (user_id = current_setting('app.current_user_id', TRUE));

CREATE POLICY "Users can insert their own attempts"
  ON quiz_attempts FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', TRUE));

-- Rewards policies (everyone can view, only admins can create)
CREATE POLICY "Everyone can view rewards"
  ON rewards FOR SELECT
  USING (true);

CREATE POLICY "Admins can create rewards"
  ON rewards FOR INSERT
  WITH CHECK (created_by = current_setting('app.current_user_id', TRUE));

-- User progress policies
CREATE POLICY "Users can view their own progress"
  ON user_progress FOR SELECT
  USING (user_id = current_setting('app.current_user_id', TRUE));

CREATE POLICY "Users can insert their own progress"
  ON user_progress FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', TRUE));

CREATE POLICY "Users can update their own progress"
  ON user_progress FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', TRUE));

-- Calendar events policies
CREATE POLICY "Users can view their own calendar events"
  ON calendar_events FOR SELECT
  USING (user_id = current_setting('app.current_user_id', TRUE));

CREATE POLICY "Users can manage their own calendar events"
  ON calendar_events FOR ALL
  USING (user_id = current_setting('app.current_user_id', TRUE))
  WITH CHECK (user_id = current_setting('app.current_user_id', TRUE));

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

-- Sample data for testing (optional - remove in production)
-- INSERT INTO quizzes (title, description, questions, xp_reward, created_by)
-- VALUES (
--   'Basic Vocabulary Quiz',
--   'Test your basic English vocabulary',
--   '[{"id":"1","type":"multiple_choice","question_text":"What is the opposite of ''happy''?","options":["sad","angry","tired","hungry"],"correct_answer":"sad","explanation":"Sad is the opposite of happy."}]'::jsonb,
--   50,
--   'admin'
-- );
