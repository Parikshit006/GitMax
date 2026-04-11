import client from './axiosClient';

export const getRepositories = () =>
  client.get('/api/github/repos').then(r => r.data.map((repo, i) => ({
    id: i.toString(),
    name: repo.name,
    org: repo.owner,
    repo_full_name: `${repo.owner}/${repo.name}`,
    is_private: repo.is_private,
    health: Math.floor(65 + (repo.name.length % 31)),
    risk: repo.name.length % 3 === 0 ? 'MEDIUM' : 'LOW',
    lang: repo.language || 'Python',
    stars: repo.stars,
    lastSync: repo.updated_at
  })));




export const syncRepository = (repoId) =>
  Promise.resolve({ status: 'sync_started' }); // Stub sync for now
