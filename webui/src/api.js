import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // CRA proxy rewrites to backend
});

export const createGame = () => api.post('/game');
export const addBuyIn = (gameId, data) => api.post(`/game/${gameId}/player`, data);
export const addCashOut = (gameId, data) => api.post(`/game/${gameId}/cashout`, data);
export const fetchSummary = (gameId) => api.get(`/game/${gameId}/summary`);
export const fetchSettlement = (gameId) => api.get(`/game/${gameId}/settle`);

export default api;
