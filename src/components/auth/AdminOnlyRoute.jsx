import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AuthLoadingScreen from './AuthLoadingScreen';

function AdminOnlyRoute() {
  const { isAuthLoading, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (isAuthLoading) {
    return <AuthLoadingScreen title="Admin access check..." description="Verification des droits et du code email admin..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace state={{ from: location, unauthorized: true }} />;
  }

  return <Outlet />;
}

export default AdminOnlyRoute;
