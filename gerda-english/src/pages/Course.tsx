import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Lock, CheckCircle } from 'lucide-react';
import { units } from '../course/units';
import { getUserProgress } from '../lib/db';
import { isUnitUnlocked, unitProgress } from '../course/progress';

const unitIcons = ['📗', '📙', '📘', '📕'];

const Course = () => {
  const [completedQuizzes, setCompletedQuizzes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserProgress()
      .then((progress) => setCompletedQuizzes(progress?.completed_quizzes ?? []))
      .catch((err) => console.error('Failed to load course progress:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-center text-warm-brown-600 font-warm py-12">Loading your course...</p>;
  }

  return (
    <div className="space-y-6 font-warm">
      <div>
        <h2 className="text-3xl font-bold text-warm-brown-800">📚 Your IELTS Course</h2>
        <p className="text-warm-brown-500 mt-1">Band 4 → Band 6.5, one unit at a time.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {units.map((unit, index) => {
          const unlocked = isUnitUnlocked(units, index, completedQuizzes);
          const progress = unitProgress(unit, completedQuizzes);
          const total = unit.lessons.length;
          const complete = progress === total;

          const card = (
            <div
              className={`card-warm transition-all duration-200 ${
                unlocked ? 'hover:shadow-lg cursor-pointer' : 'opacity-60'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">
                  {unlocked ? unitIcons[index] : <Lock className="w-8 h-8 text-warm-tan-500" />}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-warm-brown-800">{unit.title}</h3>
                  <p className="text-sm text-warm-terracotta-600 font-semibold">{unit.bandRange}</p>
                  <p className="text-sm text-warm-brown-500 mt-1">{unit.description}</p>
                  {unlocked && (
                    <div className="mt-3">
                      <div className="progress-warm">
                        <div className="progress-warm-fill" style={{ width: `${(progress / total) * 100}%` }} />
                      </div>
                      <p className="text-xs text-warm-brown-500 mt-1">
                        {complete ? '✓ Complete' : `${progress}/${total} lessons`}
                      </p>
                    </div>
                  )}
                </div>
                {complete && <CheckCircle className="w-6 h-6 text-warm-sage-500 flex-shrink-0" />}
              </div>
            </div>
          );

          return unlocked ? (
            <Link key={unit.id} to={`/course/${unit.id}`}>
              {card}
            </Link>
          ) : (
            <div key={unit.id}>{card}</div>
          );
        })}
      </div>
    </div>
  );
};

export default Course;
