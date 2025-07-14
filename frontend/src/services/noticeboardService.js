import api from './api';

const API_URL = '/api/noticeboard/events/';

export const getEvents = async (params = {}) => {
  const response = await api.get(API_URL, { params });
  return response.data;
};

export const getEvent = async (id) => {
  const response = await api.get(`${API_URL}/${id}`);
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
  const response = await api.put(`${API_URL}/${id}/`, eventData);
  return response.data;
};

export const deleteEvent = async (id) => {
  const response = await api.delete(`${API_URL}/${id}/`);
  return response.data;
};

export const registerForEvent = async (eventId) => {
  const response = await api.post(`${API_URL}/${eventId}/register/`);
  return response.data;
};

export const getEventComments = async (eventId) => {
  const response = await api.get(`${API_URL}/${eventId}/comments/`);
  return response.data;
};

export const addEventComment = async (eventId, commentData) => {
  const response = await api.post(`${API_URL}/${eventId}/comments/`, commentData);
  return response.data;
};
