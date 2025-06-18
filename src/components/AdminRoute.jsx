import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Loading from './Loading';

const AdminRoute = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <Loading />;
  return user?.isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};

export default AdminRoute;