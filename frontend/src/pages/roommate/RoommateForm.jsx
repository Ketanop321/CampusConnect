import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import { 
  createRoommatePost, 
  updateRoommatePost, 
  getRoommatePost 
} from '../../services/roommateService';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const RoommateForm = ({ isEdit = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    rent: '',
    available_from: '',
    lease_duration: 12,
    room_type: 'private',
    preferred_gender: 'A',
    current_occupants: 1,
    total_occupants: 2,
    has_furniture: false,
    has_parking: false,
    has_laundry: false,
    has_kitchen: true,
    has_wifi: true,
    is_pets_allowed: false,
    is_smoking_allowed: false,
    occupation: 'student',
    university: '',
    contact_number: '',
    contact_email: user?.email || '',
    images: []
  });

  useEffect(() => {
    if (isEdit && id) {
      const fetchPost = async () => {
        try {
          const data = await getRoommatePost(id);
          // Format dates for date input
          const formattedData = {
            ...data,
            available_from: data.available_from.split('T')[0], // Format as YYYY-MM-DD
            images: data.images || []
          };
          setFormData(formattedData);
        } catch (err) {
          setError('Failed to load post. Please try again.');
          console.error('Error fetching post:', err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchPost();
    } else {
      setLoading(false);
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? '' : Number(value)
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Create preview URLs for the new files
    const newImages = files.map(file => {
      const previewUrl = URL.createObjectURL(file);
      return {
        file, // Store the actual file object
        preview: previewUrl,
        is_primary: false,
        isNew: true // Flag to identify new uploads
      };
    });
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
  };

  const removeImage = (index) => {
    const newImages = [...formData.images];
    const removedImage = newImages.splice(index, 1)[0];
    
    // Revoke the object URL to prevent memory leaks
    if (removedImage.preview) {
      URL.revokeObjectURL(removedImage.preview);
    }
    
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const setPrimaryImage = (index) => {
    const newImages = formData.images.map((img, i) => ({
      ...img,
      is_primary: i === index
    }));
    
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };
  
  // Clean up object URLs when the component unmounts
  useEffect(() => {
    return () => {
      formData.images.forEach(image => {
        if (image.preview) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Prepare form data for submission
      const formDataToSend = new FormData();
      
      // Create a new object with the correct field names for the backend
      const backendFormData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        rent: formData.rent,
        available_from: formData.available_from,
        lease_duration: formData.lease_duration,
        room_type: formData.room_type,
        preferred_gender: formData.preferred_gender, // Ensure this matches the backend model
        current_occupants: formData.current_occupants,
        total_occupants: formData.total_occupants,
        has_furniture: formData.has_furniture,
        has_parking: formData.has_parking,
        has_laundry: formData.has_laundry,
        has_kitchen: formData.has_kitchen,
        has_wifi: formData.has_wifi,
        is_pets_allowed: formData.is_pets_allowed,
        is_smoking_allowed: formData.is_smoking_allowed,
        occupation: formData.occupation,
        university: formData.university,
        contact_number: formData.contact_number,
        contact_email: formData.contact_email,
      };

      // Add all fields to FormData
      Object.entries(backendFormData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formDataToSend.append(key, value);
        }
      });

      // Handle images - for now, just send the first new image
      // TODO: Implement multiple image upload support
      if (formData.images && formData.images.length > 0) {
        const newImage = formData.images.find(img => img.isNew && img.file);
        if (newImage) {
          formDataToSend.append('image', newImage.file);
        }
      }

      // Add CSRF token if needed (Django expects it in the headers or as a cookie)
      const csrfToken = document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1];
      if (csrfToken) {
        formDataToSend.append('csrfmiddlewaretoken', csrfToken);
      }

      // Make the API call
      if (isEdit) {
        await updateRoommatePost(id, formDataToSend);
      } else {
        await createRoommatePost(formDataToSend);
      }
      
      // Show success message and redirect
      // You can use a toast notification here if you have one
      navigate('/roommate');
      
    } catch (err) {
      console.error('Error saving post:', err);
      
      // Handle validation errors
      if (err.response?.data) {
        if (typeof err.response.data === 'object') {
          // Format Django REST framework validation errors
          const errorMessages = [];
          for (const [field, errors] of Object.entries(err.response.data)) {
            if (Array.isArray(errors)) {
              errorMessages.push(`${field}: ${errors.join(', ')}`);
            } else {
              errorMessages.push(`${field}: ${errors}`);
            }
          }
          setError(errorMessages.join('\n'));
        } else {
          setError(err.response.data.message || 'An error occurred. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Roommate Post' : 'Create a New Roommate Post'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {isEdit 
            ? 'Update your roommate listing with the latest details.' 
            : 'Fill out the form below to create a new roommate listing.'
          }
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200">
        {/* Basic Information */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">Basic Information</h3>
            <p className="mt-1 text-sm text-gray-500">
              Provide some basic information about your place.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title *
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="title"
                  id="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g., Cozy room in downtown with great amenities"
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  required
                  value={formData.description}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Tell potential roommates about the place, neighborhood, and what you're looking for..."
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Full Address *
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="location"
                  id="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g., 123 Main St, Anytown, ST 12345"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="rent" className="block text-sm font-medium text-gray-700">
                Rent per month ($) *
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="rent"
                  id="rent"
                  min="0"
                  step="1"
                  required
                  value={formData.rent}
                  onChange={handleNumberChange}
                  className="block w-full pl-7 pr-12 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="room_type" className="block text-sm font-medium text-gray-700">
                Room Type *
              </label>
              <select
                id="room_type"
                name="room_type"
                required
                value={formData.room_type}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              >
                <option value="private">Private Room</option>
                <option value="shared">Shared Room</option>
                <option value="apartment">Entire Apartment</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="available_from" className="block text-sm font-medium text-gray-700">
                Available From *
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  name="available_from"
                  id="available_from"
                  required
                  value={formData.available_from}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="lease_duration" className="block text-sm font-medium text-gray-700">
                Lease Duration (months) *
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="lease_duration"
                  id="lease_duration"
                  min="1"
                  required
                  value={formData.lease_duration}
                  onChange={handleNumberChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Roommate Preferences */}
        <div className="pt-8">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">Roommate Preferences</h3>
            <p className="mt-1 text-sm text-gray-500">
              Let potential roommates know what you're looking for.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="preferred_gender" className="block text-sm font-medium text-gray-700">
                Preferred Gender
              </label>
              <select
                id="preferred_gender"
                name="preferred_gender"
                value={formData.preferred_gender}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              >
                <option value="A">No Preference</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="occupation" className="block text-sm font-medium text-gray-700">
                Your Occupation
              </label>
              <select
                id="occupation"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              >
                <option value="student">Student</option>
                <option value="working">Working Professional</option>
                <option value="other">Other</option>
              </select>
            </div>

            {formData.occupation === 'student' && (
              <div className="sm:col-span-6">
                <label htmlFor="university" className="block text-sm font-medium text-gray-700">
                  University/College
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="university"
                    id="university"
                    value={formData.university}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="e.g., University of Example"
                  />
                </div>
              </div>
            )}

            <div className="sm:col-span-3">
              <label htmlFor="current_occupants" className="block text-sm font-medium text-gray-700">
                Current Number of Occupants
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="current_occupants"
                  id="current_occupants"
                  min="1"
                  required
                  value={formData.current_occupants}
                  onChange={handleNumberChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="total_occupants" className="block text-sm font-medium text-gray-700">
                Total Number of Occupants
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="total_occupants"
                  id="total_occupants"
                  min={formData.current_occupants || 1}
                  required
                  value={formData.total_occupants}
                  onChange={handleNumberChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="pt-8">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">Amenities</h3>
            <p className="mt-1 text-sm text-gray-500">
              Select the amenities available in your place.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-y-4 sm:grid-cols-2">
            <div className="relative flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="has_furniture"
                  name="has_furniture"
                  type="checkbox"
                  checked={formData.has_furniture}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="has_furniture" className="font-medium text-gray-700">
                  Furnished
                </label>
                <p className="text-gray-500">Room comes with furniture</p>
              </div>
            </div>

            <div className="relative flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="has_parking"
                  name="has_parking"
                  type="checkbox"
                  checked={formData.has_parking}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="has_parking" className="font-medium text-gray-700">
                  Parking Available
                </label>
                <p className="text-gray-500">Dedicated parking spot</p>
              </div>
            </div>

            <div className="relative flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="has_laundry"
                  name="has_laundry"
                  type="checkbox"
                  checked={formData.has_laundry}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="has_laundry" className="font-medium text-gray-700">
                  In-Unit Laundry
                </label>
                <p className="text-gray-500">Washer and dryer in the unit</p>
              </div>
            </div>

            <div className="relative flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="has_kitchen"
                  name="has_kitchen"
                  type="checkbox"
                  checked={formData.has_kitchen}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="has_kitchen" className="font-medium text-gray-700">
                  Kitchen Access
                </label>
                <p className="text-gray-500">Shared or private kitchen</p>
              </div>
            </div>

            <div className="relative flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="has_wifi"
                  name="has_wifi"
                  type="checkbox"
                  checked={formData.has_wifi}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="has_wifi" className="font-medium text-gray-700">
                  WiFi Included
                </label>
                <p className="text-gray-500">High-speed internet access</p>
              </div>
            </div>

            <div className="relative flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="is_pets_allowed"
                  name="is_pets_allowed"
                  type="checkbox"
                  checked={formData.is_pets_allowed}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="is_pets_allowed" className="font-medium text-gray-700">
                  Pets Allowed
                </label>
                <p className="text-gray-500">Pets are welcome</p>
              </div>
            </div>

            <div className="relative flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="is_smoking_allowed"
                  name="is_smoking_allowed"
                  type="checkbox"
                  checked={formData.is_smoking_allowed}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="is_smoking_allowed" className="font-medium text-gray-700">
                  Smoking Allowed
                </label>
                <p className="text-gray-500">Smoking permitted in designated areas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Photos */}
        <div className="pt-8">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">Photos</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add photos of your place. The first photo will be the cover image.
            </p>
          </div>

          <div className="mt-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {formData.images.map((image, index) => (
                <div key={index} className="relative group h-32">
                  <img
                    src={image.preview || (image.image ? `${image.image}` : '')}
                    alt={`Preview ${index + 1}`}
                    className="h-full w-full object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                      className="text-white hover:text-red-400 p-2"
                      aria-label="Remove image"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPrimaryImage(index);
                      }}
                      className={`p-2 ${image.is_primary ? 'text-yellow-400' : 'text-white'}`}
                      aria-label={image.is_primary ? 'Primary image' : 'Set as primary'}
                    >
                      <svg className="h-5 w-5" fill={image.is_primary ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                  </div>
                  {image.is_primary && (
                    <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full">
                      Primary
                    </div>
                  )}
                </div>
              ))}
              {formData.images.length < 10 && (
                <label className="flex items-center justify-center h-32 w-full border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 transition-colors">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                  />
                  <div className="text-center p-4">
                    <PlusIcon className="mx-auto h-8 w-8 text-gray-400" />
                    <span className="mt-1 block text-sm text-gray-600">
                      {formData.images.length === 0 ? 'Add photos (up to 10)' : 'Add more photos'}
                    </span>
                    {formData.images.length > 0 && (
                      <span className="text-xs text-gray-500">{formData.images.length}/10 photos</span>
                    )}
                  </div>
                </label>
              )}
            </div>
            {formData.images.length === 0 && (
              <p className="mt-2 text-sm text-gray-500">
                Add at least one photo to help others see your place. The first image will be used as the main photo.
              </p>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="pt-8">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">Contact Information</h3>
            <p className="mt-1 text-sm text-gray-500">
              How should potential roommates contact you?
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  name="contact_email"
                  id="contact_email"
                  required
                  value={formData.contact_email}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="contact_number" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1">
                <input
                  type="tel"
                  name="contact_number"
                  id="contact_number"
                  value={formData.contact_number}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="(123) 456-7890"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-5">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/roommate')}
              className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEdit ? 'Updating...' : 'Creating...'}
                </>
              ) : isEdit ? 'Update Post' : 'Create Post'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RoommateForm;
