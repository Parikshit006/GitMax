import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAnalysis } from '../context/AnalysisContext';
import PipelineTracker from '../components/analysis/PipelineTracker';
import HealthDial from '../components/analysis/HealthDial';
import FinancialCounter from '../components/analysis/FinancialCounter';
import ExecutiveSummary from '../components/analysis/ExecutiveSummary';
import FileRiskCard from '../components/analysis/FileRiskCard';
import RiskBadge from '../components/analysis/RiskBadge';
import { GitPullRequest, Clock, Tag, Download } from 'lucide-react';
import { exportToPdf } from '../utils/pdfModule';

export default function AnalysisPage() {
  const navigate = useNavigate();
  const { result, currentPR } = useAnalysis();

  useEffect(() => {
    if (!result && !currentPR) {
      navigate('/pull-requests', { replace: true });
    }
  }, [result, currentPR, navigate]);

  // Loading state — pipeline is running
  if (!result && currentPR) {
    return <PipelineTracker />;
  }

  if (!result) return null;

  const healthScore = result.summary?.confidence
    ? Math.round(result.summary.confidence * 100)
    : result.summary?.expected_loss
    ? Math.max(0, Math.round(100 - result.summary.expected_loss / 2000))
    : 50;

  const sortedFiles = [...(result.files || [])].sort(
    (a, b) => (b.expected_cost || 0) - (a.expected_cost || 0)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-text">Analysis Results</h1>
          <p className="text-sm text-muted font-display mt-1">
            AI-driven risk assessment complete
          </p>
        </div>
        <div className="flex items-center gap-3">
          {result.summary && (
            <RiskBadge level={result.summary.overall_risk} className="text-sm px-4 py-2" />
          )}
          <button
            onClick={() => exportToPdf(result, `GitMax-Analysis-PR-${currentPR?.number || 'Report'}.pdf`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue/10 text-blue border border-blue/20 rounded-xl hover:bg-blue/20 transition-all font-display text-sm group"
          >
            <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            Download PDF
          </button>
        </div>
      </div>

      <div id="analysis-content" className="space-y-6">

      {/* Top cards row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Health Dial */}
        <div className="bg-bg-card border border-border rounded-xl p-6 flex flex-col items-center justify-center hover:scale-[1.01] transition-transform duration-200">
          <h3 className="text-sm font-display text-muted mb-4 uppercase tracking-wider">Risk Confidence</h3>
          <HealthDial score={healthScore} size={160} />
        </div>

        {/* Financial Counter */}
        <div className="bg-bg-card border border-border rounded-xl p-6 flex flex-col items-center justify-center hover:scale-[1.01] transition-transform duration-200">
          <FinancialCounter
            target={result.summary?.expected_loss || 0}
            confidence={result.summary?.confidence || 0}
          />
        </div>

        {/* Metadata */}
        <div className="bg-bg-card border border-border rounded-xl p-6 space-y-4 hover:scale-[1.01] transition-transform duration-200">
          <h3 className="text-sm font-display text-muted uppercase tracking-wider">PR Details</h3>
          {currentPR?.title && (
            <div className="flex items-start gap-2">
              <GitPullRequest className="w-4 h-4 text-blue mt-0.5 flex-shrink-0" />
              <span className="text-sm font-display text-text">{currentPR.title}</span>
            </div>
          )}
          {currentPR?.branch && (
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-purple flex-shrink-0" />
              <span className="text-sm font-mono text-muted">{currentPR.branch}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan flex-shrink-0" />
            <span className="text-sm font-mono text-muted">{new Date().toLocaleString()}</span>
          </div>
          {result.llm_source && (
            <span className="inline-block px-2 py-1 text-xs font-mono bg-purple/20 text-purple border border-purple/30 rounded">
              LLM: {result.llm_source}
            </span>
          )}
        </div>
      </div>

      {/* Executive Summary */}
      <ExecutiveSummary text={result.summary?.recommendation} />

      {/* File Risk Cards */}
      {sortedFiles.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-display font-medium text-text">
            File Risk Analysis
            <span className="ml-2 text-sm font-mono text-muted">({sortedFiles.length} files)</span>
          </h2>
          {sortedFiles.map((file, index) => (
            <FileRiskCard key={file.name} file={file} index={index} />
          ))}
        </div>
      )}

      {/* Signals */}
      {result.signals && result.signals.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-display font-medium text-text">System Signals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {result.signals.map((signal, i) => (
              <div
                key={i}
                className="bg-bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:scale-[1.01] transition-transform duration-200"
              >
                <div>
                  <span className="text-xs font-display text-muted">{signal.name}</span>
                  <p className="text-lg font-mono text-text mt-0.5">{signal.value}</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-display rounded-md ${
                    signal.status === 'CRITICAL'
                      ? 'bg-red/10 text-red border border-red/20'
                      : signal.status === 'WARN'
                      ? 'bg-amber/10 text-amber border border-amber/20'
                      : 'bg-cyan/10 text-cyan border border-cyan/20'
                  }`}
                >
                  {signal.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </motion.div>
  );
}
