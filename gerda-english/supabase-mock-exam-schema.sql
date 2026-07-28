-- IELTS Mock Exam Schema
-- Run this in your Supabase SQL Editor, after supabase-schema.sql

CREATE TABLE mock_exams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  module TEXT NOT NULL DEFAULT 'academic',
  sections JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE mock_exam_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  mock_exam_id UUID REFERENCES mock_exams(id) ON DELETE CASCADE,
  section_scores JSONB NOT NULL,
  estimated_band NUMERIC NOT NULL,
  answers JSONB NOT NULL,
  time_spent_seconds INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_progress ADD COLUMN completed_mock_exams UUID[] DEFAULT '{}';

CREATE INDEX idx_mock_exam_attempts_user_id ON mock_exam_attempts(user_id);

ALTER TABLE mock_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_exam_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Open access" ON mock_exams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Open access" ON mock_exam_attempts FOR ALL USING (true) WITH CHECK (true);
