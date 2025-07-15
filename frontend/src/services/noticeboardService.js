import api from './api';

const API_URL = '/api/noticeboard/events/'; // Include trailing slash for Django compatibility

export const getEvents = async (params = {}) => {
  try {
    console.log('Fetching events from:', API_URL);
    console.log('With params:', params);
    
    const response = await api.get(API_URL, { params });
    console.log('API Response status:', response.status);
    
    // The response data should be an array of events
    if (!response.data) {
      console.error('No data in response');
      return [];
    }
    
    // Log the response structure for debugging
    console.log('Response data type:', typeof response.data);
    console.log('Response data keys:', Object.keys(response.data));
    
    // If the response is an array, return it directly
    if (Array.isArray(response.data)) {
      console.log('Returning events array with', response.data.length, 'events');
      return response.data;
    }
    
    // If the response is an object with a results array (Django REST Framework default)
    if (response.data.results && Array.isArray(response.data.results)) {
      console.log('Returning events from results array with', response.data.results.length, 'events');
      return response.data.results;
    }
    
    // If we get here, log the unexpected format and return an empty array
    console.warn('Unexpected API response format. Response data:', response.data);
    return [];
  } catch (error) {
    console.error('Error in getEvents:', error);
    throw error;
  }
};

export const getEvent = async (id) => {
  // Remove any leading/trailing slashes from the ID to prevent double slashes
  const cleanId = id.replace(/^\/+|\/+$/g, '');
  const response = await api.get(`${API_URL}${cleanId}/`);
  return response.data;
};

export const createEvent = async (eventData) => {
  // Handle file uploads if needed
  const formData = new FormData();
  Object.keys(eventData).forEach(key => {
    if (eventData[key] !== null && eventData[key] !== undefined) {
      formData.append(key, eventData[key]);
    }
  });
  
  const response = await api.post(API_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateEvent = async (id, eventData) => {
  const cleanId = id.replace(/^\/+|\/+$/g, '');
  const response = await api.put(`${API_URL}${cleanId}/`, eventData);
  return response.data;
};

export const deleteEvent = async (id) => {
  const cleanId = id.replace(/^\/+|\/+$/g, '');
  const response = await api.delete(`${API_URL}${cleanId}/`);
  return response.data;
};

export const registerForEvent = async (eventId) => {
  const cleanId = eventId.replace(/^\/+|\/+$/g, '');
  const response = await api.post(`${API_URL}${cleanId}/register/`);
  return response.data;
};

export const getEventComments = async (eventId) => {
  try {
    const cleanId = eventId.replace(/^\/+|\/+$/g, '');
    const response = await api.get(`${API_URL}${cleanId}/comments/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
    // Return empty array if comments endpoint doesn't exist or fails
    return [];
  }
};

export const addEventComment = async (eventId, commentData) => {
  const cleanId = eventId.replace(/^\/+|\/+$/g, '');
  const response = await api.post(`${API_URL}${cleanId}/comments/`, commentData);
  return response.data;
};
