import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasCompanyConfig } from '../utils/companyConfig';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const provider = params.get('provider');

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        login(token, {
          username: payload.username || payload.sub || 'user',
          provider: provider || payload.provider || 'github',
          avatar: payload.avatar_url || null,
        });
      } catch {
        login(token, { username: 'user', provider: 'github' });
      }
      // Route to setup if config is missing, otherwise dashboard
      const destination = hasCompanyConfig() ? '/dashboard' : '/setup';
      navigate(destination, { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-bg-primary">
      <div className="text-center">
        <div className="animate-spin w-10 h-10 border-2 border-cyan border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-muted font-display">Authenticating...</p>
      </div>
    </div>
  );
}

