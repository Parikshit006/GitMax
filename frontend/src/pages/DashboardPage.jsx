import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { getAnalysisHistory } from '../api/analyticsApi';
import MetricCard from '../components/shared/MetricCard';

import EmptyState from '../components/shared/EmptyState';
import ErrorCard from '../components/shared/ErrorCard';
import { History, Activity } from 'lucide-react';

export default function DashboardPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAnalysisHistory();
      // Ensure data is sorted by date descending (should be from backend but just in case)
      const sorted = [...(data || [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setHistory(sorted);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const totalAnalyses = history.length;
  const lastAnalysis = history[0];
  const lastRiskScore = lastAnalysis?.risk_score ?? '--';
  const lastExpectedLoss = lastAnalysis?.expected_loss ?? null;
  const lastRiskyFile = lastAnalysis?.top_file ?? '--';

  const formatCurrency = (val) => {
    if (val == null) return '--';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(val).replace('₹', 'Rs.');
  };

  const getHealthColor = (score) => {
    if (score === '--') return 'default';
    if (score >= 70) return 'danger';
    if (score >= 40) return 'warning';
    return 'success';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.18 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-display font-bold text-text">Dashboard</h1>
        <p className="text-sm text-muted font-display mt-1">Engineering intelligence overview</p>
      </div>

      {error && <ErrorCard message={error} onRetry={fetchHistory} />}

      {/* Top metrics row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Analyses" value={totalAnalyses} type="info" loading={loading} />
        <MetricCard title="Last Risk Score" value={lastRiskScore} type={getHealthColor(lastRiskScore)} loading={loading} />
        <MetricCard title="Last Expected Loss" value={formatCurrency(lastExpectedLoss)} type="danger" loading={loading} />
        <MetricCard title="Last Risky File" value={lastRiskyFile} type="default" loading={loading} />
      </div>

      <div className="bg-bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-4 h-4 text-cyan" />
          <h2 className="font-display text-text font-medium">Analysis History</h2>
        </div>
        
        {loading && <div className="h-64 bg-border/20 animate-pulse rounded-lg" />}
        
        {!loading && history.length === 0 && (
          <EmptyState icon={Activity} title="No analyses yet" description="Run a PR analysis to see data." />
        )}
        
        {!loading && history.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted font-display text-xs uppercase tracking-wider border-b border-border">
                  <th className="pb-3 pr-4">Top File</th>
                  <th className="pb-3 pr-4">Summary</th>
                  <th className="pb-3 pr-4">Risk Score</th>
                  <th className="pb-3 pr-4">Expected Loss</th>
                  <th className="pb-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} className="border-b border-border/50 hover:bg-bg-surface/50 transition-colors">
                    <td className="py-3 pr-4 font-mono text-text truncate max-w-[200px]" title={item.top_file}>{item.top_file}</td>
                    <td className="py-3 pr-4 text-muted truncate max-w-[300px]" title={item.summary}>{item.summary}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-border rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.risk_score > 70 ? 'bg-red' : item.risk_score > 40 ? 'bg-amber' : 'bg-green'
                            }`}
                            style={{ width: `${item.risk_score || 0}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs text-muted">{item.risk_score}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 font-mono text-text">{formatCurrency(item.expected_loss)}</td>
                    <td className="py-3 text-xs text-muted font-mono whitespace-nowrap">
                      {formatDistanceToNow(parseISO(item.created_at), { addSuffix: true })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
