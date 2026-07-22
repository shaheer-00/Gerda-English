import { useState, useEffect } from 'react';
import { TrendingUp, BookOpen, Award } from 'lucide-react';
import { getNotes, getMistakes, getQuizAttempts } from '../lib/db';

interface ActivityItem {
  id: string;
  title: string;
  xp: number;
  time: string;
}

const encouragementMessages = [
  "You're doing amazing! 🌟",
  "Every day you're getting better! 💪",
  "I'm so proud of you! 💕",
  "Keep going, superstar! ✨",
  "Your hard work is paying off! 🎉",
];

const Dashboard = () => {
  const [noteCount, setNoteCount] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [randomMessage] = useState(
    () => encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)]
  );

  useEffect(() => {
    Promise.all([getNotes(), getMistakes(), getQuizAttempts()])
      .then(([notes, mistakes, attempts]) => {
        setNoteCount(notes.length);
        setMistakeCount(mistakes.length);

        const noteActivities: ActivityItem[] = notes.slice(0, 5).map((n) => ({
          id: `note-${n.id}`,
          title: `New note: ${n.title}`,
          xp: 20,
          time: n.created_at,
        }));
        const mistakeActivities: ActivityItem[] = mistakes.slice(0, 5).map((m) => ({
          id: `mistake-${m.id}`,
          title: `Logged a ${m.error_type} mistake`,
          xp: 5,
          time: m.created_at,
        }));
        const quizActivities: ActivityItem[] = attempts.slice(0, 5).map((a) => ({
          id: `quiz-${a.id}`,
          title: `Completed a quiz — ${a.score}/${a.total_questions}`,
          xp: a.xp_earned,
          time: a.completed_at,
        }));

        const merged = [...noteActivities, ...mistakeActivities, ...quizActivities]
          .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
          .slice(0, 5)
          .map((item) => ({ ...item, time: new Date(item.time).toLocaleDateString() }));

        setActivities(merged);
      })
      .catch((err) => console.error('Failed to load dashboard data:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-center text-cute-pink-600 py-12">Loading dashboard... 🌸</p>;
  }

  return (
    <div className="space-y-8">
      <div className="text-center py-8">
        <h2 className="text-4xl font-bold font-cute text-cute-purple-700 mb-2">Welcome back, Gerda! 🌸</h2>
        <p className="text-xl text-cute-pink-600">{randomMessage}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card-cute">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-cute-blue-400 to-cute-mint-400 rounded-2xl">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Notes Created</p>
              <p className="text-2xl font-bold text-cute-purple-700">{noteCount}</p>
            </div>
          </div>
        </div>

        <div className="card-cute">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-cute-peach-400 to-cute-pink-400 rounded-2xl">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Mistakes Logged</p>
              <p className="text-2xl font-bold text-cute-purple-700">{mistakeCount}</p>
            </div>
          </div>
        </div>

        <div className="card-cute">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-cute-purple-400 to-cute-pink-400 rounded-2xl">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Recent Activities</p>
              <p className="text-2xl font-bold text-cute-purple-700">{activities.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-cute">
          <h3 className="text-xl font-bold text-cute-purple-700 mb-4">Recent Activity 📝</h3>
          <div className="space-y-3">
            {activities.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                Nothing yet — go create a note or try a quiz! 🌸
              </p>
            )}
            {activities.map((activity) => (
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

        <div className="card-cute bg-gradient-to-br from-cute-pink-100 to-cute-purple-100">
          <h3 className="text-xl font-bold text-cute-purple-700 mb-4">💡 Daily Tip</h3>
          <div className="space-y-4">
            <p className="text-cute-purple-800 leading-relaxed">
              <strong>Listening Practice:</strong> Try watching your favorite English TV shows with subtitles.
              Start with English subtitles, then try without! 📺
            </p>
            <p className="text-cute-purple-800 leading-relaxed">
              <strong>Vocabulary:</strong> Learn 5 new words every day and use them in sentences. Write them
              in your notebook! 📖
            </p>
            <div className="pt-4">
              <p className="text-sm text-cute-pink-600 italic">
                Remember: Progress, not perfection! Every small step counts! 🌈
              </p>
            </div>
          </div>
        </div>
      </div>

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
