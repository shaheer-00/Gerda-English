import { useState, useEffect } from 'react';
import { Book, CheckCircle, XCircle } from 'lucide-react';
import { getQuizzes, submitQuizAttempt } from '../lib/db';
import { Quiz as QuizType } from '../lib/supabase';

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
    return <p className="text-center text-cute-pink-600 py-12">Loading quiz... 🌸</p>;
  }

  if (!currentQuiz) {
    return (
      <div className="card-cute text-center py-12">
        <Book className="w-12 h-12 mx-auto mb-3 text-cute-pink-300" />
        <h2 className="text-xl font-bold text-cute-purple-700 mb-2">No quizzes yet</h2>
        <p className="text-gray-500">Ask your admin to create one in the Admin Panel! 🌸</p>
      </div>
    );
  }

  const score = calculateScore();
  const percentage = Math.round((score / currentQuiz.questions.length) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold font-cute text-cute-purple-700 flex items-center gap-3">
          <Book className="w-8 h-8" />
          Practice Quiz 📝
        </h2>
      </div>

      <div className="card-cute bg-gradient-to-r from-cute-pink-50 to-cute-purple-50">
        <h3 className="text-2xl font-bold text-cute-purple-700 mb-2">{currentQuiz.title}</h3>
        <p className="text-cute-pink-600">{currentQuiz.description}</p>
        <div className="flex items-center gap-4 mt-4">
          <span className="badge-cute badge-pink">{currentQuiz.questions.length} questions</span>
          <span className="badge-cute badge-mint">+{currentQuiz.xp_reward} XP on completion</span>
        </div>
      </div>

      {showResults && (
        <div className="card-cute text-center py-8 bg-gradient-to-r from-cute-mint-50 to-cute-blue-50">
          <div className="text-6xl mb-4">{percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '💪'}</div>
          <h3 className="text-3xl font-bold text-cute-purple-700 mb-2">
            Your Score: {score}/{currentQuiz.questions.length}
          </h3>
          <p className="text-xl text-cute-pink-600 mb-4">{percentage}% Correct</p>
          <div className="progress-cute max-w-md mx-auto mb-4">
            <div
              className={`progress-fill ${
                percentage >= 80
                  ? 'bg-gradient-to-r from-cute-mint-400 to-cute-blue-400'
                  : percentage >= 60
                  ? 'bg-gradient-to-r from-cute-peach-400 to-cute-pink-400'
                  : 'bg-gradient-to-r from-cute-pink-400 to-cute-purple-400'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-cute-purple-700 font-semibold">
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
            className="btn-cute btn-primary mt-6"
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
            <div key={q.id} className="card-cute">
              <div className="flex items-start gap-3 mb-4">
                <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-cute-pink-400 to-cute-purple-400 text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-cute-purple-700 mb-2">{q.question_text}</h4>
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
                      className={`w-full p-4 rounded-xl text-left transition-all duration-300 border-2 ${
                        showResult
                          ? isThisCorrect
                            ? 'bg-green-100 border-green-400 text-green-700'
                            : isSelected
                            ? 'bg-red-100 border-red-400 text-red-700'
                            : 'bg-gray-50 border-gray-200 text-gray-400'
                          : isSelected
                          ? 'bg-gradient-to-r from-cute-pink-100 to-cute-purple-100 border-cute-pink-400 text-cute-purple-700'
                          : 'bg-white border-cute-pink-200 hover:border-cute-pink-400 hover:bg-cute-pink-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{option}</span>
                        {showResult && isThisCorrect && <CheckCircle className="w-5 h-5 text-green-600" />}
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
                  className={`mt-4 ml-11 p-4 rounded-xl ${
                    isCorrect ? 'bg-green-50 border-2 border-green-200' : 'bg-cute-pink-50 border-2 border-cute-pink-200'
                  }`}
                >
                  <p className="text-sm">
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
            className="btn-cute btn-primary text-lg px-12 py-4 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Answers ✨'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Quiz;
