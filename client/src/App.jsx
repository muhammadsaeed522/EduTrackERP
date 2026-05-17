import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import LoadingScreen from './components/ui/LoadingScreen';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import StudentsPage from './pages/students/StudentsPage';
import StudentDetailPage from './pages/students/StudentDetailPage';
import AttendancePage from './pages/attendance/AttendancePage';
import AcademicsPage from './pages/academics/AcademicsPage';
import DisciplinePage from './pages/discipline/DisciplinePage';
import PenaltiesPage from './pages/penalties/PenaltiesPage';
import BonusesPage from './pages/bonuses/BonusesPage';
import HousesPage from './pages/houses/HousesPage';
import SearchPage from './pages/search/SearchPage';
import StudentPortalPage from './pages/portal/StudentPortalPage';
import {
  StudentAttendanceView,
  StudentAcademicsView,
  StudentDisciplineView,
  StudentReportView,
} from './pages/portal/StudentSubPages';

function App() {
  const { user, loading, isStaff } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={isStaff ? '/dashboard' : '/portal'} /> : <LoginPage />} />
      <Route path="/signup" element={user ? <Navigate to={isStaff ? '/dashboard' : '/portal'} /> : <SignupPage />} />

      <Route element={<ProtectedRoute staffOnly />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/students/:id" element={<StudentDetailPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/academics" element={<AcademicsPage />} />
          <Route path="/discipline" element={<DisciplinePage />} />
          <Route path="/penalties" element={<PenaltiesPage />} />
          <Route path="/bonuses" element={<BonusesPage />} />
          <Route path="/houses" element={<HousesPage />} />
          <Route path="/analytics" element={<DashboardPage />} />
          <Route path="/search" element={<SearchPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute studentOnly />}>
        <Route element={<DashboardLayout />}>
          <Route path="/portal" element={<StudentPortalPage />} />
          <Route path="/portal/attendance" element={<StudentAttendanceView />} />
          <Route path="/portal/academics" element={<StudentAcademicsView />} />
          <Route path="/portal/discipline" element={<StudentDisciplineView />} />
          <Route path="/portal/report" element={<StudentReportView />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to={user ? (isStaff ? '/dashboard' : '/portal') : '/login'} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
