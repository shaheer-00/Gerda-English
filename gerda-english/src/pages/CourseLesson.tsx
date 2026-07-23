import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Play, Square } from 'lucide-react';
import { units } from '../course/units';
import { LessonContentBlock } from '../course/types';

const ListeningBlock = ({ block }: { block: Extract<LessonContentBlock, { type: 'listening' }> }) => {
  const [speaking, setSpeaking] = useState(false);

  const handlePlay = () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(block.script);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="card-warm">
      <h4 className="font-bold text-warm-brown-800 mb-2">🎧 {block.title}</h4>
      <button onClick={handlePlay} className="btn-warm btn-warm-secondary flex items-center gap-2 mb-3">
        {speaking ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        {speaking ? 'Stop' : 'Play Audio'}
      </button>
      <p className="text-warm-brown-700 italic leading-relaxed">{block.script}</p>
      {block.note && <p className="text-sm text-warm-terracotta-600 mt-3">💡 {block.note}</p>}
    </div>
  );
};

const CourseLesson = () => {
  const { unitId, lessonId } = useParams<{ unitId: string; lessonId: string }>();
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Record<number, string>>({});

  const unit = units.find((u) => u.id === unitId);
  const lesson = unit?.lessons.find((l) => l.id === lessonId);

  if (!unit || !lesson) {
    return (
      <div className="font-warm text-center py-12">
        <p className="text-warm-brown-600">Lesson not found.</p>
        <Link to="/course" className="text-warm-terracotta-600 underline">
          Back to course
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-warm">
      <Link
        to={`/course/${unit.id}`}
        className="inline-flex items-center gap-2 text-warm-terracotta-600 hover:text-warm-terracotta-700"
      >
        <ArrowLeft className="w-4 h-4" /> Back to {unit.title}
      </Link>

      <div>
        <p className="text-sm text-warm-terracotta-600 font-semibold capitalize">{lesson.skill}</p>
        <h2 className="text-3xl font-bold text-warm-brown-800">{lesson.title}</h2>
      </div>

      <div className="space-y-4">
        {lesson.blocks.map((block, index) => {
          switch (block.type) {
            case 'explanation':
              return (
                <div key={index} className="card-warm">
                  <h4 className="font-bold text-warm-brown-800 mb-2">{block.heading}</h4>
                  <p className="text-warm-brown-700 leading-relaxed">{block.body}</p>
                </div>
              );
            case 'example':
              return (
                <div key={index} className="bg-warm-tan-50 border border-warm-tan-200 rounded-2xl p-4">
                  <p className="text-xs font-semibold text-warm-terracotta-600 uppercase mb-1">{block.label}</p>
                  <p className="text-warm-brown-700">{block.text}</p>
                </div>
              );
            case 'vocab':
              return (
                <div key={index} className="card-warm">
                  <h4 className="font-bold text-warm-brown-800 mb-3">📖 Vocabulary</h4>
                  <div className="space-y-3">
                    {block.words.map((w) => (
                      <div key={w.word} className="border-b border-warm-tan-100 pb-2 last:border-0">
                        <p className="font-semibold text-warm-brown-800">{w.word}</p>
                        <p className="text-sm text-warm-brown-600">{w.definition}</p>
                        <p className="text-sm text-warm-brown-400 italic">"{w.example}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            case 'reading':
              return (
                <div key={index} className="card-warm">
                  <h4 className="font-bold text-warm-brown-800 mb-2">📄 {block.title}</h4>
                  <p className="text-warm-brown-700 leading-relaxed">{block.passage}</p>
                  {block.note && <p className="text-sm text-warm-terracotta-600 mt-3">💡 {block.note}</p>}
                </div>
              );
            case 'listening':
              return <ListeningBlock key={index} block={block} />;
            case 'writing':
            case 'speaking':
              return (
                <div key={index} className="card-warm">
                  <h4 className="font-bold text-warm-brown-800 mb-2">
                    {block.type === 'writing' ? '✍️' : '🗣️'} Practice
                  </h4>
                  <p className="text-warm-brown-700 font-semibold mb-2">{block.prompt}</p>
                  <p className="text-sm text-warm-brown-500 mb-3">{block.guidance}</p>
                  <textarea
                    className="input-warm min-h-[120px]"
                    placeholder="Practice space — not graded, just for you."
                    value={notes[index] ?? ''}
                    onChange={(e) => setNotes({ ...notes, [index]: e.target.value })}
                  />
                </div>
              );
            default:
              return null;
          }
        })}
      </div>

      <button
        onClick={() => navigate(`/course/${unit.id}/${lesson.id}/checkpoint`)}
        className="btn-warm btn-warm-primary w-full"
      >
        Start Checkpoint →
      </button>
    </div>
  );
};

export default CourseLesson;
