import api from './api';

export const userService = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/api/accounts/profile/');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/api/accounts/profile/update/', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Change password
  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    try {
      const response = await api.put('/api/accounts/change-password/', {
        old_password: currentPassword,
        password: newPassword,
        password2: confirmPassword
      });
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

  // Delete account
  deleteAccount: async (password) => {
    try {
      const response = await api.delete('/api/accounts/delete-account/', {
        data: { password }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  },

  // Check authentication status
  checkAuth: async () => {
    try {
      const response = await api.get('/api/accounts/check-auth/');
      return response.data;
    } catch (error) {
      console.error('Error checking auth status:', error);
      throw error;
    }
  }
};

export default userService;
