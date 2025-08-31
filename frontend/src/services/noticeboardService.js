import api from './api';

const API_URL = '/api/noticeboard/events/'; // Include trailing slash for Django compatibility

export const getEvents = async (params = {}) => {
  try {
    console.log('Fetching events from:', API_URL);
    console.log('With params:', params);
    
    const response = await api.get(API_URL, { 
      params
    });
    
    console.log('API Response status:', response.status);
    console.log('Full response:', response);
    
    // If no data in response, return empty array
    if (!response.data) {
      console.error('No data in response');
      return [];
    }
    
    // Log the response structure for debugging
    console.log('Response data type:', typeof response.data);
    
    // Handle different response formats
    let events = [];
    
    // Case 1: Direct array of events
    if (Array.isArray(response.data)) {
      events = response.data;
    }
    // Case 2: Object with results array (Django REST Framework pagination)
    else if (response.data.results && Array.isArray(response.data.results)) {
      events = response.data.results;
    }
    // Case 3: Single event object (shouldn't happen, but handle it)
    else if (response.data.id) {
      events = [response.data];
    }
    
    console.log(`Returning ${events.length} events`);
    return events;
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
  
  // Use FormData for file uploads
  const formData = new FormData();
  Object.keys(eventData).forEach(key => {
    if (eventData[key] !== null && eventData[key] !== undefined) {
      formData.append(key, eventData[key]);
    }
  });
  
  const response = await api.patch(`${API_URL}${cleanId}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
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
