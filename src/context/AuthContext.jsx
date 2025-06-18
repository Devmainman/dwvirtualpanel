import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api/config';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Consolidated token management
  const getToken = () => {
    const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
    console.log('Retrieved token from storage:', token ? `Exists (${token.length} chars)` : 'None');
    return token;
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        console.log('Verifying token with backend...');
        const response = await axios.get(`${API_BASE_URL}/admin/verify`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Token verification successful');
        setAdmin({
          ...response.data.admin,
          token // Ensure token is included in admin object
        });
      } catch (error) {
        console.error('Token verification failed:', error);
        clearAuthData();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const clearAuthData = () => {
    localStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminToken');
    setAdmin(null);
  };

  const login = async (email, password, rememberMe) => {
    try {
      console.log('Attempting login...');
      const response = await axios.post(`${API_BASE_URL}/admin/login`, {
        email,
        password
      });

      console.log('Login successful, storing token...');
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('adminToken', response.data.token);
      
      setAdmin({
        email,
        token: response.data.token // Make sure token is included
      });
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      clearAuthData();
      return false;
    }
  };

  const logout = () => {
    console.log('Logging out...');
    clearAuthData();
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{
      user: admin,
      token: admin?.token || getToken(), // Fallback to storage token
      isAuthenticated: !!admin,
      loading,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};