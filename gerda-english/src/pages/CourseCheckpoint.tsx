import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { units } from '../course/units';
import { getQuizById, submitQuizAttempt, markQuizCompleted } from '../lib/db';
import { useUserProgress } from '../context/UserProgressContext';
import { Quiz as QuizType } from '../lib/supabase';

const PASS_THRESHOLD = 60;

const CourseCheckpoint = () => {
  const { unitId, lessonId } = useParams<{ unitId: string; lessonId: string }>();
  const { progress, loading: progressLoading, refresh } = useUserProgress();

  const unit = units.find((u) => u.id === unitId);
  const lesson = unit?.lessons.find((l) => l.id === lessonId);

  const [quiz, setQuiz] = useState<QuizType | null>(null);
  const [quizLoading, setQuizLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loading = quizLoading || progressLoading;
  const alreadyCompleted = lesson ? (progress?.completed_quizzes ?? []).includes(lesson.checkpointQuizId) : false;

  useEffect(() => {
    if (!lesson) {
      setQuizLoading(false);
      return;
    }
    getQuizById(lesson.checkpointQuizId)
      .then(setQuiz)
      .catch((err) => console.error('Failed to load checkpoint:', err))
      .finally(() => setQuizLoading(false));
  }, [lesson]);

  const handleAnswer = (questionId: string, answer: string) => {
    if (!showResults) setAnswers({ ...answers, [questionId]: answer });
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    return quiz.questions.filter((q) => answers[q.id] === q.correct_answer).length;
  };

  const handleSubmit = async () => {
    if (!quiz || submitting) return;
    setSubmitting(true);
    const score = calculateScore();
    const percentage = Math.round((score / quiz.questions.length) * 100);
    const passed = percentage >= PASS_THRESHOLD;
    try {
      await submitQuizAttempt({
        quiz_id: quiz.id,
        score,
        total_questions: quiz.questions.length,
        answers,
        xp_earned: passed && !alreadyCompleted ? quiz.xp_reward : 0,
      });
      if (passed) {
        await markQuizCompleted(quiz.id);
      }
      await refresh();
      setShowResults(true);
    } catch (err) {
      console.error('Failed to submit checkpoint:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-center text-warm-brown-600 font-warm py-12">Loading checkpoint...</p>;
  }

  if (!unit || !lesson || !quiz) {
    return (
      <div className="font-warm text-center py-12">
        <p className="text-warm-brown-600">Checkpoint not found.</p>
        <Link to="/course" className="text-warm-terracotta-600 underline">
          Back to course
        </Link>
      </div>
    );
  }

  const score = calculateScore();
  const percentage = Math.round((score / quiz.questions.length) * 100);
  const passed = percentage >= PASS_THRESHOLD;

  return (
    <div className="space-y-6 font-warm">
      <div>
        <p className="text-sm text-warm-terracotta-600 font-semibold">{lesson.title}</p>
        <h2 className="text-3xl font-bold text-warm-brown-800">Checkpoint</h2>
      </div>

      {showResults && (
        <div className="card-warm text-center py-8">
          <div className="text-5xl mb-3">{passed ? '🎉' : '💪'}</div>
          <h3 className="text-2xl font-bold text-warm-brown-800">
            {score}/{quiz.questions.length} correct ({percentage}%)
          </h3>
          <p className="text-warm-brown-500 mt-2">
            {passed
              ? alreadyCompleted
                ? `Nice work — you've already completed this checkpoint, so no additional XP this time, but great practice!`
                : `Nice work — this lesson is complete, and the next one is unlocked. +${quiz.xp_reward} XP earned.`
              : `You'll need ${PASS_THRESHOLD}% or more to unlock the next lesson — review the material above and try again.`}
          </p>
          <div className="flex gap-3 justify-center mt-6">
            {passed ? (
              <Link to={`/course/${unit.id}`} className="btn-warm btn-warm-primary">
                Back to {unit.title}
              </Link>
            ) : (
              <>
                <button
                  onClick={() => {
                    setAnswers({});
                    setShowResults(false);
                  }}
                  className="btn-warm btn-warm-primary"
                >
                  Try Again
                </button>
                <Link to={`/course/${unit.id}/${lesson.id}`} className="btn-warm btn-warm-secondary">
                  Review Lesson
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {!showResults && (
        <>
          <div className="space-y-4">
            {quiz.questions.map((q, index) => (
              <div key={q.id} className="card-warm">
                <p className="font-semibold text-warm-brown-800 mb-3">
                  {index + 1}. {q.question_text}
                </p>
                <div className="space-y-2">
                  {(q.options ?? []).map((option) => {
                    const isSelected = answers[q.id] === option;
                    return (
                      <button
                        key={option}
                        onClick={() => handleAnswer(q.id, option)}
                        className={`w-full p-3 rounded-xl text-left border transition-colors ${
                          isSelected
                            ? 'bg-warm-terracotta-50 border-warm-terracotta-400 text-warm-brown-800'
                            : 'bg-white border-warm-tan-200 hover:border-warm-terracotta-300'
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {Object.keys(answers).length === quiz.questions.length && (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-warm btn-warm-primary w-full disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Checkpoint'}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default CourseCheckpoint;
