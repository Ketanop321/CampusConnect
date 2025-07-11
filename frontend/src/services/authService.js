const API_URL = 'http://localhost:8000/api';

// Helper function to handle API requests
const apiRequest = async (endpoint, method = 'GET', data = null, token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
    credentials: 'include', // Important for cookies
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  console.log(`API Request: ${method} ${endpoint}`, { config, data });
  
  let response;
  let responseData;
  
  try {
    response = await fetch(`${API_URL}${endpoint}`, config);
    
    // Handle cases where response might not be JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      console.error('Non-JSON response:', { status: response.status, text });
      throw new Error(text || `Server returned ${response.status} ${response.statusText}`);
    }
    
    console.log(`API Response (${response.status}):`, responseData);

    if (!response.ok) {
      console.error('API Error Response:', { status: response.status, data: responseData });
      
      // Handle Django REST framework validation errors
      if (responseData.detail) {
        throw new Error(responseData.detail);
      } else if (responseData.non_field_errors) {
        throw new Error(responseData.non_field_errors.join(' '));
      } else if (response.status === 400 && typeof responseData === 'object') {
        // Handle field-specific validation errors
        const errorMessages = [];
        for (const [field, errors] of Object.entries(responseData)) {
          if (Array.isArray(errors)) {
            errorMessages.push(`${field}: ${errors.join(', ')}`);
          } else if (typeof errors === 'string') {
            errorMessages.push(`${field}: ${errors}`);
          } else if (typeof errors === 'object') {
            // Handle nested errors
            for (const [subField, subErrors] of Object.entries(errors)) {
              if (Array.isArray(subErrors)) {
                errorMessages.push(`${field}.${subField}: ${subErrors.join(', ')}`);
              } else {
                errorMessages.push(`${field}.${subField}: ${subErrors}`);
              }
            }
          }
        }
        throw new Error(errorMessages.join('\n') || 'Validation failed');
      } else if (response.status === 500) {
        throw new Error('Internal server error. Please try again later.');
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    }
    
    return responseData;
  } catch (error) {
    console.error('API Request Error:', {
      endpoint,
      method,
      status: response?.status,
      error: error.message,
      response: responseData
    });
    throw error;
  }
};

/**
 * Login with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<boolean>} - Whether login was successful
 */
export const login = async (email, password) => {
  try {
    const data = await apiRequest('/token/', 'POST', {
      email: email,
      password: password,
    });

    if (!data.access || !data.refresh) {
      throw new Error('Invalid response from server');
    }

    // Store tokens
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);

    // Get user profile
    const user = await getCurrentUser();
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      return { user, ...data };
    }
    
    throw new Error('Failed to fetch user profile');
  } catch (error) {
    console.error('Login error:', error);
    // Clear any partial auth data on error
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    throw error;
  }
};

export const register = async (userData) => {
  try {
    console.log('Registering user with data:', userData);
    const response = await apiRequest('/accounts/register/', 'POST', userData);
    console.log('Registration response:', response);
    return response;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error; // Re-throw to be handled by the component
  }
};

export const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const data = await apiRequest('/token/refresh/', 'POST', {
      refresh: refreshToken,
    });

    localStorage.setItem('access_token', data.access);
    return data.access;
  } catch (error) {
    // If refresh fails, clear tokens and redirect to login
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
    throw error;
  }
};

export const verifyToken = async (token) => {
  return await apiRequest('/token/verify/', 'POST', { token });
};

export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return null;

    // First verify if token is still valid
    await verifyToken(token);
    
    // Get user profile
    const user = await apiRequest('/accounts/profile/', 'GET', null, token);
    return user;
  } catch (error) {
    // If token is invalid, try to refresh it
    if (error.message === 'Token is invalid or expired') {
      try {
        const newToken = await refreshToken();
        const user = await apiRequest('/accounts/profile/', 'GET', null, newToken);
        return user;
      } catch (refreshError) {
        // If refresh fails, clear tokens and return null
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        return null;
      }
    }
    return null;
  }
};

export const updateProfile = async (userData) => {
  const token = localStorage.getItem('access_token');
  return await apiRequest('/accounts/profile/', 'PATCH', userData, token);
};

export const changePassword = async (currentPassword, newPassword) => {
  const token = localStorage.getItem('access_token');
  return await apiRequest(
    '/accounts/change-password/',
    'POST',
    { current_password: currentPassword, new_password: newPassword },
    token
  );
};

export const logout = async () => {
  // Clear tokens from storage
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  // You might want to call a logout endpoint if you have one
  // await apiRequest('/accounts/logout/', 'POST');
  return Promise.resolve();
};
