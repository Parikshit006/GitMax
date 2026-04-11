import client from './axiosClient';

export const getAnalysisHistory = () =>
  client.get('/api/history').then(r => r.data);

export const getCoverage = () =>
  Promise.resolve([
    { week: 'W1', coverage: 72 },
    { week: 'W2', coverage: 75 },
    { week: 'W3', coverage: 82 },
    { week: 'W4', coverage: 79 },
    { week: 'W5', coverage: 85 },
  ]);

export const getBlindSpots = () =>
  Promise.resolve([]);

