import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { hasCompanyConfig } from '../utils/companyConfig';

export default function LoginPage() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to={hasCompanyConfig() ? '/dashboard' : '/setup'} replace />;

  const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-bg-primary overflow-hidden">
      {/* Animated orbs */}
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full bg-blue/15 blur-3xl animate-float-slow pointer-events-none" />
      <div className="absolute bottom-[-80px] right-[-80px] w-[300px] h-[300px] rounded-full bg-cyan/10 blur-3xl animate-float-slower pointer-events-none" />

      {/* Glassmorphism card */}
      <div className="relative z-10 w-full max-w-[420px] mx-4 rounded-3xl p-12 border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <h1 className="text-[42px] font-display font-bold text-blue tracking-tight">GitMax</h1>
          <span className="flex items-center gap-1.5 px-2 py-1 text-xs font-display bg-cyan/20 text-cyan border border-cyan/30 rounded-lg">
            AI
            <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
          </span>
        </div>

        {/* Tagline */}
        <p className="text-center font-display text-text text-lg mb-1">
          Predict. Prevent. Protect.
        </p>
        <p className="text-center text-sm text-muted mb-8 leading-relaxed">
          Connect your repository to scan pull requests, predict failures 90 days ahead,
          and generate CEO-ready risk reports.
        </p>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted font-display">Choose your provider</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* GitHub button */}
        <button
          onClick={() => { window.location.href = `${API}/auth/github/login`; }}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[#161B22] border border-[#30363D] text-white font-display text-sm hover:bg-[#21262D] transition-colors mb-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          Continue with GitHub
        </button>

        {/* GitLab button */}
        <button
          onClick={() => { window.location.href = `${API}/auth/gitlab/login`; }}
          className="relative w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[#FC6D26] text-white font-display text-sm hover:bg-[#e5621f] transition-colors overflow-hidden mb-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.955 13.587l-1.342-4.135-2.664-8.189a.455.455 0 00-.867 0L16.418 9.45H7.582L4.918 1.263a.455.455 0 00-.867 0L1.386 9.452.044 13.587a.924.924 0 00.331 1.023L12 23.054l11.625-8.443a.92.92 0 00.33-1.024" />
          </svg>
          Continue with GitLab
          <span className="absolute top-1 right-2 px-1.5 py-0.5 text-[9px] font-display bg-black/30 rounded text-white/70">
            Coming Soon
          </span>
        </button>


        {/* Footer */}
        <p className="text-center text-[11px] text-muted/60 mt-8 font-display">
          Your code never leaves your infrastructure.
        </p>
      </div>
    </div>
  );
}
