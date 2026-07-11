import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { BookOpen, Calendar, Star, Trophy, Gift, Settings, Home, Book, XCircle } from 'lucide-react';

const Layout = () => {
  const location = useLocation();
  const [xp, setXp] = useState(1250);
  const [level, setLevel] = useState(5);
  const [streak, setStreak] = useState(7);

  const menuItems = [
    { path: '/', icon: Home, label: 'Home', color: 'from-cute-pink-400 to-cute-purple-400' },
    { path: '/notebook', icon: BookOpen, label: 'Notebook', color: 'from-cute-blue-400 to-cute-mint-400' },
    { path: '/calendar', icon: Calendar, label: 'Calendar', color: 'from-cute-peach-400 to-cute-pink-400' },
    { path: '/mistakes', icon: XCircle, label: 'Mistakes', color: 'from-cute-purple-400 to-cute-pink-400' },
    { path: '/quiz', icon: Book, label: 'Quiz', color: 'from-cute-mint-400 to-cute-blue-400' },
    { path: '/rewards', icon: Gift, label: 'Rewards', color: 'from-cute-pink-400 to-cute-peach-400' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar Navigation - Tablet Optimized */}
      <aside className="w-64 bg-white/90 backdrop-blur-sm border-r-2 border-cute-pink-100 p-6 flex flex-col">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold font-cute bg-gradient-to-r from-cute-pink-400 to-cute-purple-400 bg-clip-text text-transparent">
            🌸 Gerda English
          </h1>
          <p className="text-sm text-cute-pink-600 mt-1">Let's learn together! 💕</p>
        </div>

        {/* User Stats */}
        <div className="card-cute mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold">Level {level}</span>
            <Trophy className="w-6 h-6 text-yellow-400" />
          </div>
          <div className="progress-cute mb-2">
            <div 
              className="progress-fill bg-gradient-to-r from-cute-pink-400 to-cute-purple-400"
              style={{ width: `${(xp % 1000) / 10}%` }}
            />
          </div>
          <p className="text-xs text-cute-pink-600">{xp} XP total</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm">🔥 Streak</span>
            <span className="badge-cute badge-pink">{streak} days</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                  isActive
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                    : 'text-gray-600 hover:bg-cute-pink-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Admin Link */}
        <Link
          to="/admin"
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-600 hover:bg-cute-purple-50 transition-all duration-300 mt-auto"
        >
          <Settings className="w-5 h-5" />
          <span className="font-semibold">Admin Panel</span>
        </Link>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
