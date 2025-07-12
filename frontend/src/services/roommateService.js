import axios from 'axios';

const API_URL = '/api/roommate';

export const getRoommatePosts = async (params = {}) => {
  const response = await axios.get(API_URL, { params });
  return response.data;
};

export const getRoommatePost = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const createRoommatePost = async (postData) => {
  const response = await axios.post(API_URL, postData);
  return response.data;
};

export const updateRoommatePost = async (id, postData) => {
  const response = await axios.put(`${API_URL}/${id}`, postData);
  return response.data;
};

export const deleteRoommatePost = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
