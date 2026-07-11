import { useState } from 'react';
import { Gift, Play, Lock, Unlock } from 'lucide-react';

const Rewards = () => {
  const [userXp] = useState(1250);

  const rewards = [
    {
      id: 1,
      title: 'Special Message from Him 💕',
      description: 'A sweet video message just for you!',
      xpRequired: 500,
      type: 'video',
      thumbnail: '🎥',
      unlocked: true,
      content: 'https://example.com/video1.mp4',
    },
    {
      id: 2,
      title: 'Cute Photo Collection 📸',
      description: 'Beautiful memories together',
      xpRequired: 800,
      type: 'image',
      thumbnail: '🖼️',
      unlocked: true,
      content: 'https://example.com/gallery1',
    },
    {
      id: 3,
      title: 'Surprise Video Message 🎁',
      description: 'Something special to motivate you!',
      xpRequired: 1000,
      type: 'video',
      thumbnail: '🎬',
      unlocked: true,
      content: 'https://example.com/video2.mp4',
    },
    {
      id: 4,
      title: 'Date Night Idea 💑',
      description: 'A fun surprise for when you reach your goal!',
      xpRequired: 1500,
      type: 'text',
      thumbnail: '💝',
      unlocked: false,
      content: 'Complete the quiz to unlock!',
    },
    {
      id: 5,
      title: 'Special Dinner Video 🍽️',
      description: 'Watch this when you complete all modules!',
      xpRequired: 2000,
      type: 'video',
      thumbnail: '🎥',
      unlocked: false,
      content: 'Keep going! Almost there!',
    },
    {
      id: 6,
      title: 'Ultimate Surprise 🌟',
      description: 'The biggest reward for your hard work!',
      xpRequired: 3000,
      type: 'video',
      thumbnail: '⭐',
      unlocked: false,
      content: 'You\'re amazing! Keep studying!',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold font-cute text-cute-purple-700 flex items-center gap-3">
          <Gift className="w-8 h-8" />
          Your Rewards 🎁
        </h2>
      </div>

      {/* XP Display */}
      <div className="card-cute bg-gradient-to-r from-cute-pink-50 to-cute-purple-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-cute-pink-600 mb-1">Your Current XP</p>
            <p className="text-4xl font-bold text-cute-purple-700">{userXp} XP</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-1">Next Reward At</p>
            <p className="text-2xl font-bold text-cute-pink-600">1500 XP</p>
          </div>
        </div>
        <div className="progress-cute mt-4">
          <div
            className="progress-fill bg-gradient-to-r from-cute-pink-400 to-cute-purple-400"
            style={{ width: `${Math.min((userXp / 3000) * 100, 100)}%` }}
          />
        </div>
        <p className="text-xs text-cute-pink-600 mt-2 text-center">
          {3000 - userXp} XP away from the ultimate surprise! 🌟
        </p>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((reward) => {
          const isUnlocked = reward.unlocked || userXp >= reward.xpRequired;

          return (
            <div
              key={reward.id}
              className={`card-cute transition-all duration-300 ${
                isUnlocked
                  ? 'hover:scale-105 cursor-pointer'
                  : 'opacity-75'
              }`}
            >
              {/* Thumbnail */}
              <div className="text-center mb-4">
                <div
                  className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl ${
                    isUnlocked
                      ? 'bg-gradient-to-br from-cute-pink-400 to-cute-purple-400'
                      : 'bg-gray-300'
                  }`}
                >
                  {isUnlocked ? reward.thumbnail : <Lock className="w-8 h-8 text-gray-500" />}
                </div>
              </div>

              {/* Info */}
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-cute-purple-700 mb-2">
                  {reward.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{reward.description}</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="badge-cute badge-pink">
                    {reward.xpRequired} XP
                  </span>
                  <span className="badge-cute badge-purple capitalize">
                    {reward.type}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              {isUnlocked ? (
                <button className="btn-cute btn-primary w-full flex items-center justify-center gap-2">
                  {reward.type === 'video' ? (
                    <>
                      <Play className="w-4 h-4" />
                      Watch Now
                    </>
                  ) : reward.type === 'image' ? (
                    <>
                      <Play className="w-4 h-4" />
                      View Gallery
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4" />
                      Reveal
                    </>
                  )}
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-3 px-4 bg-gray-200 text-gray-500 rounded-2xl font-bold cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Locked
                </button>
              )}

              {/* Progress to Unlock */}
              {!isUnlocked && (
                <div className="mt-3">
                  <div className="progress-cute">
                    <div
                      className="progress-fill bg-gray-300"
                      style={{ width: `${Math.min((userXp / reward.xpRequired) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    {reward.xpRequired - userXp} XP more needed
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Motivational Message */}
      <div className="card-cute text-center py-6 bg-gradient-to-r from-cute-peach-50 via-cute-pink-50 to-cute-purple-50">
        <p className="text-lg text-cute-purple-700">
          💝 <strong>Every XP brings you closer to special surprises!</strong>
        </p>
        <p className="text-sm text-cute-pink-600 mt-2">
          Keep studying and unlock all the rewards! I believe in you! 💕
        </p>
      </div>
    </div>
  );
};

export default Rewards;
