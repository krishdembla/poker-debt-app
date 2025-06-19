import axios from 'axios';

const TOKEN_KEY = 'poker_token';
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);
const getToken = () => localStorage.getItem(TOKEN_KEY);

const api = axios.create({
  baseURL: '/api', 
});

// inject header
api.interceptors.request.use((config) => {
  const t = getToken();
  if (t) config.headers['Authorization'] = `Bearer ${t}`;
  return config;
});

// auto logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      clearToken();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const createGame = () => api.post('/game');
export const addBuyIn = (gameId, data) => api.post(`/game/${gameId}/player`, data);
export const addCashOut = (gameId, data) => api.post(`/game/${gameId}/cashout`, data);
export const fetchSummary = (gameId) => api.get(`/game/${gameId}/summary`);
export const fetchSettlement = (gameId) => api.get(`/game/${gameId}/settle`);
export const listGames = () => api.get('/games');
export const login = (data) => api.post('/login', data);
export const registerUser = (data) => api.post('/register', data);
export const deleteGame = (id) => api.delete(`/game/${id}`);

export default api;
