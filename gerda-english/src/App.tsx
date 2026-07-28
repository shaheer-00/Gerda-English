import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProgressProvider } from './context/UserProgressContext';
import Layout from './components/Layout';
import AdminGate from './components/AdminGate';
import Dashboard from './pages/Dashboard';
import Course from './pages/Course';
import CourseUnit from './pages/CourseUnit';
import CourseLesson from './pages/CourseLesson';
import CourseCheckpoint from './pages/CourseCheckpoint';
import Notebook from './pages/Notebook';
import Calendar from './pages/Calendar';
import Mistakes from './pages/Mistakes';
import Quiz from './pages/Quiz';
import Rewards from './pages/Rewards';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <UserProgressProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="course" element={<Course />} />
            <Route path="course/:unitId" element={<CourseUnit />} />
            <Route path="course/:unitId/:lessonId" element={<CourseLesson />} />
            <Route path="course/:unitId/:lessonId/checkpoint" element={<CourseCheckpoint />} />
            <Route path="notebook" element={<Notebook />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="mistakes" element={<Mistakes />} />
            <Route path="quiz" element={<Quiz />} />
            <Route path="rewards" element={<Rewards />} />
            <Route
              path="admin"
              element={
                <AdminGate>
                  <AdminDashboard />
                </AdminGate>
              }
            />
          </Route>
        </Routes>
      </Router>
    </UserProgressProvider>
  );
}

export default App;
