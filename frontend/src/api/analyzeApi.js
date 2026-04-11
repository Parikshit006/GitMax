import client from './axiosClient';
import { getCompanyConfigOrDefaults } from '../utils/companyConfig';

// This is the only place DEMO_FIXTURE exists.
// It ONLY activates when:
//   1. VITE_DEMO_MODE=true in .env
//   2. AND a real network error occurs (WiFi down during demo)
// Under normal operation this code never runs.
export const analyzePR = async (repoUrl, prNumber) => {
  // Auto-load company SLA config from localStorage
  const config = getCompanyConfigOrDefaults();

  const response = await client.post('/api/analyze-pr', {
    repo_url: repoUrl,
    pr_number: parseInt(prNumber),
    company_config: {
      hourly_downtime_cost: config.hourly_downtime_cost,
      engineer_count: config.engineer_count,
      avg_engineer_hourly_rate: config.avg_engineer_hourly_rate,
      avg_fix_days: config.avg_fix_days,
      feature_delay_cost_per_day: config.feature_delay_cost_per_day,
    }
  });
  return response.data;
};


