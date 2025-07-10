// Mock authentication service
// Replace with actual API calls in production

export const login = async (credentials) => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock successful login
      resolve({
        user: {
          id: '1',
          email: credentials.email,
          name: 'Test User',
          role: 'student',
          token: 'mock-jwt-token'
        }
      });
    }, 500);
  });
};

export const logout = async () => {
  // Clear any stored tokens/user data
  return Promise.resolve();
};

export const getCurrentUser = () => {
  // Get user from localStorage or context
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
