import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, DollarSign, Users, Clock, TrendingDown, ChevronRight, RotateCcw, Sparkles, Shield, Check } from 'lucide-react';

const DEFAULTS = {
  hourly_downtime_cost: 5600,
  engineer_count: 3,
  avg_engineer_hourly_rate: 85,
  avg_fix_days: 5,
  feature_delay_cost_per_day: 2000,
};

const FIELDS = [
  {
    key: 'hourly_downtime_cost',
    label: 'Hourly Downtime Cost',
    description: 'Revenue lost per hour of system downtime',
    icon: DollarSign,
    prefix: 'Rs.',
    suffix: '/hr',
    color: 'red',
  },
  {
    key: 'engineer_count',
    label: 'Engineering Team Size',
    description: 'Engineers typically involved in incident response',
    icon: Users,
    prefix: '',
    suffix: 'engineers',
    color: 'blue',
  },
  {
    key: 'avg_engineer_hourly_rate',
    label: 'Avg. Engineer Hourly Rate',
    description: 'Average cost per engineer per hour',
    icon: DollarSign,
    prefix: 'Rs.',
    suffix: '/hr',
    color: 'cyan',
  },
  {
    key: 'avg_fix_days',
    label: 'Average Fix Duration',
    description: 'Typical days to diagnose and resolve an incident',
    icon: Clock,
    prefix: '',
    suffix: 'days',
    color: 'amber',
  },
  {
    key: 'feature_delay_cost_per_day',
    label: 'Feature Delay Cost',
    description: 'Opportunity cost per day of delayed feature delivery',
    icon: TrendingDown,
    prefix: 'Rs.',
    suffix: '/day',
    color: 'purple',
  },
];

const colorMap = {
  red: { bg: 'bg-red/10', border: 'border-red/20', text: 'text-red', ring: 'focus:ring-red/30' },
  blue: { bg: 'bg-blue/10', border: 'border-blue/20', text: 'text-blue', ring: 'focus:ring-blue/30' },
  cyan: { bg: 'bg-cyan/10', border: 'border-cyan/20', text: 'text-cyan', ring: 'focus:ring-cyan/30' },
  amber: { bg: 'bg-amber/10', border: 'border-amber/20', text: 'text-amber', ring: 'focus:ring-amber/30' },
  purple: { bg: 'bg-purple/10', border: 'border-purple/20', text: 'text-purple', ring: 'focus:ring-purple/30' },
};

