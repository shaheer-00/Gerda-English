import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Notebook from './pages/Notebook';
import Calendar from './pages/Calendar';
import Mistakes from './pages/Mistakes';
import Quiz from './pages/Quiz';
import Rewards from './pages/Rewards';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="notebook" element={<Notebook />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="mistakes" element={<Mistakes />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="rewards" element={<Rewards />} />
          <Route path="admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
