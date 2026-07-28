import Timer from './Timer';
import AudioPlayer from './AudioPlayer';
import { MockExamSection } from '../../lib/supabase';

const LISTENING_DURATION_SECONDS = 30 * 60;

interface ListeningSectionProps {
  sections: MockExamSection[];
  answers: Record<string, string>;
  onAnswer: (questionId: string, answer: string) => void;
  onExpire: () => void;
}

const ListeningSection = ({ sections, answers, onAnswer, onExpire }: ListeningSectionProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-warm-brown-800">Listening</h2>
        <Timer durationSeconds={LISTENING_DURATION_SECONDS} onExpire={onExpire} />
      </div>

      {sections.map((section) => (
        <div key={section.section_number} className="card-warm space-y-4">
          <div>
            <h3 className="text-lg font-bold text-warm-brown-800">
              Part {section.section_number}: {section.title}
            </h3>
            <p className="text-sm text-warm-brown-500">{section.instructions}</p>
          </div>

          <AudioPlayer script={section.listening_script ?? ''} label={`Part ${section.section_number}`} />

          <div className="space-y-4">
            {section.questions.map((q, index) => (
              <div key={q.id} className="border-t border-warm-tan-200 pt-4 first:border-t-0 first:pt-0">
                <p className="font-semibold text-warm-brown-800 mb-2">
                  {index + 1}. {q.question_text}
                </p>
                {q.type === 'fill_blank' ? (
                  <input
                    type="text"
                    value={answers[q.id] ?? ''}
                    onChange={(e) => onAnswer(q.id, e.target.value)}
                    placeholder="Type your answer"
                    className="w-full p-3 rounded-xl border border-warm-tan-200 focus:border-warm-terracotta-400 focus:outline-none"
                  />
                ) : (
                  <div className="space-y-2">
                    {(q.options ?? []).map((option) => (
                      <button
                        key={option}
                        onClick={() => onAnswer(q.id, option)}
                        className={`w-full p-3 rounded-xl text-left border transition-colors ${
                          answers[q.id] === option
                            ? 'bg-warm-terracotta-50 border-warm-terracotta-400 text-warm-brown-800'
                            : 'bg-white border-warm-tan-200 hover:border-warm-terracotta-300'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <button onClick={onExpire} className="btn-warm btn-warm-primary w-full">
        Finish Listening &amp; Continue to Reading
      </button>
    </div>
  );
};

export default ListeningSection;
