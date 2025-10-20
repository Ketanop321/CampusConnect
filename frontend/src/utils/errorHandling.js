/**
 * Utility function to format validation errors from Django REST Framework
 * @param {Object|string} errorData - Error data from API response
 * @returns {string} - Formatted error message
 */
export const formatValidationErrors = (errorData) => {
  if (typeof errorData === 'string') {
    return errorData;
  }
  
  if (typeof errorData === 'object' && errorData !== null) {
    const errorMessages = [];
    
    // Handle non_field_errors first (general errors)
    if (errorData.non_field_errors) {
      if (Array.isArray(errorData.non_field_errors)) {
        errorMessages.push(...errorData.non_field_errors);
      }
    }
    
    // Handle field-specific errors
    Object.entries(errorData).forEach(([field, messages]) => {
      // Skip non_field_errors as we handled them above
      if (field === 'non_field_errors') return;
      
      if (Array.isArray(messages)) {
        messages.forEach(message => {
          // Format field names to be more user-friendly
          const friendlyFieldNames = {
            'image': 'Image',
            'title': 'Title',
            'author': 'Author',
            'isbn': 'ISBN',
            'edition': 'Edition',
            'price': 'Price',
            'description': 'Description',
            'department': 'Department',
            'contact_email': 'Contact Email',
            'contact_phone': 'Contact Phone',
            'condition': 'Condition',
            'email': 'Email',
            'password': 'Password',
            'password2': 'Confirm Password',
            'name': 'Name',
            'mobile': 'Mobile Number',
            'address': 'Address',
            'category': 'Category',
            'location': 'Location',
            'date_lost': 'Date Lost',
            'date_found': 'Date Found'
          };
          
          const friendlyField = friendlyFieldNames[field] || field.replace('_', ' ').toUpperCase();
          errorMessages.push(`${friendlyField}: ${message}`);
        });
      } else if (typeof messages === 'string') {
        const friendlyField = field.replace('_', ' ').toUpperCase();
        errorMessages.push(`${friendlyField}: ${messages}`);
      }
    });
    
    return errorMessages.length > 0 ? errorMessages.join('\n') : 'Validation failed';
  }
  
  return 'An error occurred';
};

/**
 * Enhanced error handler for API responses
 * @param {Error} error - The error object from the API call
 * @returns {string} - User-friendly error message
 */
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  // Handle network errors
  if (!error.response) {
    if (error.request) {
      return 'Network error. Please check your internet connection.';
    }
    return 'An unexpected error occurred.';
  }
  
  const { status, data } = error.response;
  
  // Handle different HTTP status codes
  switch (status) {
    case 400:
      // Bad request - validation errors
      return formatValidationErrors(data);
    
    case 401:
      return 'Authentication required. Please log in.';
    
    case 403:
      return 'You do not have permission to perform this action.';
    
    case 404:
      return 'The requested resource was not found.';
    
    case 409:
      return 'This operation conflicts with existing data. Please check for duplicates.';
    
    case 413:
      return 'File is too large. Please upload a smaller file.';
    
    case 415:
      return 'File format not supported. Please upload a valid file.';
    
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    
    case 500:
      return 'Server error. Please try again later.';
    
    case 502:
    case 503:
    case 504:
      return 'Service temporarily unavailable. Please try again later.';
    
    default:
      // Fallback to formatted validation errors or generic message
      return data ? formatValidationErrors(data) : `Error ${status}: Something went wrong.`;
  }
};
