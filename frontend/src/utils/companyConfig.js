/**
 * Company SLA Configuration utility.
 * Handles localStorage read/write and provides defaults.
 */

const STORAGE_KEY = 'company_config';

export const DEFAULT_CONFIG = {
  hourly_downtime_cost: 5600,
  engineer_count: 3,
  avg_engineer_hourly_rate: 85,
  avg_fix_days: 5,
  feature_delay_cost_per_day: 2000,
};

/**
 * Reads company config from localStorage.
 * Returns null if not found / invalid.
 */
export function getCompanyConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Validate all required keys exist and are numbers
    for (const key of Object.keys(DEFAULT_CONFIG)) {
      if (typeof parsed[key] !== 'number' || parsed[key] < 0) return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Returns config or safe defaults if missing.
 */
export function getCompanyConfigOrDefaults() {
  return getCompanyConfig() || { ...DEFAULT_CONFIG };
}

/**
 * Checks if a valid company config exists in localStorage.
 */
export function hasCompanyConfig() {
  return getCompanyConfig() !== null;
}
