import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/ui/LoadingScreen';

export const ProtectedRoute = ({ staffOnly, studentOnly }) => {
  const { user, loading, isStaff, isStudent } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (staffOnly && !isStaff) return <Navigate to="/portal" replace />;
  if (studentOnly && !isStudent) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
};
