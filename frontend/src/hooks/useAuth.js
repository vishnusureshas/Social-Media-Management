import { useSelector } from 'react-redux';

export const useAuth = () => {
  const { accessToken, refreshToken, user, status, error } = useSelector((s) => s.auth);
  return {
    isAuthenticated: Boolean(accessToken),
    accessToken,
    refreshToken,
    user,
    status,
    error,
  };
};