import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  createEvent, 
  updateEvent, 
  getEvent 
} from '../../services/noticeboardService';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

const EventForm = ({ isEdit = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'other',
    start_datetime: '',
    end_datetime: '',
    location: '',
    location_url: '',
    is_online: false,
    meeting_link: '',
    max_participants: '',
    is_free: true,
    price: '0.00',
    registration_required: false,
    registration_deadline: '',
    images: []
  });

  // Separate state for image files
  const [imageFiles, setImageFiles] = useState([]);

  useEffect(() => {
    if (isEdit && id) {
      const fetchEvent = async () => {
        try {
          setLoading(true);
          const data = await getEvent(id);
          // Format dates for datetime-local input
          const formattedData = {
            ...data,
            start_datetime: data.start_datetime.replace('Z', '').slice(0, 16),
            end_datetime: data.end_datetime.replace('Z', '').slice(0, 16),
            registration_deadline: data.registration_deadline 
              ? data.registration_deadline.replace('Z', '').slice(0, 16)
              : '',
            images: data.images || []
          };
          setFormData(formattedData);
        } catch (err) {
          setError('Failed to load event. Please try again.');
          console.error('Error fetching event:', err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchEvent();
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
    
    // Store the actual file objects
    setImageFiles(prev => [...prev, ...files]);
    
    // Create preview URLs for display
    const newImages = files.map((file, index) => ({
      id: URL.createObjectURL(file),
      image: URL.createObjectURL(file),
      is_primary: imageFiles.length === 0 && index === 0, // First image is primary
      file: file // Keep reference to the file
    }));
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
  };

  const removeImage = (index) => {
    const newImages = [...formData.images];
    const removedImage = newImages.splice(index, 1)[0];
    
    // Also remove from imageFiles if it's a new file
    if (removedImage.file) {
      const fileIndex = imageFiles.findIndex(file => file === removedImage.file);
      if (fileIndex !== -1) {
        const newFiles = [...imageFiles];
        newFiles.splice(fileIndex, 1);
        setImageFiles(newFiles);
      }
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

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Event title is required');
      return false;
    }
    
    if (!formData.start_datetime) {
      setError('Start date and time are required');
      return false;
    }
    
    if (!formData.end_datetime) {
      setError('End date and time are required');
      return false;
    }
    
    if (new Date(formData.end_datetime) <= new Date(formData.start_datetime)) {
      setError('End date must be after start date');
      return false;
    }
    
    if (formData.registration_required && formData.registration_deadline) {
      if (new Date(formData.registration_deadline) > new Date(formData.start_datetime)) {
        setError('Registration deadline must be before the event starts');
        return false;
      }
    }
    
    if (formData.is_online && !formData.meeting_link) {
      setError('Meeting link is required for online events');
      return false;
    }
    
    if (!formData.is_online && !formData.location) {
      setError('Location is required for in-person events');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Prepare the data for submission
      const submissionData = {
        ...formData,
        // Convert empty strings to null for optional fields
        max_participants: formData.max_participants || null,
        price: formData.is_free ? 0 : parseFloat(formData.price),
        registration_deadline: formData.registration_required 
          ? formData.registration_deadline 
          : null
      };

      // Remove the images array from submissionData as we'll handle files separately
      delete submissionData.images;

      // Add the primary image file if available
      if (imageFiles.length > 0) {
        const primaryImageIndex = formData.images.findIndex(img => img.is_primary);
        const primaryFile = primaryImageIndex >= 0 && formData.images[primaryImageIndex].file 
          ? formData.images[primaryImageIndex].file 
          : imageFiles[0];
        submissionData.image = primaryFile;
      }
      
      if (isEdit) {
        await updateEvent(id, submissionData);
        toast.success('Event updated successfully!');
      } else {
        await createEvent(submissionData);
        toast.success('Event created successfully! It will appear on the noticeboard once approved.');
      }
      
      navigate('/noticeboard');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
      console.error('Error saving event:', err);
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
          {isEdit ? 'Edit Event' : 'Create New Event'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {isEdit 
            ? 'Update your event details below.' 
            : 'Fill out the form below to create a new event listing.'}
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
              Provide some basic information about your event.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Event Title *
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
                  placeholder="e.g., Annual Tech Conference 2023"
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
                  placeholder="Tell people what your event is about..."
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="event_type" className="block text-sm font-medium text-gray-700">
                Event Type *
              </label>
              <select
                id="event_type"
                name="event_type"
                required
                value={formData.event_type}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              >
                <option value="workshop">Workshop</option>
                <option value="seminar">Seminar</option>
                <option value="conference">Conference</option>
                <option value="social">Social Gathering</option>
                <option value="sports">Sports Event</option>
                <option value="cultural">Cultural Event</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Format
              </label>
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <input
                    id="event-format-in-person"
                    name="is_online"
                    type="radio"
                    checked={!formData.is_online}
                    onChange={() => setFormData(prev => ({ ...prev, is_online: false }))}
                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="event-format-in-person" className="ml-2 block text-sm text-gray-700">
                    In-Person
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="event-format-online"
                    name="is_online"
                    type="radio"
                    checked={formData.is_online}
                    onChange={() => setFormData(prev => ({ ...prev, is_online: true }))}
                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="event-format-online" className="ml-2 block text-sm text-gray-700">
                    Online
                  </label>
                </div>
              </div>
            </div>

            {formData.is_online ? (
              <div className="sm:col-span-6">
                <label htmlFor="meeting_link" className="block text-sm font-medium text-gray-700">
                  Meeting Link *
                </label>
                <div className="mt-1">
                  <input
                    type="url"
                    name="meeting_link"
                    id="meeting_link"
                    required={formData.is_online}
                    value={formData.meeting_link}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="https://meet.example.com/your-event"
                  />
                </div>
              </div>
            ) : (
              <div className="sm:col-span-6">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Venue *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="location"
                    id="location"
                    required={!formData.is_online}
                    value={formData.location}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="e.g., Main Auditorium, University Campus"
                  />
                </div>
              </div>
            )}

            {!formData.is_online && (
              <div className="sm:col-span-6">
                <label htmlFor="location_url" className="block text-sm font-medium text-gray-700">
                  Location URL (Optional)
                </label>
                <div className="mt-1">
                  <input
                    type="url"
                    name="location_url"
                    id="location_url"
                    value={formData.location_url}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="https://maps.google.com/..."
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  A link to Google Maps or similar service for directions
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Date & Time */}
        <div className="pt-8">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">Date & Time</h3>
            <p className="mt-1 text-sm text-gray-500">
              When is your event taking place?
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="start_datetime" className="block text-sm font-medium text-gray-700">
                Start Date & Time *
              </label>
              <div className="mt-1">
                <input
                  type="datetime-local"
                  name="start_datetime"
                  id="start_datetime"
                  required
                  value={formData.start_datetime}
                  onChange={handleChange}
                  min={new Date().toISOString().slice(0, 16)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="end_datetime" className="block text-sm font-medium text-gray-700">
                End Date & Time *
              </label>
              <div className="mt-1">
                <input
                  type="datetime-local"
                  name="end_datetime"
                  id="end_datetime"
                  required
                  value={formData.end_datetime}
                  onChange={handleChange}
                  min={formData.start_datetime || new Date().toISOString().slice(0, 16)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Registration & Pricing */}
        <div className="pt-8">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">Registration & Pricing</h3>
            <p className="mt-1 text-sm text-gray-500">
              Set up registration requirements and pricing for your event.
            </p>
          </div>

          <div className="mt-6 space-y-6">
            <div className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="registration_required"
                  name="registration_required"
                  type="checkbox"
                  checked={formData.registration_required}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="registration_required" className="font-medium text-gray-700">
                  Require Registration
                </label>
                <p className="text-gray-500">
                  Attendees must register to attend this event
                </p>
              </div>
            </div>

            {formData.registration_required && (
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="registration_deadline" className="block text-sm font-medium text-gray-700">
                    Registration Deadline
                  </label>
                  <div className="mt-1">
                    <input
                      type="datetime-local"
                      name="registration_deadline"
                      id="registration_deadline"
                      value={formData.registration_deadline}
                      onChange={handleChange}
                      max={formData.start_datetime}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Leave empty to allow registration until event starts
                  </p>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="max_participants" className="block text-sm font-medium text-gray-700">
                    Maximum Participants (Optional)
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="max_participants"
                      id="max_participants"
                      min="1"
                      value={formData.max_participants}
                      onChange={handleNumberChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="No limit"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="is_free"
                  name="is_free"
                  type="checkbox"
                  checked={formData.is_free}
                  onChange={() => setFormData(prev => ({ 
                    ...prev, 
                    is_free: !prev.is_free,
                    price: prev.is_free ? '0.00' : prev.price
                  }))}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="is_free" className="font-medium text-gray-700">
                  This is a free event
                </label>
              </div>
            </div>

            {!formData.is_free && (
              <div className="sm:col-span-3">
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Price per ticket ($)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="price"
                    id="price"
                    min="0"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      price: parseFloat(e.target.value) >= 0 ? e.target.value : '0.00'
                    }))}
                    className="block w-full pl-7 pr-12 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Photos */}
        <div className="pt-8">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">Photos</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add photos to make your event stand out. The first photo will be the cover image.
            </p>
          </div>

          <div className="mt-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {formData.images.map((image, index) => (
                <div key={image.id} className="relative group">
                  <div className="w-full h-32 overflow-hidden rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 shadow-sm">
                    <img
                      src={image.image}
                      alt={`Event ${index + 1}`}
                      className="h-full w-full object-cover object-center transition-transform group-hover:scale-105"
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

        {/* Form Actions */}
        <div className="pt-5">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/noticeboard')}
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
              ) : isEdit ? 'Update Event' : 'Create Event'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EventForm;
