import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

export default function ProtectedRoute({ children, moderatorOnly = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center py-24" role="status" aria-label="Checking authentication">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (moderatorOnly && !['moderator', 'admin'].includes(user.role)) return <Navigate to="/dashboard" replace />;

  return children;
}
