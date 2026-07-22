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
    return <p className="text-center text-warm-brown-600 py-12">Loading dashboard... 🌸</p>;
  }

  return (
    <div className="space-y-8">
      <div className="text-center py-8">
        <h2 className="text-4xl font-bold text-warm-brown-800 mb-2">Welcome back, Gerda! 🌸</h2>
        <p className="text-xl text-warm-terracotta-600">{randomMessage}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card-warm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warm-terracotta-500 rounded-2xl">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-warm-brown-400">Notes Created</p>
              <p className="text-2xl font-bold text-warm-brown-800">{noteCount}</p>
            </div>
          </div>
        </div>

        <div className="card-warm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warm-sage-500 rounded-2xl">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-warm-brown-400">Mistakes Logged</p>
              <p className="text-2xl font-bold text-warm-brown-800">{mistakeCount}</p>
            </div>
          </div>
        </div>

        <div className="card-warm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warm-terracotta-500 rounded-2xl">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-warm-brown-400">Recent Activities</p>
              <p className="text-2xl font-bold text-warm-brown-800">{activities.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-warm">
          <h3 className="text-xl font-bold text-warm-brown-800 mb-4">Recent Activity 📝</h3>
          <div className="space-y-3">
            {activities.length === 0 && (
              <p className="text-sm text-warm-brown-400 text-center py-4">
                Nothing yet — go create a note or try a quiz! 🌸
              </p>
            )}
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-warm-cream-100 rounded-xl">
                <div>
                  <p className="font-semibold text-warm-brown-800">{activity.title}</p>
                  <p className="text-xs text-warm-brown-400">{activity.time}</p>
                </div>
                <span className="badge-warm badge-warm-terracotta">+{activity.xp} XP</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-warm bg-warm-tan-50">
          <h3 className="text-xl font-bold text-warm-brown-800 mb-4">💡 Daily Tip</h3>
          <div className="space-y-4">
            <p className="text-warm-brown-700 leading-relaxed">
              <strong>Listening Practice:</strong> Try watching your favorite English TV shows with subtitles.
              Start with English subtitles, then try without! 📺
            </p>
            <p className="text-warm-brown-700 leading-relaxed">
              <strong>Vocabulary:</strong> Learn 5 new words every day and use them in sentences. Write them
              in your notebook! 📖
            </p>
            <div className="pt-4">
              <p className="text-sm text-warm-terracotta-600 italic">
                Remember: Progress, not perfection! Every small step counts! 🌈
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card-warm text-center py-8">
        <p className="text-2xl font-warm text-warm-brown-800 mb-2">
          "Believe in yourself and all that you are."
        </p>
        <p className="text-warm-terracotta-600">- Christian D. Larson</p>
        <p className="mt-4 text-lg text-warm-brown-700">💕 You've got this! 💕</p>
      </div>
    </div>
  );
};

export default Dashboard;
