// api/adminTradingApi.js
import axios from 'axios';
import { API_BASE_URL } from './config';

export const getAllTrades = async (token, filters = {}) => {
  try {
    const { status, userId, page, limit } = filters;
    const params = new URLSearchParams();
    
    if (status) params.append('status', status);
    if (userId) params.append('userId', userId);
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    
    const response = await axios.get(`${API_BASE_URL}/admin/trading/trades?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateTrade = async (token, tradeId, updates) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/admin/trading/trades/${tradeId}`,
      updates,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getTradePackages = async (token, filters = {}) => {
  try {
    const { status, page, limit } = filters;
    const params = new URLSearchParams();
    
    if (status) params.append('status', status);
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    
    const response = await axios.get(`${API_BASE_URL}/admin/trading/trade-packages?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createTradePackage = async (token, packageData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/admin/trading/trade-packages`,
      packageData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateTradePackage = async (token, packageId, updates) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/admin/trading/trade-packages/${packageId}`,
      updates,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteTradePackage = async (token, packageId) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/admin/trading/trade-packages/${packageId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getTradeStatistics = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/trading/statistics`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};