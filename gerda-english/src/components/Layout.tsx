import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { BookOpen, Calendar, Trophy, Gift, Settings, Home, Book, XCircle, GraduationCap } from 'lucide-react';
import { getUserProgress } from '../lib/db';
import BottomNav from './BottomNav';
import MoreSheet from './MoreSheet';

const Layout = () => {
  const location = useLocation();
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    getUserProgress()
      .then((progress) => {
        if (progress) {
          setXp(progress.total_xp);
          setLevel(progress.level);
          setStreak(progress.streak);
        }
      })
      .catch((err) => console.error('Failed to load progress:', err));
  }, [location.pathname]);

  useEffect(() => {
    setShowMore(false);
  }, [location.pathname]);

  const menuItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/course', icon: GraduationCap, label: 'Course' },
    { path: '/notebook', icon: BookOpen, label: 'Notebook' },
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/mistakes', icon: XCircle, label: 'Mistakes' },
    { path: '/quiz', icon: Book, label: 'Quiz' },
    { path: '/rewards', icon: Gift, label: 'Rewards' },
  ];

  const moreItems = [
    { path: '/notebook', icon: BookOpen, label: 'Notebook' },
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/mistakes', icon: XCircle, label: 'Mistakes' },
    { path: '/admin', icon: Settings, label: 'Admin Panel' },
  ];

  return (
    <div className="min-h-screen flex font-warm">
      <aside className="hidden md:flex w-64 bg-white border-r border-warm-tan-200 p-6 flex-col">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-warm-terracotta-500 to-warm-sage-500 bg-clip-text text-transparent">
            🎓 Gerda English
          </h1>
          <p className="text-sm text-warm-brown-500 mt-1">Let's learn together!</p>
        </div>

        <div className="card-warm mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-warm-brown-800">Level {level}</span>
            <Trophy className="w-6 h-6 text-warm-terracotta-400" />
          </div>
          <div className="progress-warm mb-2">
            <div className="progress-warm-fill" style={{ width: `${xp % 100}%` }} />
          </div>
          <p className="text-xs text-warm-brown-500">{xp} XP total</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-warm-brown-600">🔥 Streak</span>
            <span className="badge-warm badge-warm-terracotta">{streak} days</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-warm-terracotta-500 text-white shadow-sm'
                    : 'text-warm-brown-600 hover:bg-warm-cream-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <Link
          to="/admin"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-warm-brown-600 hover:bg-warm-cream-100 transition-all duration-200 mt-auto"
        >
          <Settings className="w-5 h-5" />
          <span className="font-semibold">Admin Panel</span>
        </Link>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 pb-24 md:p-8 md:pb-8 bg-warm-cream-50">
        <Outlet />
      </main>

      <BottomNav onMore={() => setShowMore(true)} />
      {showMore && <MoreSheet items={moreItems} onClose={() => setShowMore(false)} />}
    </div>
  );
};

export default Layout;
