import axios from 'axios';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api/lostfound/items/`;

// Get all lost and found items
const getLostFoundItems = async () => {
  const response = await axios.get(API_URL);
  return response.data;
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

  const formData = new FormData();
  Object.keys(itemData).forEach((key) => {
    if (itemData[key] !== null && itemData[key] !== undefined) {
      formData.append(key, itemData[key]);
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
