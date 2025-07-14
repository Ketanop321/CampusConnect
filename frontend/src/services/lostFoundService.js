import api from './api';

const API_URL = '/api/lostfound/items/';

// Get all lost and found items
export const getLostFoundItems = async () => {
  try {
    const response = await api.get(API_URL);
    // Handle different response formats
    const items = response.data.results || response.data || [];
    return Array.isArray(items) ? items : [];
  } catch (error) {
    console.error('Error fetching lost and found items:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });
    throw error;
  }
};

// Create a new lost/found item
export const createLostFoundItem = async (itemData) => {
  const formData = new FormData();
  Object.keys(itemData).forEach((key) => {
    if (itemData[key] !== null && itemData[key] !== undefined) {
      formData.append(key, itemData[key]);
    }
  });

  const response = await api.post(API_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Update a lost/found item
export const updateLostFoundItem = async (id, itemData) => {
  // Format the date to ensure it's in the correct format
  const formattedData = { ...itemData };
  if (formattedData.date_occurred) {
    const date = new Date(formattedData.date_occurred);
    // Set time to noon to avoid timezone issues
    date.setHours(12, 0, 0, 0);
    formattedData.date_occurred = date.toISOString();
  }

  const formData = new FormData();
  Object.keys(formattedData).forEach((key) => {
    if (formattedData[key] !== null && formattedData[key] !== undefined) {
      formData.append(key, formattedData[key]);
    }
  });

  const response = await api.patch(`${API_URL}/${id}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Delete a lost/found item
export const deleteLostFoundItem = async (id) => {
  const response = await api.delete(`${API_URL}/${id}/`);
  return response.data;
};

// Claim an item
export const claimItem = async (id) => {
  const response = await api.post(`${API_URL}/${id}/claim/`, {});
  return response.data;
};

// Mark item as found
export const markAsFound = async (id) => {
  const response = await api.post(`${API_URL}/${id}/mark_found/`, {});
  return response.data;
};

// Export all functions individually for named imports
export default {
  getLostFoundItems,
  createLostFoundItem,
  updateLostFoundItem,
  deleteLostFoundItem,
  claimItem,
  markAsFound,
};
