import axios from 'axios';

const API_URL = '/api/events';

export const getEvents = async (params = {}) => {
  const response = await axios.get(API_URL, { params });
  return response.data;
};

export const getEvent = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const createEvent = async (eventData) => {
  const response = await axios.post(API_URL, eventData);
  return response.data;
};

export const updateEvent = async (id, eventData) => {
  const response = await axios.put(`${API_URL}/${id}`, eventData);
  return response.data;
};

export const deleteEvent = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

export const registerForEvent = async (eventId) => {
  const response = await axios.post(`${API_URL}/${eventId}/register`);
  return response.data;
};

export const getEventComments = async (eventId) => {
  const response = await axios.get(`${API_URL}/${eventId}/comments`);
  return response.data;
};

export const addEventComment = async (eventId, commentData) => {
  const response = await axios.post(`${API_URL}/${eventId}/comments`, commentData);
  return response.data;
};
