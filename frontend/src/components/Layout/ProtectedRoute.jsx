import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { hasCompanyConfig } from '../../utils/companyConfig';
import AppShell from './AppShell';

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to setup if company config is not yet configured
  if (!hasCompanyConfig()) {
    return <Navigate to="/setup" replace />;
  }

  return <AppShell />;
}

