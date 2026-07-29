import { useState, useEffect } from 'react';
import { Gift, Play, Lock } from 'lucide-react';
import { getRewards, unlockReward } from '../lib/db';
import { useUserProgress } from '../context/UserProgressContext';
import { Reward } from '../lib/supabase';
import Skeleton from '../components/Skeleton';

const Rewards = () => {
  const { progress, loading: progressLoading, refresh } = useUserProgress();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [rewardsLoading, setRewardsLoading] = useState(true);

  const loading = rewardsLoading || progressLoading;

  useEffect(() => {
    getRewards()
      .then(setRewards)
      .catch((err) => console.error('Failed to load rewards:', err))
      .finally(() => setRewardsLoading(false));
  }, []);

  const userXp = progress?.total_xp ?? 0;
  const unlockedRewards = progress?.unlocked_rewards ?? [];

  useEffect(() => {
    if (!progress) return;
    const toUnlock = rewards.filter(
      (reward) => userXp >= reward.xp_required && !unlockedRewards.includes(reward.id)
    );
    if (toUnlock.length === 0) return;
    Promise.all(toUnlock.map((reward) => unlockReward(reward.id)))
      .then(() => refresh())
      .catch((err) => console.error('Failed to unlock reward:', err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rewards, progress]);

  const nextReward = [...rewards]
    .filter((r) => r.xp_required > userXp)
    .sort((a, b) => a.xp_required - b.xp_required)[0];
  const maxXp = rewards.length ? Math.max(...rewards.map((r) => r.xp_required)) : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-28" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-warm-brown-800 flex items-center gap-3">
          <Gift className="w-8 h-8" />
          Your Rewards 🎁
        </h2>
      </div>

      <div className="card-warm bg-warm-tan-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-warm-terracotta-600 mb-1">Your Current XP</p>
            <p className="text-4xl font-bold text-warm-brown-800">{userXp} XP</p>
          </div>
          {nextReward && (
            <div className="text-right">
              <p className="text-sm text-warm-brown-400 mb-1">Next Reward At</p>
              <p className="text-2xl font-bold text-warm-terracotta-600">{nextReward.xp_required} XP</p>
            </div>
          )}
        </div>
        {maxXp > 0 && (
          <>
            <div className="progress-warm mt-4">
              <div className="progress-warm-fill" style={{ width: `${Math.min((userXp / maxXp) * 100, 100)}%` }} />
            </div>
            <p className="text-xs text-warm-terracotta-600 mt-2 text-center">
              {Math.max(maxXp - userXp, 0)} XP away from the ultimate surprise! 🌟
            </p>
          </>
        )}
      </div>

      {rewards.length === 0 ? (
        <div className="card-warm text-center py-12">
          <Gift className="w-12 h-12 mx-auto mb-3 text-warm-tan-400" />
          <p className="text-warm-brown-400">No rewards uploaded yet — check back soon! 💕</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward) => {
            const isUnlocked = userXp >= reward.xp_required;

            return (
              <div
                key={reward.id}
                className={`card-warm transition-all duration-300 ${
                  isUnlocked ? 'hover:shadow-lg cursor-pointer' : 'opacity-75'
                }`}
              >
                <div className="text-center mb-4">
                  <div
                    className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl ${
                      isUnlocked ? 'bg-warm-terracotta-500' : 'bg-warm-tan-200'
                    }`}
                  >
                    {isUnlocked ? (reward.media_type === 'video' ? '🎥' : '🖼️') : <Lock className="w-8 h-8 text-warm-brown-400" />}
                  </div>
                </div>

                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-warm-brown-800 mb-2">{reward.title}</h3>
                  <p className="text-sm text-warm-brown-500 mb-3">{reward.description}</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="badge-warm badge-warm-terracotta">{reward.xp_required} XP</span>
                    <span className="badge-warm badge-warm-sage capitalize">{reward.media_type}</span>
                  </div>
                </div>

                {isUnlocked ? (
                  <a
                    href={reward.media_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-warm btn-warm-primary w-full flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    {reward.media_type === 'video' ? 'Watch Now' : 'View Gallery'}
                  </a>
                ) : (
                  <button
                    disabled
                    className="w-full py-3 px-4 bg-warm-tan-100 text-warm-brown-400 rounded-2xl font-bold cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    Locked
                  </button>
                )}

                {!isUnlocked && (
                  <div className="mt-3">
                    <div className="progress-warm">
                      <div
                        className="h-full rounded-full bg-warm-tan-300"
                        style={{ width: `${Math.min((userXp / reward.xp_required) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-warm-brown-400 mt-1 text-center">
                      {reward.xp_required - userXp} XP more needed
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="card-warm text-center py-6">
        <p className="text-lg text-warm-brown-700">
          💝 <strong>Every XP brings you closer to special surprises!</strong>
        </p>
        <p className="text-sm text-warm-terracotta-600 mt-2">
          Keep studying and unlock all the rewards! I believe in you! 💕
        </p>
      </div>
    </div>
  );
};

export default Rewards;
