import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import RiskBadge from './RiskBadge';

export default function FileRiskCard({ file, index = 0 }) {
  const [expanded, setExpanded] = useState(false);

  const costFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(file.expected_cost || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      className="bg-bg-card border border-border rounded-xl overflow-hidden hover:scale-[1.01] transition-transform duration-200"
    >
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <RiskBadge level={file.risk_level} />
          <span className="font-mono text-sm text-text truncate">{file.name}</span>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <span className="font-mono text-sm text-red">{costFormatted}</span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted" />
          )}
        </div>
      </div>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="border-t border-border"
        >
          <div className="p-4 space-y-4">
            {/* Metrics row */}
            {file.metrics && (
              <div className="flex gap-6">
                <div>
                  <span className="text-xs text-muted font-display block">Complexity</span>
                  <span className="font-mono text-lg text-amber">{file.metrics.complexity}</span>
                </div>
                <div>
                  <span className="text-xs text-muted font-display block">Commits (90d)</span>
                  <span className="font-mono text-lg text-cyan">{file.metrics.commits}</span>
                </div>
              </div>
            )}

            {/* Reasons */}
            {file.reasons && file.reasons.length > 0 && (
              <div>
                <h5 className="text-xs text-muted font-display mb-2 uppercase tracking-wider">Risk Factors</h5>
                <ul className="space-y-1.5">
                  {file.reasons.map((reason, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-text/80">
                      <span className="text-red mt-1">•</span>
                      <span className="font-mono text-xs">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendation */}
            {file.recommendation && (
              <div className="bg-bg-surface p-3 rounded-lg border border-border">
                <span className="text-xs text-muted font-display block mb-1">AI Recommendation</span>
                <p className="text-sm font-display text-text">{file.recommendation}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
