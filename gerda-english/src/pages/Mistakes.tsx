import { useState, useEffect } from 'react';
import { XCircle, BookOpen, Headphones, Eye, PenTool, SpellCheck } from 'lucide-react';
import { getMistakes } from '../lib/db';
import { Mistake } from '../lib/supabase';

const Mistakes = () => {
  const [filter, setFilter] = useState('all');
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMistakes()
      .then(setMistakes)
      .catch((err) => console.error('Failed to load mistakes:', err))
      .finally(() => setLoading(false));
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reading':
        return <Eye className="w-5 h-5" />;
      case 'listening':
        return <Headphones className="w-5 h-5" />;
      case 'vocabulary':
        return <BookOpen className="w-5 h-5" />;
      case 'grammar':
        return <PenTool className="w-5 h-5" />;
      case 'spelling':
        return <SpellCheck className="w-5 h-5" />;
      default:
        return <XCircle className="w-5 h-5" />;
    }
  };

  const filteredMistakes = filter === 'all' ? mistakes : mistakes.filter((m) => m.error_type === filter);

  const stats = {
    total: mistakes.length,
    reading: mistakes.filter((m) => m.error_type === 'reading').length,
    listening: mistakes.filter((m) => m.error_type === 'listening').length,
    vocabulary: mistakes.filter((m) => m.error_type === 'vocabulary').length,
    grammar: mistakes.filter((m) => m.error_type === 'grammar').length,
    spelling: mistakes.filter((m) => m.error_type === 'spelling').length,
  };

  if (loading) {
    return <p className="text-center text-warm-brown-600 py-12">Loading mistakes... 🌸</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-warm-brown-800 flex items-center gap-3">
          <XCircle className="w-8 h-8" />
          My Mistakes Bank 📚
        </h2>
        <p className="text-warm-terracotta-600">Learn from mistakes = Get better! 💪</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="card-warm text-center">
          <p className="text-3xl font-bold text-warm-brown-800">{stats.total}</p>
          <p className="text-sm text-warm-brown-400">Total</p>
        </div>
        <div className="card-warm text-center">
          <p className="text-3xl font-bold text-warm-terracotta-600">{stats.reading}</p>
          <p className="text-sm text-warm-brown-400">Reading</p>
        </div>
        <div className="card-warm text-center">
          <p className="text-3xl font-bold text-warm-terracotta-600">{stats.listening}</p>
          <p className="text-sm text-warm-brown-400">Listening</p>
        </div>
        <div className="card-warm text-center">
          <p className="text-3xl font-bold text-warm-sage-600">{stats.vocabulary}</p>
          <p className="text-sm text-warm-brown-400">Vocabulary</p>
        </div>
        <div className="card-warm text-center">
          <p className="text-3xl font-bold text-warm-sage-600">{stats.grammar}</p>
          <p className="text-sm text-warm-brown-400">Grammar</p>
        </div>
        <div className="card-warm text-center">
          <p className="text-3xl font-bold text-warm-terracotta-600">{stats.spelling}</p>
          <p className="text-sm text-warm-brown-400">Spelling</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {['all', 'reading', 'listening', 'vocabulary', 'grammar', 'spelling'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 ${
              filter === type
                ? 'bg-warm-terracotta-500 text-white shadow-sm'
                : 'bg-white text-warm-brown-600 hover:bg-warm-cream-100 border border-warm-tan-200'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredMistakes.length === 0 && (
          <p className="text-center text-warm-brown-400 py-8">No mistakes logged yet — nice! 🌟</p>
        )}
        {filteredMistakes.map((mistake) => (
          <div key={mistake.id} className="card-warm">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-warm-terracotta-500 text-white">
                {getTypeIcon(mistake.error_type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <span className="badge-warm badge-warm-terracotta capitalize">{mistake.error_type}</span>
                  <span className="text-xs text-warm-brown-400">
                    {new Date(mistake.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                    <p className="text-xs text-red-600 font-bold mb-1">❌ My Answer:</p>
                    <p className="text-warm-brown-700">{mistake.original_text}</p>
                  </div>
                  <div className="p-4 bg-warm-sage-50 rounded-xl border border-warm-sage-200">
                    <p className="text-xs text-warm-sage-700 font-bold mb-1">✅ Correct:</p>
                    <p className="text-warm-brown-700">{mistake.corrected_text}</p>
                  </div>
                </div>

                {mistake.explanation && (
                  <div className="p-4 bg-warm-cream-100 rounded-xl">
                    <p className="text-sm text-warm-brown-700">
                      <strong>💡 Explanation:</strong> {mistake.explanation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card-warm text-center py-6">
        <p className="text-lg text-warm-brown-700">
          🌟 <strong>Great job reviewing!</strong> Every mistake you learn from makes you stronger!
        </p>
        <p className="text-sm text-warm-terracotta-600 mt-2">
          Review your mistakes regularly to avoid repeating them in the exam!
        </p>
      </div>
    </div>
  );
};

export default Mistakes;
