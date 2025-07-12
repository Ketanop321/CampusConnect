import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
    // In a real app, you would upload images to a storage service
    // and get back URLs to save in your database
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      id: URL.createObjectURL(file),
      image: URL.createObjectURL(file),
      is_primary: false
    }));
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
  };

  const removeImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (isEdit) {
        await updateRoommatePost(id, formData);
      } else {
        await createRoommatePost(formData);
      }
      navigate('/roommate');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
      console.error('Error saving post:', err);
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
            : 'Fill out the form below to create a new roommate listing.'}
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
                <div key={image.id} className="relative group">
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200">
                    <img
                      src={image.image}
                      alt={`Room ${index + 1}`}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setPrimaryImage(index)}
                        className="p-1.5 bg-white rounded-full text-indigo-600 hover:bg-indigo-50"
                        title="Set as primary"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="p-1.5 bg-white rounded-full text-red-600 hover:bg-red-50"
                        title="Remove image"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {image.is_primary && (
                    <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs font-medium px-1.5 py-0.5 rounded">
                      Primary
                    </div>
                  )}
                </div>
              ))}
              
              <div className="flex items-center justify-center">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-2 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                    <p className="text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 5MB)</p>
                  </div>
                  <input 
                    id="dropzone-file" 
                    type="file" 
                    className="hidden" 
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>
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
