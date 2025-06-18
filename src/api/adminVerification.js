import axios from 'axios';
import { API_BASE_URL } from './config';

// Create axios instance with auth headers
const createApiInstance = (token) => {
  return axios.create({
    baseURL: `${API_BASE_URL}/admin/verifications`,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};

export const getVerificationCounts = async (token) => {
  try {
    const api = createApiInstance(token);
    const response = await api.get('/verification-counts');
    return response.data;
  } catch (error) {
    console.error('Error fetching verification counts:', error);
    throw error;
  }
};

export const getIdVerifications = async (token) => {
  try {
    const api = createApiInstance(token);
    const response = await api.get('/id-verifications');
    return response.data.verifications;
  } catch (error) {
    console.error('Error fetching ID verifications:', error);
    throw error;
  }
};

export const updateIdVerification = async (token, userId, documentId, action, rejectionReason = '') => {
  try {
    const api = createApiInstance(token);
    const response = await api.put(`/id-verifications/${userId}/${documentId}`, {
      action,
      rejectionReason,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating ID verification:', error);
    throw error;
  }
};

export const getAddressVerifications = async (token) => {
  try {
    const api = createApiInstance(token);
    const response = await api.get('/address-verifications');
    return response.data.verifications;
  } catch (error) {
    console.error('Error fetching address verifications:', error);
    throw error;
  }
};

export const updateAddressVerification = async (token, userId, action, rejectionReason = '') => {
  try {
    const api = createApiInstance(token);
    const response = await api.put(`/address-verifications/${userId}`, {
      action,
      rejectionReason,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating address verification:', error);
    throw error;
  }
};

export const getFacialVerifications = async (token) => {
  try {
    const api = createApiInstance(token);
    const response = await api.get('/facial-verifications');
    return response.data.verifications;
  } catch (error) {
    console.error('Error fetching facial verifications:', error);
    throw error;
  }
};

export const updateFacialVerification = async (token, userId, action, rejectionReason = '') => {
  try {
    const api = createApiInstance(token);
    const response = await api.put(`/facial-verifications/${userId}`, {
      action,
      rejectionReason,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating facial verification:', error);
    throw error;
  }
};