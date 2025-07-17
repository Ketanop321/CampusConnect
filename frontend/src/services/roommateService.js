import api from './api';

const API_BASE_URL = '/api/roommate/posts/';

// No need to create a new axios instance, we'll use the shared one from api.js
// which already has authentication interceptors configured

// Helper function to handle form data with files
const createFormData = (data) => {
  const formData = new FormData();
  
  // Append all fields to formData
  Object.entries(data).forEach(([key, value]) => {
    // Handle file uploads and arrays
    if (value instanceof File) {
      formData.append(key, value);
    } else if (Array.isArray(value)) {
      // Handle arrays (e.g., images, amenities)
      value.forEach((item, index) => {
        if (item instanceof File) {
          formData.append(`${key}`, item);
        } else if (typeof item === 'object' && item !== null) {
          // Handle array of objects (e.g., amenities)
          Object.entries(item).forEach(([subKey, subValue]) => {
            formData.append(`${key}[${index}].${subKey}`, subValue);
          });
        } else {
          formData.append(`${key}[${index}]`, item);
        }
      });
    } else if (value && typeof value === 'object') {
      // Handle nested objects
      Object.entries(value).forEach(([subKey, subValue]) => {
        formData.append(`${key}.${subKey}`, subValue);
      });
    } else if (value !== null && value !== undefined) {
      // Handle primitive values
      formData.append(key, value);
    }
  });
  
  return formData;
};

export const getRoommatePosts = async (params = {}) => {
  try {
    const response = await api.get(API_BASE_URL, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching roommate posts:', error);
    throw error;
  }
};

export const getRoommatePost = async (id) => {
  try {
    const response = await api.get(`${API_BASE_URL}${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching roommate post ${id}:`, error);
    throw error;
  }
};

export const createRoommatePost = async (postData) => {
  try {
    // Check if we have files to upload
    const hasFiles = postData.images && postData.images.length > 0;
    
    let response;
    
    if (hasFiles) {
      // For file uploads, use FormData
      const formData = createFormData(postData);
      
      // Override the content type for multipart/form-data
      response = await api.post(API_BASE_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      // For regular JSON data
      response = await api.post(API_BASE_URL, postData);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error creating roommate post:', error);
    
    // Format validation errors for display
    if (error.response?.data) {
      const { data } = error.response;
      if (typeof data === 'object') {
        // Handle field-specific validation errors
        const errorMessages = [];
        
        for (const [field, errors] of Object.entries(data)) {
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
        
        if (errorMessages.length > 0) {
          throw new Error(errorMessages.join('\n'));
        }
      }
    }
    
    throw error;
  }
};

export const updateRoommatePost = async (id, postData) => {
  try {
    // Check if we have files to upload
    const hasFiles = postData.images && postData.images.length > 0;
    
    let response;
    
    if (hasFiles) {
      // For file uploads, use FormData
      const formData = createFormData(postData);
      
      // For updates, we need to use PATCH to avoid sending all fields
      response = await api.patch(`${API_BASE_URL}${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      // For regular JSON data, use PATCH for partial updates
      response = await api.patch(`${API_BASE_URL}${id}/`, postData);
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error updating roommate post ${id}:`, error);
    throw error;
  }
};

export const deleteRoommatePost = async (id) => {
  try {
    const response = await api.delete(`${API_BASE_URL}${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting roommate post ${id}:`, error);
    throw error;
  }
};
