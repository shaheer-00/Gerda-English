import { supabase, Note, Mistake, Quiz, QuizAttempt, Reward, UserProgress, CalendarEvent } from './supabase';

const USER_ID = 'gerda'; // Simple single-user setup for now

// Notes Functions
export async function getNotes(): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', USER_ID)
    .order('updated_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function saveNote(note: Partial<Note>): Promise<Note> {
  const now = new Date().toISOString();
  const noteData = {
    ...note,
    user_id: USER_ID,
    updated_at: now,
  };

  if (note.id) {
    const { data, error } = await supabase
      .from('notes')
      .update(noteData)
      .eq('id', note.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('notes')
      .insert([{ ...noteData, created_at: now }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Mistakes Functions
export async function getMistakes(): Promise<Mistake[]> {
  const { data, error } = await supabase
    .from('mistakes')
    .select('*')
    .eq('user_id', USER_ID)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function addMistake(mistake: Partial<Mistake>): Promise<Mistake> {
  const mistakeData = {
    ...mistake,
    user_id: USER_ID,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('mistakes')
    .insert([mistakeData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Quiz Functions
export async function getQuizzes(): Promise<Quiz[]> {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function createQuiz(quiz: Partial<Quiz>): Promise<Quiz> {
  const quizData = {
    ...quiz,
    created_by: 'admin',
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('quizzes')
    .insert([quizData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function submitQuizAttempt(attempt: Partial<QuizAttempt>): Promise<QuizAttempt> {
  const attemptData = {
    ...attempt,
    user_id: USER_ID,
    completed_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert([attemptData])
    .select()
    .single();
  
  if (error) throw error;
  
  // Update user progress
  if (attempt.xp_earned) {
    await addXP(attempt.xp_earned);
  }
  
  return data;
}

// User Progress Functions
export async function getUserProgress(): Promise<UserProgress | null> {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', USER_ID)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data;
}

export async function addXP(amount: number): Promise<UserProgress | null> {
  const progress = await getUserProgress();
  
  if (!progress) {
    const { data, error } = await supabase
      .from('user_progress')
      .insert([{
        user_id: USER_ID,
        total_xp: amount,
        level: Math.floor(amount / 100) + 1,
        streak: 1,
        last_activity: new Date().toISOString(),
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  const newXp = progress.total_xp + amount;
  const newLevel = Math.floor(newXp / 100) + 1;
  
  // Check if streak should be reset
  const lastActivity = new Date(progress.last_activity);
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
  const newStreak = daysDiff <= 1 ? progress.streak + 1 : 1;
  
  const { data, error } = await supabase
    .from('user_progress')
    .update({
      total_xp: newXp,
      level: newLevel,
      streak: newStreak,
      last_activity: now.toISOString(),
    })
    .eq('user_id', USER_ID)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Rewards Functions
export async function getRewards(): Promise<Reward[]> {
  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .order('xp_required', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

export async function createReward(reward: Partial<Reward>): Promise<Reward> {
  const rewardData = {
    ...reward,
    created_by: 'admin',
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('rewards')
    .insert([rewardData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function unlockReward(rewardId: string): Promise<void> {
  const progress = await getUserProgress();
  if (!progress) return;
  
  const unlockedRewards = progress.unlocked_rewards || [];
  if (!unlockedRewards.includes(rewardId)) {
    unlockedRewards.push(rewardId);
    
    const { error } = await supabase
      .from('user_progress')
      .update({ unlocked_rewards: unlockedRewards })
      .eq('user_id', USER_ID);
    
    if (error) throw error;
  }
}

// Calendar Functions
export async function getCalendarEvents(month?: number, year?: number): Promise<CalendarEvent[]> {
  let query = supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', USER_ID);
  
  if (month && year) {
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    query = query.gte('date', startDate).lte('date', endDate);
  }
  
  const { data, error } = await query.order('date', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

export async function createCalendarEvent(event: Partial<CalendarEvent>): Promise<CalendarEvent> {
  const eventData = {
    ...event,
    user_id: USER_ID,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('calendar_events')
    .insert([eventData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateCalendarEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
  const { data, error } = await supabase
    .from('calendar_events')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteCalendarEvent(id: string): Promise<void> {
  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}
