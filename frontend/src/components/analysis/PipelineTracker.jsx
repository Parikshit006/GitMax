import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pickaxe, Search, ShieldAlert, DollarSign, FileText, Check, Loader2 } from 'lucide-react';

const STAGES = [
  {
    name: 'CodeMiner Agent',
    message: 'Cloning 90-day Git history...',
    icon: Pickaxe,
    color: '#8B5CF6',
  },
  {
    name: 'Analyzer Agent',
    message: 'Parsing AST complexity with Radon...',
    icon: Search,
    color: '#06B6D4',
  },
  {
    name: 'Risk Agent',
    message: 'Computing failure probability matrix...',
    icon: ShieldAlert,
    color: '#F59E0B',
  },
  {
    name: 'Cost Agent',
    message: 'Calculating SLA financial impact...',
    icon: DollarSign,
    color: '#EF4444',
  },
  {
    name: 'Report Agent',
    message: 'Generating executive summary with Groq...',
    icon: FileText,
    color: '#10B981',
  },
];

export default function PipelineTracker() {
  const [activeStage, setActiveStage] = useState(0);
  const [typedText, setTypedText] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStage((prev) => {
        if (prev < STAGES.length - 1) return prev + 1;
        return prev;
      });
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  // Typewriter effect for active stage message
  useEffect(() => {
    setTypedText('');
    const message = STAGES[activeStage]?.message || '';
    let i = 0;
    const typeInterval = setInterval(() => {
      if (i <= message.length) {
        setTypedText(message.slice(0, i));
        i++;
      } else {
        clearInterval(typeInterval);
      }
    }, 30);
    return () => clearInterval(typeInterval);
  }, [activeStage]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg-primary p-4">
      {/* Progress bar */}
      <div className="w-full max-w-md mb-12 h-1 bg-border/30 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-purple to-cyan rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 9, ease: 'linear' }}
        />
      </div>

      <div className="w-full max-w-md space-y-3">
        {STAGES.map((stage, index) => {
          const Icon = stage.icon;
          const isDone = index < activeStage;
          const isActive = index === activeStage;
          const isPending = index > activeStage;

          return (
            <motion.div
              key={stage.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
                isActive
                  ? 'bg-bg-card border-cyan/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                  : isDone
                  ? 'bg-bg-card/50 border-green/20'
                  : 'bg-bg-surface/30 border-border/30'
              }`}
            >
              {/* Icon */}
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  isDone
                    ? 'bg-green/20'
                    : isActive
                    ? 'bg-cyan/20'
                    : 'bg-muted/10'
                }`}
              >
                {isDone ? (
                  <Check className="w-5 h-5 text-green" />
                ) : isActive ? (
                  <Loader2 className="w-5 h-5 text-cyan animate-spin" />
                ) : (
                  <Icon className="w-5 h-5 text-muted/50" />
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <h4
                  className={`text-sm font-display font-medium ${
                    isDone ? 'text-green' : isActive ? 'text-text' : 'text-muted/50'
                  }`}
                >
                  {stage.name}
                </h4>
                {isActive && (
                  <p className="text-xs font-mono text-cyan mt-0.5 truncate">
                    {typedText}
                    <span className="animate-pulse">▌</span>
                  </p>
                )}
                {isDone && (
                  <p className="text-xs font-mono text-green/60 mt-0.5">Complete</p>
                )}
              </div>

              {/* Status dot */}
              {isActive && (
                <span className="w-2 h-2 rounded-full bg-cyan animate-pulse flex-shrink-0" />
              )}
            </motion.div>
          );
        })}
      </div>

      <p className="text-muted text-xs font-display mt-8 animate-pulse">
        AI agents are analyzing your pull request...
      </p>
    </div>
  );
}
