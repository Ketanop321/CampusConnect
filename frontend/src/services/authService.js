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

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.email - User's email
 * @param {string} userData.name - User's full name
 * @param {string} userData.mobile - User's mobile number
 * @param {string} userData.password - User's password
 * @param {string} userData.password2 - Password confirmation
 * @param {string} userData.address - User's address
 * @returns {Promise<Object>} - Registration response
 */
export const register = async (userData) => {
  try {
    console.log('Registering user with data:', userData);
    
    // Validate required fields
    const requiredFields = ['email', 'name', 'mobile', 'password', 'password2', 'address'];
    const missingFields = requiredFields.filter(field => !userData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    if (userData.password !== userData.password2) {
      throw new Error('Passwords do not match');
    }
    
    const response = await apiRequest('/accounts/register/', 'POST', {
      email: userData.email,
      name: userData.name,
      mobile: userData.mobile,
      password: userData.password,
      password2: userData.password2,
      address: userData.address,
    });
    
    console.log('Registration successful:', response);
    return response;
  } catch (error) {
    console.error('Registration failed:', error);
    
    // Handle specific error cases
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;
      
      if (status === 400) {
        // Handle validation errors
        const errorMessages = [];
        for (const [field, errors] of Object.entries(data)) {
          if (Array.isArray(errors)) {
            errorMessages.push(`${field}: ${errors.join(', ')}`);
          } else if (typeof errors === 'string') {
            errorMessages.push(`${field}: ${errors}`);
          } else if (typeof errors === 'object') {
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
      } else if (status === 500) {
        throw new Error('Server error. Please try again later.');
      }
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('No response from server. Please check your connection.');
    }
    
    // Something happened in setting up the request that triggered an Error
    throw error;
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
