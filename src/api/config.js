import { getAdminPath } from '../pages/settings/SiteSettings/settingsService.js'; // Correct relative path

// Build-time env (Vercel/Vite) wins; window._env_ is a legacy runtime override.
let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || window._env_?.VITE_API_BASE_URL;


// Fallback only for development
if (!API_BASE_URL && import.meta.env.DEV) {
  API_BASE_URL = 'http://localhost:5000/api';
}

export { API_BASE_URL };

// Uploaded files are served by the API host itself (without /api).
export const STATIC_BASE_URL = import.meta.env.VITE_STATIC_BASE_URL || String(API_BASE_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

// Function to get admin API base URL
export const getAdminApiBaseUrl = async (token) => {
  const adminPath = await getAdminPath(token);
  return `${API_BASE_URL}/${adminPath}`;
};