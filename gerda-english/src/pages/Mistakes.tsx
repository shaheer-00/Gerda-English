import { useState } from 'react';
import { XCircle, BookOpen, Headphones, Eye, PenTool, Mic } from 'lucide-react';

const Mistakes = () => {
  const [filter, setFilter] = useState('all');

  const mistakes = [
    {
      id: 1,
      type: 'reading',
      original: 'The government are planning to build new schools.',
      correction: 'The government is planning to build new schools.',
      explanation: '"Government" is a collective noun and takes singular verb "is", not "are".',
      date: '2024-01-15',
    },
    {
      id: 2,
      type: 'listening',
      original: 'I heard "fifty" but wrote "fifteen"',
      correction: 'Listen carefully to the stress: FIF-teen vs FIF-ty',
      explanation: 'The stress pattern is different. Practice listening to numbers.',
      date: '2024-01-14',
    },
    {
      id: 3,
      type: 'vocabulary',
      original: 'I made my homework yesterday.',
      correction: 'I did my homework yesterday.',
      explanation: 'We "do" homework, not "make" homework. Common collocation mistake.',
      date: '2024-01-13',
    },
    {
      id: 4,
      type: 'grammar',
      original: 'She don\'t like coffee.',
      correction: 'She doesn\'t like coffee.',
      explanation: 'Third person singular (he/she/it) uses "doesn\'t", not "don\'t".',
      date: '2024-01-12',
    },
    {
      id: 5,
      type: 'reading',
      original: 'I chose answer B but correct was C',
      correction: 'Review the passage more carefully for synonyms and paraphrasing.',
      explanation: 'IELTS Reading often uses synonyms. Look for similar meanings, not exact words.',
      date: '2024-01-11',
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reading': return <Eye className="w-5 h-5" />;
      case 'listening': return <Headphones className="w-5 h-5" />;
      case 'vocabulary': return <BookOpen className="w-5 h-5" />;
      case 'grammar': return <PenTool className="w-5 h-5" />;
      default: return <XCircle className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'reading': return 'from-cute-blue-400 to-cute-mint-400';
      case 'listening': return 'from-cute-purple-400 to-cute-pink-400';
      case 'vocabulary': return 'from-cute-peach-400 to-cute-pink-400';
      case 'grammar': return 'from-cute-mint-400 to-cute-blue-400';
      default: return 'from-cute-pink-400 to-cute-purple-400';
    }
  };

  const filteredMistakes = filter === 'all' 
    ? mistakes 
    : mistakes.filter(m => m.type === filter);

  const stats = {
    total: mistakes.length,
    reading: mistakes.filter(m => m.type === 'reading').length,
    listening: mistakes.filter(m => m.type === 'listening').length,
    vocabulary: mistakes.filter(m => m.type === 'vocabulary').length,
    grammar: mistakes.filter(m => m.type === 'grammar').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold font-cute text-cute-purple-700 flex items-center gap-3">
          <XCircle className="w-8 h-8" />
          My Mistakes Bank 📚
        </h2>
        <p className="text-cute-pink-600">Learn from mistakes = Get better! 💪</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card-cute text-center">
          <p className="text-3xl font-bold text-cute-purple-700">{stats.total}</p>
          <p className="text-sm text-gray-500">Total</p>
        </div>
        <div className="card-cute text-center bg-gradient-to-br from-cute-blue-50 to-cute-mint-50">
          <p className="text-3xl font-bold text-cute-blue-700">{stats.reading}</p>
          <p className="text-sm text-gray-500">Reading</p>
        </div>
        <div className="card-cute text-center bg-gradient-to-br from-cute-purple-50 to-cute-pink-50">
          <p className="text-3xl font-bold text-cute-purple-700">{stats.listening}</p>
          <p className="text-sm text-gray-500">Listening</p>
        </div>
        <div className="card-cute text-center bg-gradient-to-br from-cute-peach-50 to-cute-pink-50">
          <p className="text-3xl font-bold text-cute-peach-700">{stats.vocabulary}</p>
          <p className="text-sm text-gray-500">Vocabulary</p>
        </div>
        <div className="card-cute text-center bg-gradient-to-br from-cute-mint-50 to-cute-blue-50">
          <p className="text-3xl font-bold text-cute-mint-700">{stats.grammar}</p>
          <p className="text-sm text-gray-500">Grammar</p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-3">
        {['all', 'reading', 'listening', 'vocabulary', 'grammar'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 ${
              filter === type
                ? 'bg-gradient-to-r from-cute-pink-400 to-cute-purple-400 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-cute-pink-50'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Mistakes List */}
      <div className="space-y-4">
        {filteredMistakes.map((mistake) => (
          <div key={mistake.id} className="card-cute">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl bg-gradient-to-br ${getTypeColor(mistake.type)} text-white`}>
                {getTypeIcon(mistake.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <span className="badge-cute badge-pink capitalize">{mistake.type}</span>
                  <span className="text-xs text-gray-500">{mistake.date}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div className="p-4 bg-red-50 rounded-xl border-2 border-red-200">
                    <p className="text-xs text-red-600 font-bold mb-1">❌ My Answer:</p>
                    <p className="text-gray-700">{mistake.original}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
                    <p className="text-xs text-green-600 font-bold mb-1">✅ Correct:</p>
                    <p className="text-gray-700">{mistake.correction}</p>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-cute-pink-50 to-cute-purple-50 rounded-xl">
                  <p className="text-sm text-cute-purple-700">
                    <strong>💡 Explanation:</strong> {mistake.explanation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Encouragement */}
      <div className="card-cute text-center py-6 bg-gradient-to-r from-cute-mint-50 via-cute-blue-50 to-cute-purple-50">
        <p className="text-lg text-cute-purple-700">
          🌟 <strong>Great job reviewing!</strong> Every mistake you learn from makes you stronger!
        </p>
        <p className="text-sm text-cute-pink-600 mt-2">
          Review your mistakes regularly to avoid repeating them in the exam!
        </p>
      </div>
    </div>
  );
};

export default Mistakes;
