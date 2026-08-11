import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ requireRoles = [] }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireRoles.length > 0 && !requireRoles.includes(user?.role)) {
    return <Navigate to="/account" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;