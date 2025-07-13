import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import * as authService from '../services/authService';

const AuthContext = createContext();

// Helper function to get token from localStorage
const getStoredToken = () => {
  return localStorage.getItem('access_token');
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getStoredToken());
  const [isAuthenticated, setIsAuthenticated] = useState(!!getStoredToken());
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is logged in on initial load
  const checkAuth = useCallback(async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await authService.logout();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const result = await authService.login(email, password);
      
      if (result && result.user) {
        const accessToken = result.access || getStoredToken();
        setUser(result.user);
        setToken(accessToken);
        setIsAuthenticated(true);
        toast.success('Logged in successfully');
        navigate('/');
        return true;
      }
      
      toast.error('Login failed. Please try again.');
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Login failed';
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      await authService.register(userData);
      toast.success('Registration successful! Please log in.');
      navigate('/login');
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error(error.message || 'Registration failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (userData) => {
    try {
      setIsLoading(true);
      const updatedUser = await authService.updateProfile(userData);
      setUser(updatedUser);
      toast.success('Profile updated successfully');
      return true;
    } catch (error) {
      console.error('Update profile failed:', error);
      toast.error(error.message || 'Failed to update profile');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      setIsLoading(true);
      await authService.changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully');
      return true;
    } catch (error) {
      console.error('Change password failed:', error);
      toast.error(error.message || 'Failed to change password');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
      }}
    >
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

export default AuthContext;
