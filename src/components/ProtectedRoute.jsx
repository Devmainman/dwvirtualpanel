import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();


  console.log('ProtectedRoute state:', { isAuthenticated, loading });

  useEffect(() => {
    console.log('Auth check running', { isAuthenticated, loading });
    if (!loading && !isAuthenticated) {
      console.log('Redirecting to login');
      // Redirect to login page, but save the location they were trying to go to
      navigate('/admin/login', {
        state: { from: location },
        replace: true
      });
    }
  }, [isAuthenticated, loading, navigate, location]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return isAuthenticated ? children : null;
};

export default ProtectedRoute;