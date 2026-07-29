import { Link } from 'react-router-dom';
import { X, LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface MoreSheetItem {
  path: string;
  icon: LucideIcon;
  label: string;
}

interface MoreSheetProps {
  items: MoreSheetItem[];
  onClose: () => void;
}

const MoreSheet = ({ items, onClose }: MoreSheetProps) => {
  return (
    <div className="md:hidden fixed inset-0 z-50 flex items-end">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="relative w-full bg-white rounded-t-3xl p-6 pb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-warm-brown-800">More</h3>
          <button onClick={onClose} className="text-warm-brown-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-warm-brown-700 hover:bg-warm-cream-100 transition-colors"
              >
                <Icon className="w-5 h-5" />
                <span className="font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default MoreSheet;
