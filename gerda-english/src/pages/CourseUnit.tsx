import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Lock, CheckCircle, ChevronRight } from 'lucide-react';
import { units } from '../course/units';
import { useUserProgress } from '../context/UserProgressContext';
import { isLessonUnlocked } from '../course/progress';

const CourseUnit = () => {
  const { unitId } = useParams<{ unitId: string }>();
  const { progress, loading } = useUserProgress();
  const completedQuizzes = progress?.completed_quizzes ?? [];

  const unitIndex = units.findIndex((u) => u.id === unitId);
  const unit = units[unitIndex];

  if (loading) {
    return <p className="text-center text-warm-brown-600 font-warm py-12">Loading unit...</p>;
  }

  if (!unit) {
    return (
      <div className="font-warm text-center py-12">
        <p className="text-warm-brown-600">Unit not found.</p>
        <Link to="/course" className="text-warm-terracotta-600 underline">
          Back to course
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-warm">
      <Link to="/course" className="inline-flex items-center gap-2 text-warm-terracotta-600 hover:text-warm-terracotta-700">
        <ArrowLeft className="w-4 h-4" /> Back to course
      </Link>

      <div>
        <h2 className="text-3xl font-bold text-warm-brown-800">{unit.title}</h2>
        <p className="text-warm-terracotta-600 font-semibold">{unit.bandRange}</p>
        <p className="text-warm-brown-500 mt-1">{unit.description}</p>
      </div>

      <div className="space-y-3">
        {unit.lessons.map((lesson, lessonIndex) => {
          const unlocked = isLessonUnlocked(units, unitIndex, lessonIndex, completedQuizzes);
          const complete = completedQuizzes.includes(lesson.checkpointQuizId);

          const row = (
            <div
              className={`card-warm flex items-center justify-between transition-all duration-200 ${
                unlocked ? 'hover:shadow-lg cursor-pointer' : 'opacity-60'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-warm-tan-100 flex items-center justify-center text-warm-brown-700 font-bold">
                  {lessonIndex + 1}
                </div>
                <div>
                  <p className="font-semibold text-warm-brown-800">{lesson.title}</p>
                  <p className="text-xs text-warm-brown-400 capitalize">{lesson.skill}</p>
                </div>
              </div>
              {complete ? (
                <CheckCircle className="w-5 h-5 text-warm-sage-500" />
              ) : unlocked ? (
                <ChevronRight className="w-5 h-5 text-warm-terracotta-500" />
              ) : (
                <Lock className="w-5 h-5 text-warm-tan-500" />
              )}
            </div>
          );

          return unlocked ? (
            <Link key={lesson.id} to={`/course/${unit.id}/${lesson.id}`}>
              {row}
            </Link>
          ) : (
            <div key={lesson.id}>{row}</div>
          );
        })}
      </div>
    </div>
  );
};

export default CourseUnit;
