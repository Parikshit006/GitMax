import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * SetupGuard — renders children (Outlet) if the user is authenticated.
 * Used for the /setup page which needs auth but NOT the AppShell sidebar.
 * 
 * Props:
 *  - requireSetup: if false, skips company_config check (used for /setup itself)
 */
export default function SetupGuard() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
