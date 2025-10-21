import api from './api';

const API_URL = '/api/noticeboard/events/'; // Include trailing slash for Django compatibility

export const getEvents = async (params = {}) => {
  try {
    const response = await api.get(API_URL, { params });
    if (!response.data) return [];
    if (Array.isArray(response.data)) return response.data;
    if (response.data.results && Array.isArray(response.data.results)) return response.data.results;
    if (response.data.id) return [response.data];
    return [];
  } catch (error) {
    // Surface errors to callers; they handle user feedback
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

// =====================
// Admin Noticeboard APIs
// =====================

const ADMIN_API_BASE = '/api/noticeboard/admin';

export const adminGetEvents = async (params = {}) => {
  const response = await api.get(`${ADMIN_API_BASE}/events/`, { params });
  const data = response.data;
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  if (data && data.id) return [data];
  return [];
};

export const adminGetEvent = async (id) => {
  const cleanId = id.toString().replace(/^\/+|\/+$/g, '');
  const response = await api.get(`${ADMIN_API_BASE}/events/${cleanId}/`);
  return response.data;
};

export const adminCreateEvent = async (data) => {
  // Admin serializer expects JSON fields; images are managed via separate model
  const response = await api.post(`${ADMIN_API_BASE}/events/`, data);
  return response.data;
};

export const adminUpdateEvent = async (id, data) => {
  const cleanId = id.toString().replace(/^\/+|\/+$/g, '');
  const response = await api.patch(`${ADMIN_API_BASE}/events/${cleanId}/`, data);
  return response.data;
};

export const adminDeleteEvent = async (id) => {
  const cleanId = id.toString().replace(/^\/+|\/+$/g, '');
  const response = await api.delete(`${ADMIN_API_BASE}/events/${cleanId}/`);
  return response.data;
};

export const adminApproveEvent = async (id) => {
  const cleanId = id.toString().replace(/^\/+|\/+$/g, '');
  const response = await api.post(`${ADMIN_API_BASE}/events/${cleanId}/approve/`);
  return response.data;
};

export const adminRejectEvent = async (id) => {
  const cleanId = id.toString().replace(/^\/+|\/+$/g, '');
  const response = await api.post(`${ADMIN_API_BASE}/events/${cleanId}/reject/`);
  return response.data;
};

export const adminGetEventRegistrations = async (eventId) => {
  const response = await api.get(`${ADMIN_API_BASE}/registrations/`, { params: { event: eventId } });
  return response.data;
};

export const adminUpdateRegistrationStatus = async (registrationId, status) => {
  const cleanId = registrationId.toString().replace(/^\/+|\/+$/g, '');
  if (status === 'confirmed') {
    const response = await api.post(`${ADMIN_API_BASE}/registrations/${cleanId}/mark_attended/`);
    return response.data;
  }
  // Treat any non-confirmed as not attended; store status in notes for audit
  const response = await api.patch(`${ADMIN_API_BASE}/registrations/${cleanId}/`, {
    attended: false,
    notes: status,
  });
  return response.data;
};

export const adminGetEventStatistics = async (eventId) => {
  const cleanId = eventId.toString().replace(/^\/+|\/+$/g, '');
  const response = await api.get(`${ADMIN_API_BASE}/events/${cleanId}/statistics/`);
  return response.data;
};
