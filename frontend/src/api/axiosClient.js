import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
  timeout: 30000,
});



client.interceptors.request.use(config => {
  const token = sessionStorage.getItem('gitmax_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      sessionStorage.removeItem('gitmax_token');
      sessionStorage.removeItem('gitmax_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default client;
