import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const GuestRoute = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (isAuthenticated) {
    const home = user?.username ? `/u/${user.username}` : '/account';
    return <Navigate to={home} replace state={{ from: location }} />;
  }
  return <Outlet />;
};

export default GuestRoute;