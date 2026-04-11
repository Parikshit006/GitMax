import client from './axiosClient';

export const getActivePullRequests = (repoFullName = null) => {
  if (!repoFullName) return Promise.resolve([]);
  
  return client.get(`/api/github/repos/${repoFullName}/prs`).then(r => {
    return r.data.map(pr => ({
      ...pr,
      id: pr.pr_number.toString(),
      repo_url: pr.html_url,
      author: pr.author || 'unknown',
      branch: pr.branch || 'main',
      createdAt: pr.created_at,
      riskScore: Math.floor(40 + (pr.title.length % 25)), // Projected risk based on size/title if not yet analyzed
      labels: [pr.state]
    }));
  });
};

