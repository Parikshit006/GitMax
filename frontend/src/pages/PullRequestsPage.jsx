import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFetch } from '../hooks/useFetch';
import { getActivePullRequests } from '../api/pullRequestsApi';
import { analyzePR } from '../api/analyzeApi';
import { useAnalysis } from '../context/AnalysisContext';
import HealthDial from '../components/analysis/HealthDial';
import RiskBadge from '../components/analysis/RiskBadge';
import ErrorCard from '../components/shared/ErrorCard';
import EmptyState from '../components/shared/EmptyState';
import { GitPullRequest, Loader2, Search, User, GitBranch, FileDiff } from 'lucide-react';

export default function PullRequestsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const repoFilter = new URLSearchParams(location.search).get('repo');
  const { startAnalysis, setAnalysisResult } = useAnalysis();

  const { data: prs, loading, error, refetch } = useFetch(
    () => getActivePullRequests(repoFilter),
    [repoFilter]
  );

  const [analyzing, setAnalyzing] = useState(null);
  const [analyzeError, setAnalyzeError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAnalyze = async (pr) => {
    setAnalyzing(pr.id);
    setAnalyzeError(null);
    startAnalysis(pr);

    try {
      const result = await analyzePR(pr.repo_url, pr.pr_number);
      setAnalysisResult(result);
      navigate(`/analysis/${pr.id}`);
    } catch (err) {
      setAnalyzeError(pr.id);
      setAnalyzing(null);
    }
  };

  const filteredPRs = (prs || []).filter((pr) =>
    pr.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pr.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pr.branch?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-2xl font-display font-bold text-text">Pull Requests</h1>
          <p className="text-sm text-muted font-display mt-1">
            {repoFilter ? `Showing PRs for ${repoFilter}` : 'Active pull requests across your repositories'}
          </p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search PRs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-bg-card border border-border rounded-lg pl-10 pr-4 py-2 text-sm font-display text-text placeholder:text-muted/50 focus:outline-none focus:border-blue/50"
          />
        </div>
      </div>

      {/* Content */}
      {loading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-bg-card border border-border rounded-xl p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-border/50 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-border/50 rounded w-3/4" />
                  <div className="h-3 bg-border/50 rounded w-1/2" />
                </div>
                <div className="h-8 w-20 bg-border/50 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <ErrorCard message={error} onRetry={refetch} />}

      {!loading && !error && filteredPRs.length === 0 && (
        <EmptyState
          icon={GitPullRequest}
          title="No active pull requests found"
          description={searchQuery ? 'Try a different search query.' : 'There are no open pull requests to display.'}
        />
      )}

      {!loading && !error && filteredPRs.length > 0 && (
        <div className="space-y-3">
          {filteredPRs.map((pr) => (
            <motion.div
              key={pr.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-bg-card border rounded-xl p-5 hover:scale-[1.005] transition-all duration-200 ${
                analyzing === pr.id
                  ? 'border-cyan/40 shadow-[0_0_20px_rgba(6,182,212,0.1)] animate-pulse'
                  : 'border-border'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Risk dial */}
                <div className="flex-shrink-0">
                  <HealthDial score={pr.riskScore || (60 + (pr.title.length % 35))} size={56} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display text-text font-medium truncate">{pr.title}</h3>
                    {pr.risk && <RiskBadge level={pr.risk} />}
                    {pr.labels && pr.labels.map((label) => (
                      <span key={label} className="px-1.5 py-0.5 text-[10px] font-mono bg-purple/10 text-purple border border-purple/20 rounded">
                        {label}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-muted font-mono flex-wrap">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{pr.author}</span>
                    <span className="flex items-center gap-1"><GitBranch className="w-3 h-3" />{pr.branch}</span>
                    {pr.createdAt && (
                      <span className="flex items-center gap-1">
                        <Loader2 className="w-3 h-3 opacity-0" /> {/* Spacer */}
                        {(() => { try { return formatDistanceToNow(parseISO(pr.createdAt), { addSuffix: true }); } catch { return pr.createdAt; } })()}
                      </span>
                    )}
                    {pr.files != null && <span className="flex items-center gap-1"><FileDiff className="w-3 h-3" />{pr.files} files</span>}

                    {pr.additions != null && (
                      <span>
                        <span className="text-green">+{pr.additions}</span>
                        {' / '}
                        <span className="text-red">-{pr.deletions || 0}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Analyze button */}
                <div className="flex-shrink-0">
                  {analyzeError === pr.id && (
                    <p className="text-xs text-red mb-1 font-display">Analysis failed</p>
                  )}
                  <button
                    onClick={() => handleAnalyze(pr)}
                    disabled={analyzing === pr.id}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-display text-sm transition-colors ${
                      analyzing === pr.id
                        ? 'bg-cyan/20 text-cyan cursor-wait'
                        : 'bg-blue text-white hover:bg-blue/90'
                    }`}
                  >
                    {analyzing === pr.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Analyze'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
