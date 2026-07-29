import { Link, useLocation } from 'react-router-dom';
import { Home, GraduationCap, Book, Gift, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

interface BottomNavProps {
  onMore: () => void;
}

const primaryItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/course', icon: GraduationCap, label: 'Course' },
  { path: '/quiz', icon: Book, label: 'Quiz' },
  { path: '/rewards', icon: Gift, label: 'Rewards' },
];

const BottomNav = ({ onMore }: BottomNavProps) => {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-warm-tan-200 flex items-stretch z-40">
      {primaryItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className="relative flex-1 flex flex-col items-center justify-center gap-1 py-2 text-xs font-semibold"
          >
            {isActive && (
              <motion.div
                layoutId="mobile-nav-indicator"
                className="absolute inset-x-2 inset-y-1 bg-warm-terracotta-50 rounded-xl -z-10"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <motion.div whileTap={{ scale: 0.9 }} className="flex flex-col items-center gap-1">
              <Icon className={`w-5 h-5 ${isActive ? 'text-warm-terracotta-600' : 'text-warm-brown-400'}`} />
              <span className={isActive ? 'text-warm-terracotta-600' : 'text-warm-brown-400'}>{item.label}</span>
            </motion.div>
          </Link>
        );
      })}
      <button
        onClick={onMore}
        className="flex-1 flex flex-col items-center justify-center gap-1 py-2 text-xs font-semibold text-warm-brown-400"
      >
        <motion.div whileTap={{ scale: 0.9 }} className="flex flex-col items-center gap-1">
          <MoreHorizontal className="w-5 h-5" />
          More
        </motion.div>
      </button>
    </nav>
  );
};

export default BottomNav;
