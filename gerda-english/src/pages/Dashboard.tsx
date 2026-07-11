import { useState } from 'react';
import { TrendingUp, BookOpen, Clock, Award } from 'lucide-react';

const Dashboard = () => {
  const [todayGoal] = useState(50);
  const [todayProgress] = useState(35);

  const recentActivities = [
    { id: 1, type: 'note', title: 'New vocabulary notes', xp: 20, time: '2 hours ago' },
    { id: 2, type: 'quiz', title: 'Completed Listening Quiz', xp: 50, time: '5 hours ago' },
    { id: 3, type: 'mistake', title: 'Reviewed 5 mistakes', xp: 15, time: 'Yesterday' },
  ];

  const encouragementMessages = [
    "You're doing amazing! 🌟",
    "Every day you're getting better! 💪",
    "I'm so proud of you! 💕",
    "Keep going, superstar! ✨",
    "Your hard work is paying off! 🎉",
  ];

  const randomMessage = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center py-8">
        <h2 className="text-4xl font-bold font-cute text-cute-purple-700 mb-2">
          Welcome back, Gerda! 🌸
        </h2>
        <p className="text-xl text-cute-pink-600">{randomMessage}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-cute">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-cute-pink-400 to-cute-purple-400 rounded-2xl">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Today's Goal</p>
              <p className="text-2xl font-bold text-cute-purple-700">{todayProgress}/{todayGoal} XP</p>
            </div>
          </div>
          <div className="progress-cute mt-3">
            <div 
              className="progress-fill bg-gradient-to-r from-cute-pink-400 to-cute-purple-400"
              style={{ width: `${(todayProgress / todayGoal) * 100}%` }}
            />
          </div>
        </div>

        <div className="card-cute">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-cute-blue-400 to-cute-mint-400 rounded-2xl">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Notes Created</p>
              <p className="text-2xl font-bold text-cute-purple-700">24</p>
            </div>
          </div>
        </div>

        <div className="card-cute">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-cute-peach-400 to-cute-pink-400 rounded-2xl">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Study Time</p>
              <p className="text-2xl font-bold text-cute-purple-700">12.5h</p>
            </div>
          </div>
        </div>

        <div className="card-cute">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-cute-purple-400 to-cute-pink-400 rounded-2xl">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Achievements</p>
              <p className="text-2xl font-bold text-cute-purple-700">8/20</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="card-cute">
          <h3 className="text-xl font-bold text-cute-purple-700 mb-4">Recent Activity 📝</h3>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-cute-pink-50 rounded-xl">
                <div>
                  <p className="font-semibold text-cute-purple-700">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
                <span className="badge-cute badge-pink">+{activity.xp} XP</span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Tip */}
        <div className="card-cute bg-gradient-to-br from-cute-pink-100 to-cute-purple-100">
          <h3 className="text-xl font-bold text-cute-purple-700 mb-4">💡 Daily Tip</h3>
          <div className="space-y-4">
            <p className="text-cute-purple-800 leading-relaxed">
              <strong>Listening Practice:</strong> Try watching your favorite English TV shows with subtitles. 
              Start with English subtitles, then try without! 📺
            </p>
            <p className="text-cute-purple-800 leading-relaxed">
              <strong>Vocabulary:</strong> Learn 5 new words every day and use them in sentences. 
              Write them in your notebook! 📖
            </p>
            <div className="pt-4">
              <p className="text-sm text-cute-pink-600 italic">
                Remember: Progress, not perfection! Every small step counts! 🌈
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Quote */}
      <div className="card-cute text-center py-8 bg-gradient-to-r from-cute-pink-50 via-cute-purple-50 to-cute-mint-50">
        <p className="text-2xl font-cute text-cute-purple-700 mb-2">
          "Believe in yourself and all that you are." 
        </p>
        <p className="text-cute-pink-600">- Christian D. Larson</p>
        <p className="mt-4 text-lg">💕 You've got this! 💕</p>
      </div>
    </div>
  );
};

export default Dashboard;
