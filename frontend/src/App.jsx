import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { AnalysisProvider } from './context/AnalysisContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import SetupGuard from './components/layout/SetupGuard';
import LoginPage from './pages/LoginPage';
import AuthCallback from './pages/AuthCallback';
import CompanySetupPage from './pages/CompanySetupPage';
import DashboardPage from './pages/DashboardPage';
import RepositoriesPage from './pages/RepositoriesPage';
import PullRequestsPage from './pages/PullRequestsPage';
import AnalysisPage from './pages/AnalysisPage';
import ReportsPage from './pages/ReportsPage';

export default function App() {
  return (
    <AuthProvider>
      <AnalysisProvider>
        <BrowserRouter>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              {/* Setup page — auth required but no sidebar */}
              <Route element={<SetupGuard requireSetup={false} />}>
                <Route path="/setup" element={<CompanySetupPage />} />
              </Route>
              {/* Main app — auth + setup required */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/repositories" element={<RepositoriesPage />} />
                <Route path="/pull-requests" element={<PullRequestsPage />} />
                <Route path="/analysis/:id" element={<AnalysisPage />} />
                <Route path="/reports" element={<ReportsPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </AnimatePresence>
        </BrowserRouter>
      </AnalysisProvider>
    </AuthProvider>
  );
}
