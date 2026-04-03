import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AuthLoadingScreen from './AuthLoadingScreen';

function AdminOnlyRoute() {
  const { isAuthLoading, isAuthenticated, isAdmin, isEmailVerifiedAdmin } = useAuth();
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

  if (!isEmailVerifiedAdmin) {
    return <Navigate to="/admin/verify-email-code" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default AdminOnlyRoute;
