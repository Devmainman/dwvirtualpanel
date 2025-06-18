import axios from 'axios';
import { API_BASE_URL } from './config';

const PACKAGES_URL = `${API_BASE_URL}/packages`;

// Helper function to create config with or without file upload
const createConfig = (token, isFileUpload = false) => {
  if (!token) {
    console.error('No token provided');
    throw new Error('Authentication token missing');
  }

  return {
    headers: {
      'Content-Type': isFileUpload ? 'multipart/form-data' : 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };
};

const handleError = (error) => {
  console.error('API Error:', {
    url: error.config?.url,
    status: error.response?.status,
    data: error.response?.data,
    headers: error.config?.headers
  });
  throw error;
};

const getPackages = async (token) => {
  try {
    const config = createConfig(token);
    const response = await axios.get(PACKAGES_URL, config);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

const createPackage = async (packageData, token) => {
  try {
    console.log('Creating package at:', PACKAGES_URL);
    
    // Check if we're dealing with FormData (file upload)
    const isFileUpload = packageData instanceof FormData;
    const config = createConfig(token, isFileUpload);
    
    const response = await axios.post(PACKAGES_URL, packageData, config);
    return response.data;
  } catch (error) {
    console.error('Create package error:', {
      url: PACKAGES_URL,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
};

const updatePackage = async (packageId, packageData, token) => {
  try {
    // Check if we're dealing with FormData (file upload)
    const isFileUpload = packageData instanceof FormData;
    const config = createConfig(token, isFileUpload);
    
    const response = await axios.put(
      `${PACKAGES_URL}/${packageId}`, 
      packageData, 
      config
    );
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

// The following functions remain unchanged as they don't handle file uploads
const deletePackage = async (packageId, token) => {
  try {
    const config = createConfig(token);
    const response = await axios.delete(`${PACKAGES_URL}/${packageId}`, config);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

const togglePackageStatus = async (packageId, token) => {
  try {
    const config = createConfig(token);
    const response = await axios.patch(
      `${PACKAGES_URL}/${packageId}/toggle-status`, 
      {}, 
      config
    );
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export default {
  getPackages,
  createPackage,
  updatePackage,
  deletePackage,
  togglePackageStatus
};