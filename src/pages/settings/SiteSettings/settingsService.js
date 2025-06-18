import axios from 'axios';
import { API_BASE_URL, getAdminApiBaseUrl } from '../../../api/config';

// Function to get settings
export const getSettings = async (token) => {
  try {
    if (!token) {
      throw new Error('Authentication token is required');
    }
    const adminBaseUrl = await getAdminApiBaseUrl(token);
    const response = await axios.get(`${adminBaseUrl}/settings`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Fetched settings:', response.data);
    return response.data.settings || response.data;
  } catch (error) {
    console.error('Error fetching settings:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
};

// Function to save settings
export const saveSettings = async (settings, token) => {
  try {
    if (!token) {
      throw new Error('Authentication token is required');
    }
    if (!settings || Object.keys(settings).length === 0) {
      throw new Error('No settings provided to save');
    }

    if (settings.websiteUrl) {
      console.log(`Updating admin path to: ${settings.websiteUrl}`);
    }

    const formData = new FormData();
    for (const [key, value] of Object.entries(settings)) {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    }

    console.log('Saving settings:', Object.fromEntries(formData));

    const adminBaseUrl = await getAdminApiBaseUrl(token);
    const response = await axios.post(`${adminBaseUrl}/settings`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    console.log('Settings saved:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error saving settings:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
};

// Function to get current admin path
export const getAdminPath = async (token) => {
  try {
    if (!token) {
      throw new Error('Authentication token is required');
    }
    const response = await axios.get(`${API_BASE_URL}/admin/settings`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const settings = response.data.settings || response.data;
    const adminPath = settings.websiteUrl && /^[a-zA-Z0-9_-]+$/.test(settings.websiteUrl)
      ? settings.websiteUrl
      : 'admin';
    return adminPath;
  } catch (error) {
    console.error('Error fetching admin path:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return 'admin';
  }
};