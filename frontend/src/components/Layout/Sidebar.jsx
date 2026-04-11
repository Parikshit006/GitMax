import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  GitBranch,
  GitPullRequest,
  BarChart3,
  LogOut,
  Zap,
  Settings,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/repositories', label: 'Repositories', icon: GitBranch },
  { to: '/pull-requests', label: 'Pull Requests', icon: GitPullRequest },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/setup', label: 'SLA Config', icon: Settings },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="fixed top-0 left-0 w-64 h-screen bg-bg-surface border-r border-border flex flex-col z-40">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
        <Zap className="w-7 h-7 text-blue" />
        <span className="text-xl font-display font-bold text-blue tracking-tight">GitMax</span>
        <span className="ml-1 px-1.5 py-0.5 text-[10px] font-display bg-cyan/20 text-cyan border border-cyan/30 rounded-md">
          AI
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg font-display text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-blue/10 text-blue border border-blue/20'
                    : 'text-muted hover:text-text hover:bg-bg-card'
                }`
              }
            >
              <Icon className="w-4.5 h-4.5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 mb-3">
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue/20 flex items-center justify-center">
              <span className="text-xs font-display text-blue font-bold">
                {(user?.username || 'U')[0].toUpperCase()}
              </span>
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-display text-text truncate">{user?.username || 'User'}</p>
            <p className="text-xs text-muted capitalize">{user?.provider || 'github'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-display text-muted hover:text-red hover:bg-red/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
