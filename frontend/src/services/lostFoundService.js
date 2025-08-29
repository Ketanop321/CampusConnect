import api from './api';

const API_URL = '/api/lostfound/items/';

// Get all lost and found items
const getLostFoundItems = async () => {
  try {
    console.log('Fetching items from:', API_URL);
    const response = await api.get(API_URL);
    
    // Handle different response formats
    const items = response.data.results || response.data || [];
    console.log('Received items:', items);
    
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
const createLostFoundItem = async (itemData) => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };

  // Convert the item data to FormData to handle file upload
  const formData = new FormData();
  Object.keys(itemData).forEach((key) => {
    if (itemData[key] !== null && itemData[key] !== undefined) {
      formData.append(key, itemData[key]);
    }
  });

  const response = await api.post(API_URL, formData, config);
  return response.data;
};

// Update a lost/found item
const updateLostFoundItem = async (id, itemData) => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };

  // Format the date if it exists
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

  const response = await api.patch(`${API_URL}${id}/`, formData, config);
  return response.data;
};

// Delete a lost/found item
const deleteLostFoundItem = async (id) => {
  const response = await api.delete(`${API_URL}${id}/`);
  return response.data;
};

// Claim an item
const claimItem = async (id) => {
  const response = await api.post(`${API_URL}${id}/claim/`, {});
  return response.data;
};

// Mark item as found
const markAsFound = async (id) => {
  const response = await api.post(`${API_URL}${id}/mark_found/`, {});
  return response.data;
};

// Get a single lost/found item by ID
const getLostFoundItem = async (id) => {
  try {
    const response = await api.get(`${API_URL}${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching lost and found item:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });
    throw error;
  }
};

const lostFoundService = {
  getLostFoundItems,
  getLostFoundItem,
  createLostFoundItem,
  updateLostFoundItem,
  deleteLostFoundItem,
  claimItem,
  markAsFound,
};

export default lostFoundService;