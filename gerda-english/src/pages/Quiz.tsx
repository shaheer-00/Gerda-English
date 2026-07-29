import { useState, useEffect } from 'react';
import { Book, CheckCircle, XCircle } from 'lucide-react';
import { getQuizzes, submitQuizAttempt } from '../lib/db';
import { Quiz as QuizType } from '../lib/supabase';
import Skeleton from '../components/Skeleton';

const Quiz = () => {
  const [currentQuiz, setCurrentQuiz] = useState<QuizType | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getQuizzes()
      .then((data) => setCurrentQuiz(data[0] ?? null))
      .catch((err) => console.error('Failed to load quizzes:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleAnswer = (questionId: string, answer: string) => {
    if (!showResults) {
      setAnswers({ ...answers, [questionId]: answer });
    }
  };

  const calculateScore = () => {
    if (!currentQuiz) return 0;
    let correct = 0;
    currentQuiz.questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) correct++;
    });
    return correct;
  };

  const handleSubmit = async () => {
    if (!currentQuiz || submitting) return;
    setSubmitting(true);
    const score = calculateScore();
    try {
      await submitQuizAttempt({
        quiz_id: currentQuiz.id,
        score,
        total_questions: currentQuiz.questions.length,
        answers,
        xp_earned: currentQuiz.xp_reward,
      });
      setShowResults(true);
    } catch (err) {
      console.error('Failed to submit quiz attempt:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-28" />
        <div className="space-y-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (!currentQuiz) {
    return (
      <div className="card-warm text-center py-12">
        <Book className="w-12 h-12 mx-auto mb-3 text-warm-tan-400" />
        <h2 className="text-xl font-bold text-warm-brown-800 mb-2">No quizzes yet</h2>
        <p className="text-warm-brown-400">Ask your admin to create one in the Admin Panel! 🌸</p>
      </div>
    );
  }

  const score = calculateScore();
  const percentage = Math.round((score / currentQuiz.questions.length) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-warm-brown-800 flex items-center gap-3">
          <Book className="w-8 h-8" />
          Practice Quiz 📝
        </h2>
      </div>

      <div className="card-warm bg-warm-tan-50">
        <h3 className="text-2xl font-bold text-warm-brown-800 mb-2">{currentQuiz.title}</h3>
        <p className="text-warm-terracotta-600">{currentQuiz.description}</p>
        <div className="flex items-center gap-4 mt-4">
          <span className="badge-warm badge-warm-terracotta">{currentQuiz.questions.length} questions</span>
          <span className="badge-warm badge-warm-sage">+{currentQuiz.xp_reward} XP on completion</span>
        </div>
      </div>

      {showResults && (
        <div className="card-warm text-center py-8">
          <div className="text-6xl mb-4">{percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '💪'}</div>
          <h3 className="text-3xl font-bold text-warm-brown-800 mb-2">
            Your Score: {score}/{currentQuiz.questions.length}
          </h3>
          <p className="text-xl text-warm-terracotta-600 mb-4">{percentage}% Correct</p>
          <div className="progress-warm max-w-md mx-auto mb-4">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                percentage >= 80 ? 'bg-warm-sage-500' : percentage >= 60 ? 'bg-warm-terracotta-500' : 'bg-warm-brown-400'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-warm-brown-700 font-semibold">
            {percentage >= 80
              ? "Amazing job! You're ready for IELTS! 🌟"
              : percentage >= 60
              ? 'Good work! Keep practicing! 💪'
              : "Don't give up! Practice makes perfect! 💕"}
          </p>
          <button
            onClick={() => {
              setAnswers({});
              setShowResults(false);
            }}
            className="btn-warm btn-warm-primary mt-6"
          >
            Try Again
          </button>
        </div>
      )}

      <div className="space-y-6">
        {currentQuiz.questions.map((q, index) => {
          const isCorrect = answers[q.id] === q.correct_answer;
          const hasAnswered = answers[q.id] !== undefined;
          const showResult = showResults && hasAnswered;

          return (
            <div key={q.id} className="card-warm">
              <div className="flex items-start gap-3 mb-4">
                <span className="flex-shrink-0 w-8 h-8 bg-warm-terracotta-500 text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-warm-brown-800 mb-2">{q.question_text}</h4>
                </div>
              </div>

              <div className="space-y-2 ml-11">
                {(q.options ?? []).map((option, optionIndex) => {
                  const isSelected = answers[q.id] === option;
                  const isThisCorrect = option === q.correct_answer;

                  return (
                    <button
                      key={optionIndex}
                      onClick={() => handleAnswer(q.id, option)}
                      disabled={showResults}
                      className={`w-full p-4 rounded-xl text-left transition-all duration-300 border ${
                        showResult
                          ? isThisCorrect
                            ? 'bg-warm-sage-100 border-warm-sage-400 text-warm-sage-800'
                            : isSelected
                            ? 'bg-red-100 border-red-400 text-red-700'
                            : 'bg-warm-cream-50 border-warm-tan-200 text-warm-brown-400'
                          : isSelected
                          ? 'bg-warm-tan-100 border-warm-terracotta-400 text-warm-brown-800'
                          : 'bg-white border-warm-tan-200 hover:border-warm-terracotta-300 hover:bg-warm-cream-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{option}</span>
                        {showResult && isThisCorrect && <CheckCircle className="w-5 h-5 text-warm-sage-600" />}
                        {showResult && isSelected && !isThisCorrect && (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {showResult && (
                <div
                  className={`mt-4 ml-11 p-4 rounded-xl border ${
                    isCorrect ? 'bg-warm-sage-50 border-warm-sage-200' : 'bg-warm-cream-100 border-warm-tan-200'
                  }`}
                >
                  <p className="text-sm text-warm-brown-700">
                    <strong>{isCorrect ? '✅ Correct!' : '💡 Tip:'}</strong>{' '}
                    {isCorrect ? 'Well done!' : `The correct answer is "${q.correct_answer}".`}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!showResults && Object.keys(answers).length === currentQuiz.questions.length && (
        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-warm btn-warm-primary text-lg px-12 py-4 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Answers ✨'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Quiz;
