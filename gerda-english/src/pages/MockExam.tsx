import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Headphones, Book as BookIcon } from 'lucide-react';
import { getMockExams, submitMockExamAttempt } from '../lib/db';
import { MockExam as MockExamType, MockExamSection } from '../lib/supabase';
import { academicReadingBand, estimatedOverallBand, listeningBand } from '../lib/ieltsBand';
import { isCorrectAnswer } from '../lib/scoreAnswer';
import ListeningSection from '../components/mockexam/ListeningSection';
import ReadingSection from '../components/mockexam/ReadingSection';

type Phase = 'intro' | 'listening' | 'reading' | 'results';

interface Result {
  listeningRaw: number;
  readingRaw: number;
  listeningBand: number;
  readingBand: number;
  estimatedBand: number;
}

const scoreSections = (sections: MockExamSection[], answers: Record<string, string>): number =>
  sections.reduce(
    (total, section) =>
      total + section.questions.filter((q) => isCorrectAnswer(answers[q.id], q.correct_answer)).length,
    0
  );

const MockExam = () => {
  const [exam, setExam] = useState<MockExamType | null>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<Phase>('intro');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getMockExams()
      .then((data) => setExam(data[0] ?? null))
      .catch((err) => console.error('Failed to load mock exams:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const listeningSections = exam?.sections.filter((s) => s.type === 'listening') ?? [];
  const readingSections = exam?.sections.filter((s) => s.type === 'reading') ?? [];

  const finishExam = async () => {
    if (!exam || submitting) return;
    setSubmitting(true);

    const listeningRaw = scoreSections(listeningSections, answers);
    const readingRaw = scoreSections(readingSections, answers);
    const lBand = listeningBand(listeningRaw);
    const rBand = academicReadingBand(readingRaw);
    const estimated = estimatedOverallBand(listeningRaw, readingRaw);
    const timeSpentSeconds = startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0;

    try {
      await submitMockExamAttempt({
        mock_exam_id: exam.id,
        section_scores: {
          listening: { raw: listeningRaw, band: lBand },
          reading: { raw: readingRaw, band: rBand },
        },
        estimated_band: estimated,
        answers,
        time_spent_seconds: timeSpentSeconds,
      });
    } catch (err) {
      console.error('Failed to submit mock exam attempt:', err);
    }

    setResult({ listeningRaw, readingRaw, listeningBand: lBand, readingBand: rBand, estimatedBand: estimated });
    setSubmitting(false);
    setPhase('results');
  };

  if (loading) {
    return <p className="text-center text-warm-brown-600 py-12">Loading mock exam... 📝</p>;
  }

  if (!exam) {
    return (
      <div className="card-warm text-center py-12">
        <BookIcon className="w-12 h-12 mx-auto mb-3 text-warm-tan-400" />
        <h2 className="text-xl font-bold text-warm-brown-800 mb-2">No mock exams yet</h2>
        <p className="text-warm-brown-400">Ask your admin to add one! 🌸</p>
      </div>
    );
  }

  if (phase === 'intro') {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-warm-brown-800 flex items-center gap-3">
          <Headphones className="w-8 h-8" />
          IELTS Mock Exam
        </h2>
        <div className="card-warm space-y-3">
          <h3 className="text-2xl font-bold text-warm-brown-800">{exam.title}</h3>
          <p className="text-warm-brown-600">
            Full-length Listening (30 min, 40 questions) + Reading (60 min, 40 questions), timed like the real
            exam. Writing and Speaking aren't included, so your result is an estimated Listening &amp; Reading
            band, not a full official score.
          </p>
          <p className="text-warm-brown-600">
            Listening audio is read aloud by your browser and plays once only — no rewind, same as the real test.
          </p>
          <button
            onClick={() => {
              setStartedAt(Date.now());
              setPhase('listening');
            }}
            className="btn-warm btn-warm-primary text-lg px-8 py-3"
          >
            Start Mock Exam
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'listening') {
    return (
      <ListeningSection
        sections={listeningSections}
        answers={answers}
        onAnswer={handleAnswer}
        onExpire={() => setPhase('reading')}
      />
    );
  }

  if (phase === 'reading') {
    return (
      <ReadingSection
        sections={readingSections}
        answers={answers}
        onAnswer={handleAnswer}
        onExpire={finishExam}
      />
    );
  }

  if (!result) return null;

  return (
    <div className="space-y-6">
      <div className="card-warm text-center py-8">
        <div className="text-6xl mb-4">🎓</div>
        <h3 className="text-2xl font-bold text-warm-brown-800 mb-1">Estimated Band: {result.estimatedBand}</h3>
        <p className="text-warm-brown-500 mb-6">Listening &amp; Reading only — not an official IELTS score.</p>
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          <div className="card-warm bg-warm-tan-50">
            <p className="text-sm text-warm-brown-500">Listening</p>
            <p className="text-xl font-bold text-warm-brown-800">
              {result.listeningRaw}/40 · Band {result.listeningBand}
            </p>
          </div>
          <div className="card-warm bg-warm-tan-50">
            <p className="text-sm text-warm-brown-500">Reading</p>
            <p className="text-xl font-bold text-warm-brown-800">
              {result.readingRaw}/40 · Band {result.readingBand}
            </p>
          </div>
        </div>
        <Link to="/" className="btn-warm btn-warm-primary mt-6 inline-block">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default MockExam;
