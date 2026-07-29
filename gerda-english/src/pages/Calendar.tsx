import { useState, useEffect, FormEvent } from 'react';
import { Calendar as CalendarIcon, Plus, CheckCircle } from 'lucide-react';
import { getCalendarEvents, createCalendarEvent, updateCalendarEvent } from '../lib/db';
import { CalendarEvent } from '../lib/supabase';
import Skeleton from '../components/Skeleton';

const toDateKey = (year: number, month: number, day: number) =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const Calendar = () => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    date: toDateKey(year, month, currentDate.getDate()),
    xp: 20,
  });

  useEffect(() => {
    getCalendarEvents(month + 1, year)
      .then(setEvents)
      .catch((err) => console.error('Failed to load calendar events:', err))
      .finally(() => setLoading(false));
  }, [month, year]);

  const getDayStatus = (day: number) => {
    const dateKey = toDateKey(year, month, day);
    const event = events.find((e) => e.date === dateKey);
    if (!event) return null;
    return event.completed ? 'completed' : 'planned';
  };

  const todayKey = toDateKey(year, month, currentDate.getDate());
  const upcoming = [...events]
    .filter((e) => e.date >= todayKey)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 7);
  const completedCount = upcoming.filter((e) => e.completed).length;

  const handleToggleComplete = async (event: CalendarEvent) => {
    try {
      const updated = await updateCalendarEvent(event.id, { completed: !event.completed });
      setEvents((prev) => prev.map((e) => (e.id === event.id ? updated : e)));
    } catch (err) {
      console.error('Failed to update event:', err);
    }
  };

  const handleAddTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTask.title) return;
    try {
      const created = await createCalendarEvent({
        title: newTask.title,
        date: newTask.date,
        xp_reward: newTask.xp,
        completed: false,
      });
      setEvents((prev) => [...prev, created]);
      setNewTask({ title: '', date: todayKey, xp: 20 });
      setShowForm(false);
    } catch (err) {
      console.error('Failed to add task:', err);
    }
  };

  const monthLabel = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-56" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-warm-brown-800 flex items-center gap-3">
          <CalendarIcon className="w-8 h-8" />
          Study Calendar 📅
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-warm">
          <h3 className="text-xl font-bold text-warm-brown-800 mb-6 text-center">{monthLabel}</h3>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="text-center font-bold text-warm-terracotta-600 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square"></div>
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const status = getDayStatus(day);
              const isToday = day === currentDate.getDate();

              return (
                <div
                  key={day}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all duration-300 ${
                    isToday
                      ? 'bg-warm-terracotta-500 text-white shadow-lg scale-105'
                      : status === 'completed'
                      ? 'bg-warm-sage-200 text-warm-brown-800'
                      : status === 'planned'
                      ? 'bg-warm-cream-100 text-warm-brown-700 border border-warm-tan-200'
                      : 'bg-warm-cream-50 text-warm-brown-300 hover:bg-warm-cream-100'
                  }`}
                >
                  <span className="font-bold">{day}</span>
                  {status === 'completed' && <CheckCircle className="w-4 h-4 mt-1 text-warm-sage-700" />}
                  {status === 'planned' && !isToday && (
                    <div className="w-2 h-2 bg-warm-terracotta-400 rounded-full mt-1"></div>
                  )}
                  {isToday && <span className="absolute -top-2 -right-2 text-lg">🌟</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="card-warm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-warm-brown-800">Next 7 Days</h3>
            <button
              onClick={() => setShowForm(!showForm)}
              className="p-2 bg-warm-tan-100 rounded-xl hover:bg-warm-tan-200 transition-colors"
            >
              <Plus className="w-5 h-5 text-warm-terracotta-600" />
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleAddTask} className="space-y-2 mb-4 p-3 bg-warm-cream-100 rounded-xl">
              <input
                type="text"
                placeholder="Task title"
                className="input-warm"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
              <input
                type="date"
                className="input-warm"
                value={newTask.date}
                onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
              />
              <input
                type="number"
                className="input-warm"
                value={newTask.xp}
                onChange={(e) => setNewTask({ ...newTask, xp: parseInt(e.target.value) || 0 })}
              />
              <button type="submit" className="btn-warm btn-warm-primary w-full text-sm py-2">
                Add Task
              </button>
            </form>
          )}

          <div className="space-y-3">
            {upcoming.length === 0 && (
              <p className="text-sm text-warm-brown-400 text-center py-4">No tasks planned yet.</p>
            )}
            {upcoming.map((event) => (
              <div
                key={event.id}
                className={`p-4 rounded-2xl transition-all duration-300 cursor-pointer ${
                  event.completed ? 'bg-warm-sage-100' : 'bg-warm-cream-100'
                }`}
                onClick={() => handleToggleComplete(event)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`font-semibold ${
                        event.completed ? 'text-warm-sage-700 line-through' : 'text-warm-brown-800'
                      }`}
                    >
                      {event.title}
                    </p>
                    <p className="text-xs text-warm-brown-400">
                      {event.date} · +{event.xp_reward} XP
                    </p>
                  </div>
                  {event.completed && <CheckCircle className="w-5 h-5 text-warm-sage-600" />}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-warm-tan-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-warm-brown-800">Progress</span>
              <span className="text-sm text-warm-terracotta-600">
                {completedCount}/{upcoming.length} tasks
              </span>
            </div>
            <div className="progress-warm">
              <div
                className="progress-warm-fill"
                style={{ width: `${upcoming.length ? (completedCount / upcoming.length) * 100 : 0}%` }}
              />
            </div>
            <p className="text-xs text-warm-terracotta-600 mt-2 text-center">Keep going! You're doing great! 💪</p>
          </div>
        </div>
      </div>

      <div className="card-warm text-center py-6">
        <p className="text-lg text-warm-brown-700">
          🎯 <strong>Remember:</strong> Consistency is key! Even 15 minutes a day makes a difference!
        </p>
      </div>
    </div>
  );
};

export default Calendar;
