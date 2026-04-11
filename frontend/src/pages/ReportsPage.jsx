import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getStrategicRisks, getRecommendedActions } from '../api/reportsApi';
import { getCoverage, getBlindSpots } from '../api/analyticsApi';
import EmptyState from '../components/shared/EmptyState';
import ErrorCard from '../components/shared/ErrorCard';
import RiskBadge from '../components/analysis/RiskBadge';
import { FileWarning, Target, Shield, Eye, AlertTriangle, Download } from 'lucide-react';
import { exportToPdf } from '../utils/pdfModule';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-bg-surface border border-border rounded-lg p-3 text-xs font-mono shadow-xl">
        <p className="text-muted mb-1">{label}</p>
        {payload.map((entry) => (
          <p key={entry.name} style={{ color: entry.color }}>
            {entry.name}: {entry.value}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ReportsPage() {
  const [risks, setRisks] = useState(null);
  const [actions, setActions] = useState(null);
  const [coverage, setCoverage] = useState(null);
  const [blindSpots, setBlindSpots] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled([
        getStrategicRisks(),
        getRecommendedActions(),
        getCoverage(),
        getBlindSpots(),
      ]);
      setRisks(results[0].status === 'fulfilled' ? results[0].value : null);
      setActions(results[1].status === 'fulfilled' ? results[1].value : null);
      setCoverage(results[2].status === 'fulfilled' ? results[2].value : null);
      setBlindSpots(results[3].status === 'fulfilled' ? results[3].value : null);
    } catch (err) {
      setError(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.18 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-display font-bold text-text">Reports</h1>
          <p className="text-sm text-muted font-display mt-1">Strategic risk intelligence and coverage insights</p>
        </div>
        <button
          onClick={() => exportToPdf('reports-content', 'GitMax-Strategic-Summary.pdf')}
          className="flex items-center gap-2 px-4 py-2 bg-blue/10 text-blue border border-blue/20 rounded-xl hover:bg-blue/20 transition-all font-display text-sm group"
        >
          <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          Export Strategic Report
        </button>
      </div>

      {error && <ErrorCard message={error} onRetry={fetchAll} />}

      <div id="reports-content" className="space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strategic Risks */}
        <div className="bg-bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-red" />
            <h2 className="font-display text-text font-medium">Strategic Risks</h2>
          </div>
          {loading && <div className="h-40 bg-border/20 animate-pulse rounded-lg" />}
          {!loading && (!risks || risks.length === 0) && (
            <EmptyState icon={Shield} title="No strategic risks" description="No critical risks have been identified." />
          )}
          {!loading && risks && risks.length > 0 && (
            <div className="space-y-3">
              {risks.map((risk, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-bg-surface rounded-lg border border-border/50">
                  <FileWarning className="w-4 h-4 text-amber mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-display text-text">{risk.title || risk.name}</span>
                      {risk.level && <RiskBadge level={risk.level} />}
                    </div>
                    {risk.description && (
                      <p className="text-xs text-muted mt-1">{risk.description}</p>
                    )}
                    {risk.impact && (
                      <span className="text-xs font-mono text-red mt-1 block">Impact: {risk.impact}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommended Actions */}
        <div className="bg-bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-green" />
            <h2 className="font-display text-text font-medium">Recommended Actions</h2>
          </div>
          {loading && <div className="h-40 bg-border/20 animate-pulse rounded-lg" />}
          {!loading && (!actions || actions.length === 0) && (
            <EmptyState icon={Target} title="No actions pending" description="No recommended actions at this time." />
          )}
          {!loading && actions && actions.length > 0 && (
            <div className="space-y-3">
              {actions.map((action, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-bg-surface rounded-lg border border-border/50">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-mono ${
                    action.priority === 'HIGH' ? 'bg-red/20 text-red' :
                    action.priority === 'MEDIUM' ? 'bg-amber/20 text-amber' :
                    'bg-green/20 text-green'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-display text-text">{action.title || action.action}</span>
                    {action.description && (
                      <p className="text-xs text-muted mt-1">{action.description}</p>
                    )}
                    {action.effort && (
                      <span className="text-xs font-mono text-cyan mt-1 block">Effort: {action.effort}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Coverage chart */}
      <div className="bg-bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-blue" />
          <h2 className="font-display text-text font-medium">Test Coverage Trend</h2>
        </div>
        {loading && <div className="h-64 bg-border/20 animate-pulse rounded-lg" />}
        {!loading && (!coverage || coverage.length === 0) && (
          <EmptyState icon={Shield} title="No coverage data" description="Coverage data will appear after repository analysis." />
        )}
        {!loading && coverage && coverage.length > 0 && (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={coverage}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="week" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="coverage" fill="#2563EB" radius={[4, 4, 0, 0]} name="Coverage" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Blind Spots */}
      <div className="bg-bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-4 h-4 text-purple" />
          <h2 className="font-display text-text font-medium">Blind Spots</h2>
        </div>
        {loading && <div className="h-32 bg-border/20 animate-pulse rounded-lg" />}
        {!loading && (!blindSpots || blindSpots.length === 0) && (
          <EmptyState icon={Eye} title="No blind spots detected" description="Your repositories have good analysis coverage." />
        )}
        {!loading && blindSpots && blindSpots.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {blindSpots.map((spot, i) => (
              <div key={i} className="p-3 bg-bg-surface rounded-lg border border-border/50">
                <span className="text-xs font-display text-muted">{spot.area || spot.name}</span>
                <p className="text-sm font-mono text-text mt-1">{spot.detail || spot.description}</p>
                {spot.severity && (
                  <span className={`inline-block mt-2 px-2 py-0.5 text-[10px] font-display rounded ${
                    spot.severity === 'HIGH' ? 'bg-red/10 text-red' :
                    spot.severity === 'MEDIUM' ? 'bg-amber/10 text-amber' :
                    'bg-muted/10 text-muted'
                  }`}>
                    {spot.severity}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </motion.div>
  );
}
