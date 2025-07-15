import axios from 'axios';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api/lostfound/items/`;

// Get all lost and found items
const getLostFoundItems = async (token = null) => {
  try {
    const config = {};
    
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`
      };
    }
    
    console.log('Fetching items from:', API_URL);
    const response = await axios.get(API_URL, config);
    
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
const createLostFoundItem = async (itemData, token) => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  };

  // Convert the item data to FormData to handle file upload
  const formData = new FormData();
  Object.keys(itemData).forEach((key) => {
    if (itemData[key] !== null && itemData[key] !== undefined) {
      formData.append(key, itemData[key]);
    }
  });

  const response = await axios.post(API_URL, formData, config);
  return response.data;
};

// Update a lost/found item
const updateLostFoundItem = async (id, itemData, token) => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
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

  const response = await axios.patch(`${API_URL}${id}/`, formData, config);
  return response.data;
};

// Delete a lost/found item
const deleteLostFoundItem = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.delete(`${API_URL}${id}/`, config);
  return response.data;
};

// Claim an item
const claimItem = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(`${API_URL}${id}/claim/`, {}, config);
  return response.data;
};

// Mark item as found
const markAsFound = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(`${API_URL}${id}/mark_found/`, {}, config);
  return response.data;
};

const lostFoundService = {
  getLostFoundItems,
  createLostFoundItem,
  updateLostFoundItem,
  deleteLostFoundItem,
  claimItem,
  markAsFound,
};

export default lostFoundService;