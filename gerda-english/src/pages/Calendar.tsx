import { useState } from 'react';
import { Calendar as CalendarIcon, Plus, CheckCircle } from 'lucide-react';

const Calendar = () => {
  const [currentDate] = useState(new Date());
  const [studyPlan] = useState([
    { day: 1, task: 'Listening Practice', completed: true, xp: 30 },
    { day: 2, task: 'Vocabulary Review', completed: true, xp: 20 },
    { day: 3, task: 'Reading Test', completed: false, xp: 50 },
    { day: 4, task: 'Writing Practice', completed: false, xp: 40 },
    { day: 5, task: 'Speaking Practice', completed: false, xp: 35 },
    { day: 6, task: 'Full Mock Test', completed: false, xp: 100 },
    { day: 7, task: 'Review Mistakes', completed: false, xp: 25 },
  ]);

  const daysInMonth = 31;
  const firstDayOfMonth = 1; // Monday

  const getDayStatus = (day: number) => {
    const plan = studyPlan.find(p => p.day === day);
    if (!plan) return null;
    return plan.completed ? 'completed' : 'planned';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold font-cute text-cute-purple-700 flex items-center gap-3">
          <CalendarIcon className="w-8 h-8" />
          Study Calendar 📅
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Calendar */}
        <div className="lg:col-span-2 card-cute">
          <h3 className="text-xl font-bold text-cute-purple-700 mb-6 text-center">
            January 2024
          </h3>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="text-center font-bold text-cute-pink-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for days before the 1st */}
            {Array.from({ length: firstDayOfMonth - 1 }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square"></div>
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const status = getDayStatus(day);
              const isToday = day === currentDate.getDate();

              return (
                <div
                  key={day}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all duration-300 ${
                    isToday
                      ? 'bg-gradient-to-br from-cute-pink-400 to-cute-purple-400 text-white shadow-lg scale-105'
                      : status === 'completed'
                      ? 'bg-gradient-to-br from-cute-mint-200 to-cute-blue-200 text-cute-purple-700'
                      : status === 'planned'
                      ? 'bg-cute-pink-50 text-cute-purple-700 border-2 border-cute-pink-200'
                      : 'bg-gray-50 text-gray-400 hover:bg-cute-pink-50'
                  }`}
                >
                  <span className="font-bold">{day}</span>
                  {status === 'completed' && (
                    <CheckCircle className="w-4 h-4 mt-1 text-cute-mint-600" />
                  )}
                  {status === 'planned' && !isToday && (
                    <div className="w-2 h-2 bg-cute-pink-300 rounded-full mt-1"></div>
                  )}
                  {isToday && (
                    <span className="absolute -top-2 -right-2 text-lg">🌟</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Study Plan */}
        <div className="card-cute">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-cute-purple-700">This Week's Plan</h3>
            <button className="p-2 bg-cute-pink-100 rounded-xl hover:bg-cute-pink-200 transition-colors">
              <Plus className="w-5 h-5 text-cute-pink-600" />
            </button>
          </div>

          <div className="space-y-3">
            {studyPlan.map((plan) => (
              <div
                key={plan.day}
                className={`p-4 rounded-2xl transition-all duration-300 ${
                  plan.completed
                    ? 'bg-gradient-to-r from-cute-mint-100 to-cute-blue-100'
                    : 'bg-cute-pink-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        plan.completed
                          ? 'bg-cute-mint-400 text-white'
                          : 'bg-cute-pink-200 text-cute-pink-600'
                      }`}
                    >
                      {plan.day}
                    </div>
                    <div>
                      <p
                        className={`font-semibold ${
                          plan.completed ? 'text-cute-mint-700 line-through' : 'text-cute-purple-700'
                        }`}
                      >
                        {plan.task}
                      </p>
                      <p className="text-xs text-gray-500">+{plan.xp} XP</p>
                    </div>
                  </div>
                  {plan.completed && <CheckCircle className="w-5 h-5 text-cute-mint-600" />}
                </div>
              </div>
            ))}
          </div>

          {/* Weekly Progress */}
          <div className="mt-6 pt-6 border-t-2 border-cute-pink-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-cute-purple-700">Weekly Progress</span>
              <span className="text-sm text-cute-pink-600">2/7 tasks</span>
            </div>
            <div className="progress-cute">
              <div
                className="progress-fill bg-gradient-to-r from-cute-mint-400 to-cute-blue-400"
                style={{ width: `${(2 / 7) * 100}%` }}
              />
            </div>
            <p className="text-xs text-cute-pink-600 mt-2 text-center">
              Keep going! You're doing great! 💪
            </p>
          </div>
        </div>
      </div>

      {/* Motivational Message */}
      <div className="card-cute text-center py-6 bg-gradient-to-r from-cute-peach-50 via-cute-pink-50 to-cute-purple-50">
        <p className="text-lg text-cute-purple-700">
          🎯 <strong>Remember:</strong> Consistency is key! Even 15 minutes a day makes a difference!
        </p>
      </div>
    </div>
  );
};

export default Calendar;
