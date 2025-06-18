// src/api/popupAssignments.js
import axios from 'axios';
import { API_BASE_URL } from './config';

const getAuthHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` }
});

export const getPopupAssignments = async (token, type, params = {}) => {
  const response = await axios.get(`${API_BASE_URL}/admin/popup-assignments`, {
    params: { ...params, type },
    ...getAuthHeaders(token)
  });
  return response.data;
};

export const toggleAssignmentStatus = async (token, id) => {
  const response = await axios.patch(
    `${API_BASE_URL}/admin/popup-assignments/${id}/toggle-status`,
    {},
    getAuthHeaders(token)
  );
  return response.data;
};

export const deleteAssignment = async (token, id) => {
  await axios.delete(
    `${API_BASE_URL}/admin/popup-assignments/${id}`,
    getAuthHeaders(token)
  );
};

export const getUserAssignments = async (token, userId, type) => {
  const response = await axios.get(
    `${API_BASE_URL}/users/${userId}/admin/popup-assignments`,
    {
      params: { type },
      ...getAuthHeaders(token)
    }
  );
  return response.data;
};