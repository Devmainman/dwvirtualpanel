import axios from 'axios';
import { API_BASE_URL } from './config';

const SIGNAL_PACKAGES_URL = `${API_BASE_URL}/admin/signal-packages`;

// helper (same style as packageService)
const createConfig = (token, isFileUpload = false) => {
  if (!token) throw new Error('Authentication token missing');

  return {
    headers: {
      'Content-Type': isFileUpload ? 'multipart/form-data' : 'application/json',
      Authorization: `Bearer ${token}`
    }
  };
};

const handleError = (error) => {
  console.error('API Error:', {
    url: error.config?.url,
    status: error.response?.status,
    data: error.response?.data
  });
  throw error;
};

/* ================= FETCH ================= */

const getPackages = async (token) => {
  try {
    const config = createConfig(token);
    const res = await axios.get(SIGNAL_PACKAGES_URL, config);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

/* ================= CREATE ================= */

const createPackage = async (packageData, token) => {
  try {
    const isFileUpload = packageData instanceof FormData;
    const config = createConfig(token, isFileUpload);

    const res = await axios.post(SIGNAL_PACKAGES_URL, packageData, config);
    return res.data;
  } catch (error) {
    console.error('Create signal package error:', {
      url: SIGNAL_PACKAGES_URL,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
};

/* ================= UPDATE ================= */

const updatePackage = async (id, packageData, token) => {
  try {
    const isFileUpload = packageData instanceof FormData;
    const config = createConfig(token, isFileUpload);

    const res = await axios.put(`${SIGNAL_PACKAGES_URL}/${id}`, packageData, config);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

/* ================= DELETE ================= */

const deletePackage = async (id, token) => {
  try {
    const config = createConfig(token);
    const res = await axios.delete(`${SIGNAL_PACKAGES_URL}/${id}`, config);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

/* ================= TOGGLE ================= */

const togglePackageStatus = async (id, token) => {
  try {
    const config = createConfig(token);
    const res = await axios.patch(
      `${SIGNAL_PACKAGES_URL}/${id}/toggle-status`,
      {},
      config
    );
    return res.data;
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
