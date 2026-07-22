import { useState, useEffect } from 'react';
import { Save, Search, BookOpen, Plus, Trash2 } from 'lucide-react';
import { getNotes, saveNote, deleteNote } from '../lib/db';
import { Note } from '../lib/supabase';

interface WordDefinition {
  word: string;
  definition: string;
  example?: string;
}

const commonWords = ['accommodation', 'environment', 'government', 'education', 'technology'];

async function fetchDefinition(word: string): Promise<WordDefinition | null> {
  const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
  if (!res.ok) return null;
  const data = await res.json();
  const entry = data[0];
  const definitionObj = entry?.meanings?.[0]?.definitions?.[0];
  if (!definitionObj) return null;
  return {
    word: entry.word,
    definition: definitionObj.definition,
    example: definitionObj.example,
  };
}

const Notebook = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentNote, setCurrentNote] = useState({ title: '', content: '' });
  const [saving, setSaving] = useState(false);
  const [selectedWord, setSelectedWord] = useState<WordDefinition | null>(null);
  const [dictLoading, setDictLoading] = useState(false);
  const [dictNotFound, setDictNotFound] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getNotes()
      .then(setNotes)
      .catch((err) => console.error('Failed to load notes:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleWordClick = async (word: string) => {
    const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
    if (!cleanWord) return;
    setDictLoading(true);
    setDictNotFound(false);
    setSelectedWord(null);
    try {
      const def = await fetchDefinition(cleanWord);
      if (def) {
        setSelectedWord(def);
      } else {
        setDictNotFound(true);
      }
    } catch (err) {
      console.error('Dictionary lookup failed:', err);
      setDictNotFound(true);
    } finally {
      setDictLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!currentNote.title || !currentNote.content || saving) return;
    setSaving(true);
    try {
      const created = await saveNote(currentNote);
      setNotes([created, ...notes]);
      setCurrentNote({ title: '', content: '' });
    } catch (err) {
      console.error('Failed to save note:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteNote(id);
      setNotes(notes.filter((note) => note.id !== id));
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  const renderContentWithClickableWords = (content: string) => {
    const words = content.split(' ');
    return words.map((word, index) => {
      const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
      const isClickable = commonWords.includes(cleanWord);
      return (
        <span
          key={index}
          className={isClickable ? 'text-warm-terracotta-600 hover:text-warm-terracotta-700 cursor-pointer underline decoration-dotted' : ''}
          onClick={() => isClickable && handleWordClick(word)}
        >
          {word}{' '}
        </span>
      );
    });
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <p className="text-center text-warm-brown-600 py-12">Loading notebook... 🌸</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-warm-brown-800 flex items-center gap-3">
          <BookOpen className="w-8 h-8" />
          My Notebook 📝
        </h2>
        <p className="text-warm-terracotta-600">Click highlighted words to see definitions! ✨</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="card-warm">
            <h3 className="text-xl font-bold text-warm-brown-800 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create New Note
            </h3>
            <input
              type="text"
              placeholder="Note title..."
              className="input-warm mb-3 text-lg font-semibold"
              value={currentNote.title}
              onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
            />
            <textarea
              placeholder="Write your notes here... Click on common IELTS words (they'll be highlighted!) to see their meaning."
              className="input-warm min-h-[200px] resize-y leading-relaxed"
              value={currentNote.content}
              onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
            />
            <button
              onClick={handleSaveNote}
              disabled={saving}
              className="btn-warm btn-warm-primary mt-4 w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Note'}
            </button>
          </div>

          <div className="card-warm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-warm-brown-800">My Notes</h3>
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-warm-brown-400" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  className="input-warm pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredNotes.length === 0 && (
                <p className="text-sm text-warm-brown-400 text-center py-4">No notes yet — write your first one above!</p>
              )}
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 bg-warm-cream-100 rounded-2xl border border-warm-tan-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-lg font-bold text-warm-brown-800">{note.title}</h4>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-warm-brown-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-warm-brown-600 mb-2 leading-relaxed">
                    {renderContentWithClickableWords(note.content)}
                  </p>
                  <span className="text-xs text-warm-brown-400">
                    {new Date(note.updated_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card-warm sticky top-4">
            <h3 className="text-xl font-bold text-warm-brown-800 mb-4 flex items-center gap-2">
              <Search className="w-5 h-5" />
              Quick Dictionary
            </h3>

            {dictLoading && <p className="text-center text-warm-brown-400 py-8">Looking it up...</p>}

            {!dictLoading && selectedWord && (
              <div className="space-y-4">
                <div className="p-4 bg-warm-tan-50 rounded-2xl">
                  <h4 className="text-2xl font-bold text-warm-terracotta-600 mb-2">{selectedWord.word}</h4>
                  <p className="text-warm-brown-700 mb-3">{selectedWord.definition}</p>
                  {selectedWord.example && (
                    <div className="p-3 bg-white rounded-xl">
                      <p className="text-sm text-warm-brown-500 italic">"{selectedWord.example}"</p>
                    </div>
                  )}
                </div>
                <button onClick={() => setSelectedWord(null)} className="btn-warm btn-warm-secondary w-full">
                  Close
                </button>
              </div>
            )}

            {!dictLoading && !selectedWord && dictNotFound && (
              <div className="text-center py-8 text-warm-brown-400">
                <p>No definition found for that word. Try another!</p>
              </div>
            )}

            {!dictLoading && !selectedWord && !dictNotFound && (
              <div className="text-center py-8 text-warm-brown-400">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Click a highlighted word in your notes to see its definition here!</p>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-warm-tan-200">
              <h4 className="font-bold text-warm-brown-800 mb-3">📚 Common IELTS Words</h4>
              <div className="flex flex-wrap gap-2">
                {commonWords.map((word) => (
                  <button
                    key={word}
                    onClick={() => handleWordClick(word)}
                    className="px-3 py-1 bg-warm-tan-100 text-warm-terracotta-700 rounded-full text-sm hover:bg-warm-tan-200 transition-colors"
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
