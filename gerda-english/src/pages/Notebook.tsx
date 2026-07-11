import { useState, useRef } from 'react';
import { Save, Search, BookOpen, Plus, Trash2 } from 'lucide-react';

interface WordDefinition {
  word: string;
  definition: string;
  example: string;
}

const Notebook = () => {
  const [notes, setNotes] = useState([
    {
      id: 1,
      title: 'IELTS Listening Vocabulary',
      content: 'Today I learned about common listening test words...',
      date: '2024-01-15',
      tags: ['listening', 'vocabulary'],
    },
    {
      id: 2,
      title: 'Reading Practice Notes',
      content: 'Tips for reading comprehension: 1. Skim first...',
      date: '2024-01-14',
      tags: ['reading', 'tips'],
    },
  ]);

  const [currentNote, setCurrentNote] = useState({ title: '', content: '' });
  const [showDictionary, setShowDictionary] = useState(false);
  const [selectedWord, setSelectedWord] = useState<WordDefinition | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Simple dictionary (in production, use an API)
  const simpleDictionary: Record<string, WordDefinition> = {
    'accommodation': {
      word: 'accommodation',
      definition: 'A place to live or stay',
      example: 'I need to find accommodation near the university.',
    },
    'environment': {
      word: 'environment',
      definition: 'The natural world or surroundings',
      example: 'We should protect the environment.',
    },
    'government': {
      word: 'government',
      definition: 'The group of people who control a country',
      example: 'The government announced new policies.',
    },
    'education': {
      word: 'education',
      definition: 'The process of teaching and learning',
      example: 'Education is very important for success.',
    },
    'technology': {
      word: 'technology',
      definition: 'Modern machines and equipment',
      example: 'Technology has changed our lives.',
    },
  };

  const handleWordClick = (word: string) => {
    const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
    if (simpleDictionary[cleanWord]) {
      setSelectedWord(simpleDictionary[cleanWord]);
      setShowDictionary(true);
    }
  };

  const handleSaveNote = () => {
    if (currentNote.title && currentNote.content) {
      const newNote = {
        id: Date.now(),
        ...currentNote,
        date: new Date().toISOString().split('T')[0],
        tags: ['general'],
      };
      setNotes([newNote, ...notes]);
      setCurrentNote({ title: '', content: '' });
    }
  };

  const handleDeleteNote = (id: number) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const renderContentWithClickableWords = (content: string) => {
    const words = content.split(' ');
    return words.map((word, index) => {
      const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
      const isClickable = simpleDictionary[cleanWord];
      return (
        <span
          key={index}
          className={`${isClickable ? 'text-cute-pink-500 hover:text-cute-pink-700 cursor-pointer underline decoration-dotted' : ''}`}
          onClick={() => isClickable && handleWordClick(word)}
        >
          {word}{' '}
        </span>
      );
    });
  };

  const filteredNotes = notes.filter(
    note =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold font-cute text-cute-purple-700 flex items-center gap-3">
          <BookOpen className="w-8 h-8" />
          My Notebook 📝
        </h2>
        <p className="text-cute-pink-600">Click pink words to see definitions! ✨</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Note Editor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card-cute">
            <h3 className="text-xl font-bold text-cute-purple-700 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create New Note
            </h3>
            <input
              type="text"
              placeholder="Note title..."
              className="input-cute mb-3 text-lg font-semibold"
              value={currentNote.title}
              onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
            />
            <textarea
              placeholder="Write your notes here... Click on common IELTS words (they'll turn pink!) to see their meaning."
              className="input-cute min-h-[200px] resize-y leading-relaxed"
              value={currentNote.content}
              onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
            />
            <button
              onClick={handleSaveNote}
              className="btn-cute btn-primary mt-4 w-full flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Note
            </button>
          </div>

          {/* Notes List */}
          <div className="card-cute">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-cute-purple-700">My Notes</h3>
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  className="input-cute pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 bg-gradient-to-r from-cute-pink-50 to-cute-purple-50 rounded-2xl border-2 border-cute-pink-100"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-lg font-bold text-cute-purple-700">{note.title}</h4>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-gray-600 mb-2 leading-relaxed">
                    {renderContentWithClickableWords(note.content)}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {note.tags.map((tag, index) => (
                        <span key={index} className="badge-cute badge-pink text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">{note.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dictionary Panel */}
        <div className="space-y-4">
          <div className="card-cute sticky top-4">
            <h3 className="text-xl font-bold text-cute-purple-700 mb-4 flex items-center gap-2">
              <Search className="w-5 h-5" />
              Quick Dictionary
            </h3>
            
            {showDictionary && selectedWord ? (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-cute-pink-100 to-cute-purple-100 rounded-2xl">
                  <h4 className="text-2xl font-bold text-cute-pink-600 mb-2">
                    {selectedWord.word}
                  </h4>
                  <p className="text-gray-700 mb-3">{selectedWord.definition}</p>
                  <div className="p-3 bg-white/80 rounded-xl">
                    <p className="text-sm text-gray-600 italic">
                      "{selectedWord.example}"
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDictionary(false)}
                  className="btn-cute btn-secondary w-full"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Click on a pink word in your notes to see its definition here!</p>
                <p className="text-sm mt-2">Available words: accommodation, environment, government, education, technology...</p>
              </div>
            )}

            {/* Common IELTS Words */}
            <div className="mt-6 pt-6 border-t-2 border-cute-pink-100">
              <h4 className="font-bold text-cute-purple-700 mb-3">📚 Common IELTS Words</h4>
              <div className="flex flex-wrap gap-2">
                {Object.keys(simpleDictionary).map((word) => (
                  <button
                    key={word}
                    onClick={() => {
                      setSelectedWord(simpleDictionary[word]);
                      setShowDictionary(true);
                    }}
                    className="px-3 py-1 bg-cute-pink-100 text-cute-pink-700 rounded-full text-sm hover:bg-cute-pink-200 transition-colors"
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notebook;
