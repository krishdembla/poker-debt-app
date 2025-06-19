import { Navigate, useLocation } from 'react-router-dom';

const TOKEN_KEY = 'poker_token';

const RequireAuth = ({ children }) => {
  const token = localStorage.getItem(TOKEN_KEY);
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

export default RequireAuth;
