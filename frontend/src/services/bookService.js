import api from './api';

const BOOKS_API = '/api/bookbank/books/';
const BOOK_REQUESTS_API = '/api/bookbank/requests/';

// Book API functions
export const getBooks = async (params = {}) => {
  const response = await api.get(BOOKS_API, { params });
  return response.data;
};

export const getBook = async (id) => {
  const response = await api.get(`${BOOKS_API}${id}/`);
  return response.data;
};

export const createBook = async (formData) => {
  // Log the form data entries for debugging
  console.log('Creating book with form data:');
  for (let [key, value] of formData.entries()) {
    console.log(`${key}:`, value);
  }
  
  const response = await api.post(BOOKS_API, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateBook = async (id, bookData) => {
  const formData = new FormData();
  
  // Append all fields to formData
  Object.entries(bookData).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, value);
    }
  });
  
  const response = await api.patch(`${BOOKS_API}${id}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteBook = async (id) => {
  return await api.delete(`${BOOKS_API}${id}/`);
};

export const requestBook = async (bookId, message) => {
  const response = await api.post(BOOK_REQUESTS_API, { 
    book: bookId, 
    message 
  });
  return response.data;
};

export const getMyBookRequests = async () => {
  const response = await api.get(`${BOOK_REQUESTS_API}/my/`);
  return response.data;
};

export const updateBookRequestStatus = async (requestId, status) => {
  const response = await api.patch(`${BOOK_REQUESTS_API}/${requestId}/`, { 
    status 
  });
  return response.data;
};

export const getBookRequestsForMyBooks = async () => {
  const response = await api.get(`${BOOK_REQUESTS_API}/for-my-books/`);
  return response.data;
};
