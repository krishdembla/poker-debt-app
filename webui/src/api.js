import axios from 'axios';
import { handleAPIError } from './utils/apiErrorHandler';

const TOKEN_KEY = 'poker_token';
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);
const getToken = () => localStorage.getItem(TOKEN_KEY);

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5051/api";
const api = axios.create({
  baseURL: API_URL, 
});

// inject header
api.interceptors.request.use((config) => {
  const t = getToken();
  if (t) config.headers['Authorization'] = `Bearer ${t}`;
  return config;
});

// auto logout on 401 and handle errors
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const errorInfo = handleAPIError(err);
    
    if (err.response && err.response.status === 401) {
      clearToken();
      window.location.href = '/login';
    }
    
    // Add error info to the error object for components to use
    err.errorInfo = errorInfo;
    return Promise.reject(err);
  }
);

export const createGame = (data) => api.post('/game', data);
export const addBuyIn = (gameId, data) => api.post(`/game/${gameId}/player`, data);
export const addCashOut = (gameId, data) => api.post(`/game/${gameId}/cashout`, data);
export const fetchSummary = (gameId) => api.get(`/game/${gameId}/summary`);
export const fetchSettlement = (gameId) => api.get(`/game/${gameId}/settle`);
export const listGames = () => api.get('/games');
export const login = (data) => api.post('/login', data);
export const registerUser = (data) => api.post('/register', data);
export const deleteGame = (id) => api.delete(`/game/${id}`);
export const renameGame = (id, title) => api.patch(`/game/${id}/title`, { title });
export const updateGameDate = (id, date) => api.patch(`/game/${id}/date`, { date });
export const updateBuyIn = (gameId,name,idx,amount) => api.patch(`/game/${gameId}/player/${encodeURIComponent(name)}/buyin/${idx}`, { amount });
export const deleteBuyIn = (gameId,name,idx) => api.delete(`/game/${gameId}/player/${encodeURIComponent(name)}/buyin/${idx}`);
export const removePlayer = (gameId, name) => api.delete(`/game/${gameId}/player/${encodeURIComponent(name)}`);

export default api;
