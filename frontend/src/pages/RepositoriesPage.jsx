import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { useFetch } from '../hooks/useFetch';
import { getRepositories, syncRepository } from '../api/repositoriesApi';
import RiskBadge from '../components/analysis/RiskBadge';
import HealthDial from '../components/analysis/HealthDial';
import EmptyState from '../components/shared/EmptyState';
import ErrorCard from '../components/shared/ErrorCard';
import { GitBranch, Search, RefreshCw, ExternalLink, Loader2, Star } from 'lucide-react';

const LANG_COLORS = {
  javascript: '#F7DF1E', typescript: '#3178C6', python: '#3776AB',
  java: '#ED8B00', ruby: '#CC342D', go: '#00ADD8', rust: '#CE422B',
  php: '#777BB4', swift: '#F05138', kotlin: '#7F52FF', dart: '#0175C2',
};

export default function RepositoriesPage() {
  const navigate = useNavigate();
  const { data: repos, loading, error, refetch } = useFetch(getRepositories);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [syncingId, setSyncingId] = useState(null);
  const [syncError, setSyncError] = useState(null);

  const handleSync = async (repoId) => {
    setSyncingId(repoId);
    setSyncError(null);
    try {
      await syncRepository(repoId);
      await refetch();
    } catch (err) {
      setSyncError(repoId);
    } finally {
      setSyncingId(null);
    }
  };

  const filtered = (repos || []).filter((repo) => {
    const matchesSearch =
      repo.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.org?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter === 'all' || repo.risk?.toUpperCase() === riskFilter.toUpperCase();
    return matchesSearch && matchesRisk;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.18 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-text">Repositories</h1>
          <p className="text-sm text-muted font-display mt-1">Connected repositories and health status</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search repos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-bg-card border border-border rounded-lg pl-10 pr-4 py-2 text-sm font-display text-text placeholder:text-muted/50 focus:outline-none focus:border-blue/50"
            />
          </div>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-bg-card border border-border rounded-lg px-3 py-2 text-sm font-display text-text focus:outline-none focus:border-blue/50"
          >
            <option value="all">All Risk</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {error && <ErrorCard message={error} onRetry={refetch} />}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-bg-card border border-border rounded-xl p-5 animate-pulse">
              <div className="h-5 bg-border/50 rounded w-3/4 mb-3" />
              <div className="h-3 bg-border/50 rounded w-1/2 mb-4" />
              <div className="h-16 bg-border/50 rounded mb-3" />
              <div className="flex gap-2">
                <div className="h-8 w-20 bg-border/50 rounded-lg" />
                <div className="h-8 w-20 bg-border/50 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          icon={GitBranch}
          title="No repositories found"
          description={searchQuery || riskFilter !== 'all'
            ? 'Try adjusting your search or filter criteria.'
            : 'Connect a repository to get started with PR analysis.'}
        />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((repo, i) => (
            <motion.div
              key={repo.id || i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-bg-card border border-border rounded-xl p-5 hover:scale-[1.01] transition-transform duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0">
                  <h3 className="font-display text-text font-medium truncate">{repo.name}</h3>
                  <p className="text-xs text-muted font-mono">{repo.org || repo.owner}</p>
                </div>
                {repo.risk && <RiskBadge level={repo.risk} />}
              </div>

              {/* Health + meta */}
              <div className="flex items-center gap-4 mb-4">
                {repo.health != null && <HealthDial score={repo.health} size={56} />}
                <div className="flex-1 space-y-1 text-xs text-muted font-mono">
                  {repo.branch && <p>branch: {repo.branch}</p>}
                  {repo.lastSync && (
                    <p>synced: {(() => { try { return formatDistanceToNow(parseISO(repo.lastSync), { addSuffix: true }); } catch { return repo.lastSync; } })()}</p>
                  )}
                  {repo.version && <p>v{repo.version}</p>}
                </div>
              </div>

              {/* Language + stars */}
              <div className="flex items-center gap-3 mb-4">
                {repo.lang && (
                  <span className="flex items-center gap-1.5 text-xs font-mono text-muted">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: LANG_COLORS[repo.lang?.toLowerCase()] || '#64748B' }} />
                    {repo.lang}
                  </span>
                )}
                {repo.stars != null && (
                  <span className="flex items-center gap-1 text-xs font-mono text-muted">
                    <Star className="w-3 h-3" /> {repo.stars}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/pull-requests?repo=${repo.repo_full_name || `${repo.org || repo.owner}/${repo.name}`}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-display bg-blue/10 text-blue border border-blue/20 rounded-lg hover:bg-blue/20 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" /> View PRs
                </button>
                <button
                  onClick={() => handleSync(repo.id)}
                  disabled={syncingId === repo.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-display bg-bg-surface text-muted border border-border rounded-lg hover:text-text hover:bg-bg-card transition-colors"
                >
                  {syncingId === repo.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3" />
                  )}
                  {syncingId === repo.id ? 'Syncing...' : 'Sync Now'}
                </button>
              </div>
              {syncError === repo.id && (
                <p className="text-xs text-red mt-2 font-display">Sync failed. Try again.</p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
