# 🌸 Gerda English Learning App - Database Setup Guide

## Step 1: Create Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" or "Sign In"
3. Create a free account (GitHub sign-in recommended)

## Step 2: Create New Project

1. Click "New Project"
2. Choose your organization (or create one)
3. **Project name**: `gerda-english`
4. **Database password**: Choose a strong password (save it!)
5. **Region**: Choose closest to your location
6. Click "Create new project"
7. Wait 2-3 minutes for setup to complete

## Step 3: Get Your API Keys

1. In your Supabase dashboard, click **Settings** (gear icon) in sidebar
2. Click **API**
3. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

## Step 4: Configure Your Environment

1. In your project folder, create a `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and paste your keys:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 5: Set Up Database Schema

1. In Supabase dashboard, click **SQL Editor** in sidebar
2. Click **New Query**
3. Copy the entire contents of `supabase-schema.sql` from this project
4. Paste into the SQL editor
5. Click **Run** (or press Ctrl+Enter)
6. You should see "Success. No rows returned"

## Step 6: Verify Setup

1. Click **Table Editor** in sidebar
2. You should see these tables:
   - `notes`
   - `mistakes`
   - `quizzes`
   - `quiz_attempts`
   - `rewards`
   - `user_progress`
   - `calendar_events`

## Step 7: Test Connection

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open browser to `http://localhost:5173`
3. Try creating a note - it should save to the database!
4. Check Supabase Table Editor to see your data

## Troubleshooting

### "Supabase credentials not found" warning
- Make sure `.env` file exists (not `.env.example`)
- Restart your dev server after creating `.env`
- Check that variable names match exactly

### "permission denied" errors
- Verify you ran the SQL schema correctly
- Check that RLS policies are enabled
- Make sure user_id is set to 'gerda' in the code

### Can't connect to Supabase
- Check your internet connection
- Verify Project URL is correct (no typos)
- Make sure project status is "Active" in Supabase dashboard

## Optional: Add Sample Data

To test with sample quizzes and rewards:

1. Go to SQL Editor in Supabase
2. Run this query:

```sql
-- Sample Quiz
INSERT INTO quizzes (title, description, questions, xp_reward, created_by)
VALUES (
  'Basic Vocabulary - Colors',
  'Learn common color words',
  '[
    {"id":"q1","type":"multiple_choice","question_text":"What color is the sky on a clear day?","options":["green","blue","red","yellow"],"correct_answer":"blue","explanation":"The sky is blue!"},
    {"id":"q2","type":"multiple_choice","question_text":"What color is grass?","options":["blue","purple","green","orange"],"correct_answer":"green","explanation":"Grass is green!"},
    {"id":"q3","type":"multiple_choice","question_text":"What color is a lemon?","options":["yellow","blue","black","pink"],"correct_answer":"yellow","explanation":"Lemons are yellow!"}
  ]'::jsonb,
  50,
  'admin'
);

-- Sample Reward
INSERT INTO rewards (title, description, media_url, media_type, xp_required, created_by)
VALUES (
  'Cute Cat Video!',
  'You earned this! Watch a cute cat 🐱',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'video',
  100,
  'admin'
);
```

## Storage Setup (for uploading videos/images)

For the reward system to work with your own media:

1. In Supabase dashboard, click **Storage**
2. Click **New Bucket**
3. Name: `rewards`
4. Public: ✅ Yes
5. Click **Create**
6. Upload your videos/images there
7. Use the public URL in your rewards

---

🎉 **You're all set!** Your app now has a real database that will keep all notes, progress, and rewards safe!
