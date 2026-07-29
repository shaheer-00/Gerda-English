import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BookOpen, Award } from 'lucide-react';
import { getNotes, getMistakes, getQuizAttempts } from '../lib/db';
import { useCountUp } from '../hooks/useCountUp';
import Skeleton from '../components/Skeleton';

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

const cardMotionProps = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  whileHover: { y: -2, boxShadow: '0 8px 20px -6px rgba(92, 68, 38, 0.18)' },
  whileTap: { scale: 0.98 },
};

const Dashboard = () => {
  const [noteCount, setNoteCount] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [randomMessage] = useState(
    () => encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)]
  );

  const noteCountDisplay = useCountUp(noteCount);
  const mistakeCountDisplay = useCountUp(mistakeCount);

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
    return (
      <div className="space-y-8">
        <div className="text-center py-8 space-y-3">
          <Skeleton className="h-10 w-80 mx-auto" />
          <Skeleton className="h-6 w-56 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center py-8">
        <h2 className="text-4xl font-bold text-warm-brown-800 mb-2">Welcome back, Gerda! 🌸</h2>
        <p className="text-xl text-warm-terracotta-600">{randomMessage}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div className="card-warm" {...cardMotionProps} transition={{ delay: 0 * 0.08, duration: 0.3 }}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warm-terracotta-500 rounded-2xl">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-warm-brown-400">Notes Created</p>
              <p className="text-2xl font-bold text-warm-brown-800">{noteCountDisplay}</p>
            </div>
          </div>
        </motion.div>

        <motion.div className="card-warm" {...cardMotionProps} transition={{ delay: 1 * 0.08, duration: 0.3 }}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warm-sage-500 rounded-2xl">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-warm-brown-400">Mistakes Logged</p>
              <p className="text-2xl font-bold text-warm-brown-800">{mistakeCountDisplay}</p>
            </div>
          </div>
        </motion.div>

        <motion.div className="card-warm" {...cardMotionProps} transition={{ delay: 2 * 0.08, duration: 0.3 }}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warm-terracotta-500 rounded-2xl">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-warm-brown-400">Recent Activities</p>
              <p className="text-2xl font-bold text-warm-brown-800">{activities.length}</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div className="card-warm" {...cardMotionProps} transition={{ delay: 3 * 0.08, duration: 0.3 }}>
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
        </motion.div>

        <motion.div
          className="card-warm bg-warm-tan-50"
          {...cardMotionProps}
          transition={{ delay: 4 * 0.08, duration: 0.3 }}
        >
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
        </motion.div>
      </div>

      <motion.div
        className="card-warm text-center py-8"
        {...cardMotionProps}
        transition={{ delay: 5 * 0.08, duration: 0.3 }}
      >
        <p className="text-2xl font-warm text-warm-brown-800 mb-2">
          "Believe in yourself and all that you are."
        </p>
        <p className="text-warm-terracotta-600">- Christian D. Larson</p>
        <p className="mt-4 text-lg text-warm-brown-700">💕 You've got this! 💕</p>
      </motion.div>
    </div>
  );
};

export default Dashboard;
