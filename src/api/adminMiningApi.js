// api/adminMiningApi.js
import { API_BASE_URL } from './config.js';

// Helper function to handle API calls
const makeRequest = async (endpoint, method = 'GET', data = null, token) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const config = {
    method,
    headers
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE_URL}/admin/mining${endpoint}`, config);
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
};

// Mining Overview Stats
export const getMiningStats = async (token) => {
  return makeRequest('/stats', 'GET', null, token);
};

// Mining Pools
export const getMiningPools = async (token, filters = {}) => {
  const queryParams = new URLSearchParams(filters).toString();
  const endpoint = queryParams ? `/pools?${queryParams}` : '/pools';
  return makeRequest(endpoint, 'GET', null, token);
};

export const updateMiningPool = async (token, poolId, data) => {
  return makeRequest(`/pools/${poolId}`, 'PUT', data, token);
};

// Mining Equipment
export const getMiningEquipment = async (token, filters = {}) => {
  const queryParams = new URLSearchParams(filters).toString();
  const endpoint = queryParams ? `/equipment?${queryParams}` : '/equipment';
  return makeRequest(endpoint, 'GET', null, token);
};

export const deleteMiningEquipment = async (token, equipmentId) => {
  return makeRequest(`/equipment/${equipmentId}`, 'DELETE', null, token);
};

// Mining Sessions
export const getMiningSessions = async (token, filters = {}) => {
  const queryParams = new URLSearchParams(filters).toString();
  const endpoint = queryParams ? `/sessions?${queryParams}` : '/sessions';
  return makeRequest(endpoint, 'GET', null, token);
};

export const deleteMiningSession = async (token, sessionId) => {
  return makeRequest(`/sessions/${sessionId}`, 'DELETE', null, token);
};

// Mining Rewards
export const getMiningRewards = async (token, filters = {}) => {
  const queryParams = new URLSearchParams(filters).toString();
  const endpoint = queryParams ? `/rewards?${queryParams}` : '/rewards';
  return makeRequest(endpoint, 'GET', null, token);
};

export const deleteMiningReward = async (token, rewardId) => {
  return makeRequest(`/rewards/${rewardId}`, 'DELETE', null, token);
};

// Mining Boosters
export const getMiningBoosters = async (token, filters = {}) => {
  const queryParams = new URLSearchParams(filters).toString();
  const endpoint = queryParams ? `/boosters?${queryParams}` : '/boosters';
  return makeRequest(endpoint, 'GET', null, token);
};

// User Mining Statistics
export const getUserMiningStats = async (token, filters = {}) => {
  const queryParams = new URLSearchParams(filters).toString();
  const endpoint = queryParams ? `/users/stats?${queryParams}` : '/users/stats';
  return makeRequest(endpoint, 'GET', null, token);
};

// Mining Analytics
export const getMiningAnalytics = async (token, period = '7d') => {
  return makeRequest(`/analytics?period=${period}`, 'GET', null, token);
};

// Export Mining Data
export const exportMiningData = async (token, type = 'rewards', format = 'csv', startDate, endDate) => {
  let endpoint = `/export?type=${type}&format=${format}`;
  if (startDate) endpoint += `&startDate=${startDate}`;
  if (endDate) endpoint += `&endDate=${endDate}`;
  return makeRequest(endpoint, 'GET', null, token);
};