export default function CompanySetupPage() {
  const navigate = useNavigate();
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('company_config');
      return saved ? JSON.parse(saved) : { ...DEFAULTS };
    } catch {
      return { ...DEFAULTS };
    }
  });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // Compute live estimated impact
  const estimatedImpact = (() => {
    const d = config.hourly_downtime_cost || 0;
    const e = (config.engineer_count || 0) * (config.avg_engineer_hourly_rate || 0) * (config.avg_fix_days || 0) * 8;
    const f = (config.feature_delay_cost_per_day || 0) * (config.avg_fix_days || 0);
    return d + e + f;
  })();

  const handleChange = (key, value) => {
    const numValue = value === '' ? '' : Number(value);
    setConfig((prev) => ({ ...prev, [key]: numValue }));

    // Clear error on valid input
    if (numValue === '' || numValue >= 0) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    for (const field of FIELDS) {
      const v = config[field.key];
      if (v === '' || v === undefined || v === null) {
        newErrors[field.key] = 'Required';
      } else if (typeof v !== 'number' || isNaN(v)) {
        newErrors[field.key] = 'Must be a number';
      } else if (v < 0) {
        newErrors[field.key] = 'Cannot be negative';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    localStorage.setItem('company_config', JSON.stringify(config));
    setSaved(true);
    setTimeout(() => {
      navigate('/dashboard', { replace: true });
    }, 800);
  };

  const handleReset = () => {
    setConfig({ ...DEFAULTS });
    setErrors({});
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-bg-primary overflow-hidden py-10">
      {/* Animated background orbs */}
      <div className="absolute top-[-150px] left-[-100px] w-[500px] h-[500px] rounded-full bg-blue/10 blur-3xl animate-float-slow pointer-events-none" />
      <div className="absolute bottom-[-120px] right-[-80px] w-[400px] h-[400px] rounded-full bg-purple/8 blur-3xl animate-float-slower pointer-events-none" />
      <div className="absolute top-[40%] right-[20%] w-[200px] h-[200px] rounded-full bg-cyan/5 blur-2xl animate-float-slow pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-[640px] mx-4"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue/10 border border-blue/20 mb-4"
          >
            <Building2 className="w-8 h-8 text-blue" />
          </motion.div>
          <h1 className="text-3xl font-display font-bold text-text tracking-tight">
            Company SLA Configuration
          </h1>
          <p className="text-sm text-muted font-display mt-2 max-w-md mx-auto leading-relaxed">
            Configure your organization's cost parameters to generate personalized financial risk assessments.
          </p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit}>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-8 space-y-5">
            {/* Live Impact Preview */}
            <motion.div
              layout
              className="rounded-xl bg-gradient-to-r from-blue/5 via-cyan/5 to-purple/5 border border-white/[0.06] p-5"
            >
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-cyan" />
                <span className="text-xs font-display text-muted uppercase tracking-wider">
                  Estimated Single-Incident Impact
                </span>
              </div>
              <motion.p
                key={estimatedImpact}
                initial={{ opacity: 0.5, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-mono font-bold text-text"
              >
                Rs.{estimatedImpact.toLocaleString('en-IN')}
              </motion.p>
              <p className="text-xs text-muted font-display mt-1">
                Total exposure = Downtime + Engineer cost + Feature delay
              </p>
            </motion.div>

            {/* Fields */}
            {FIELDS.map((field, index) => {
              const Icon = field.icon;
              const colors = colorMap[field.color];
              const hasError = errors[field.key];

              return (
                <motion.div
                  key={field.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.06 }}
                  className={`group relative rounded-xl border p-4 transition-all duration-300 ${
                    focusedField === field.key
                      ? `${colors.border} bg-white/[0.04] shadow-lg`
                      : hasError
                      ? 'border-red/30 bg-red/[0.02]'
                      : 'border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${colors.bg} ${colors.border} border flex items-center justify-center transition-transform duration-200 group-hover:scale-110`}>
                      <Icon className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-sm font-display text-text font-medium mb-0.5">
                        {field.label}
                      </label>
                      <p className="text-xs text-muted font-display mb-2">
                        {field.description}
                      </p>
                      <div className="relative">
                        {field.prefix && (
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-mono text-muted pointer-events-none">
                            {field.prefix}
                          </span>
                        )}
                        <input
                          id={`sla-field-${field.key}`}
                          type="number"
                          min="0"
                          step="any"
                          value={config[field.key]}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          onFocus={() => setFocusedField(field.key)}
                          onBlur={() => setFocusedField(null)}
                          className={`w-full bg-bg-primary/60 border rounded-lg py-2 text-sm font-mono text-text placeholder:text-muted/50 focus:outline-none focus:ring-2 transition-all ${
                            field.prefix ? 'pl-8' : 'pl-3'
                          } pr-20 ${
                            hasError ? 'border-red/40 focus:ring-red/30' : `border-white/[0.08] ${colors.ring}`
                          }`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-display text-muted pointer-events-none">
                          {field.suffix}
                        </span>
                      </div>
                      <AnimatePresence>
                        {hasError && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-xs text-red font-display mt-1"
                          >
                            {errors[field.key]}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Security note */}
            <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-cyan/5 border border-cyan/10">
              <Shield className="w-4 h-4 text-cyan flex-shrink-0" />
              <p className="text-[11px] text-muted font-display">
                Configuration is stored locally in your browser. No data is sent to external servers.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-display text-muted hover:text-text hover:bg-white/[0.05] border border-white/[0.06] transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Defaults
              </button>
              <button
                type="submit"
                disabled={saved}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-display font-medium transition-all duration-300 ${
                  saved
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-blue text-white hover:bg-blue/90 shadow-lg shadow-blue/20'
                }`}
              >
                {saved ? (
                  <>
                    <Check className="w-4 h-4" />
                    Saved — Redirecting...
                  </>
                ) : (
                  <>
                    Save & Continue
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
