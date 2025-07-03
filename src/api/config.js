import { getAdminPath } from '../pages/settings/SiteSettings/settingsService.js'; // Correct relative path

let API_BASE_URL = window._env_?.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE_URL;


// Fallback only for development
if (!API_BASE_URL && import.meta.env.DEV) {
  API_BASE_URL = 'http://localhost:5000/api';
}

export { API_BASE_URL };

export const STATIC_BASE_URL = import.meta.env.VITE_STATIC_BASE_URL || 'http://localhost:5000';

// Function to get admin API base URL
export const getAdminApiBaseUrl = async (token) => {
  const adminPath = await getAdminPath(token);
  return `${API_BASE_URL}/${adminPath}`;
};