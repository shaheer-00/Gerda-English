import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { getUserProgress } from '../lib/db';
import { UserProgress } from '../lib/supabase';

interface UserProgressContextValue {
  progress: UserProgress | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const UserProgressContext = createContext<UserProgressContextValue | undefined>(undefined);

export const UserProgressProvider = ({ children }: { children: ReactNode }) => {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await getUserProgress();
    setProgress(data);
  }, []);

  useEffect(() => {
    refresh()
      .catch((err) => console.error('Failed to load user progress:', err))
      .finally(() => setLoading(false));
  }, [refresh]);

  return (
    <UserProgressContext.Provider value={{ progress, loading, refresh }}>
      {children}
    </UserProgressContext.Provider>
  );
};

export const useUserProgress = () => {
  const ctx = useContext(UserProgressContext);
  if (!ctx) throw new Error('useUserProgress must be used within UserProgressProvider');
  return ctx;
};
