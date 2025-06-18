import { Routes, Route } from 'react-router-dom';
import LoginPage from '../auth/LoginPage';
import Dashboard from '../pages/Dashboard';
import ProtectedRoute from '../components/ProtectedRoute';
import DepositSettings from '../pages/settings/DepositSettings';

function RouterConfig() {
  return (
    <Routes>
      <Route path="/admin/login" element={<LoginPage />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Add more protected routes as needed */}
    </Routes>
  );
}

export default RouterConfig;