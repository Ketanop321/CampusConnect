import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  adminGetEvent, 
  adminCreateEvent, 
  adminUpdateEvent,
  adminApproveEvent,
  adminRejectEvent
} from '../../services/noticeboardService';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

const AdminEventForm = ({ isEdit = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Form state
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
    is_approved: false,
    organizer: user?.id || '',
  });

  // Fetch event data if in edit mode
  useEffect(() => {
    if (!isEdit) return;

    const fetchEvent = async () => {
      try {
        setLoading(true);
        const event = await adminGetEvent(id);
        
        // Format dates for datetime-local input
        const formatDateForInput = (dateString) => {
          if (!dateString) return '';
          const date = new Date(dateString);
          return date.toISOString().slice(0, 16);
        };

        setFormData({
          ...event,
          start_datetime: formatDateForInput(event.start_datetime),
          end_datetime: formatDateForInput(event.end_datetime),
          registration_deadline: formatDateForInput(event.registration_deadline),
          price: event.price || '0.00',
        });
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event data. Please try again.');
        toast.error('Failed to load event data');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNumberInput = (e) => {
    const { name, value } = e.target;
    // Only allow numbers and decimal points
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Prepare data for submission
      const submissionData = {
        ...formData,
        max_participants: formData.max_participants ? parseInt(formData.max_participants, 10) : null,
        price: formData.is_free ? '0.00' : parseFloat(formData.price).toFixed(2),
        registration_deadline: formData.registration_required ? formData.registration_deadline : null,
        meeting_link: formData.is_online ? formData.meeting_link : '',
      };

      if (isEdit) {
        await adminUpdateEvent(id, submissionData);
        toast.success('Event updated successfully');
      } else {
        await adminCreateEvent(submissionData);
        toast.success('Event created successfully');
      }
      
      // Redirect to event list or previous page
      const from = location.state?.from || '/admin/events';
      navigate(from);
    } catch (err) {
      console.error('Error saving event:', err);
      const errorMessage = err.response?.data?.message || 'Failed to save event. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async () => {
    if (!window.confirm('Are you sure you want to approve this event?')) return;
    
    try {
      await adminApproveEvent(id);
      setFormData(prev => ({ ...prev, is_approved: true }));
      toast.success('Event approved successfully');
    } catch (err) {
      console.error('Error approving event:', err);
      toast.error('Failed to approve event');
    }
  };

  const handleReject = async () => {
    if (!window.confirm('Are you sure you want to reject this event?')) return;
    
    try {
      await adminRejectEvent(id);
      setFormData(prev => ({ ...prev, is_approved: false }));
      toast.success('Event rejected');
    } catch (err) {
      console.error('Error rejecting event:', err);
      toast.error('Failed to reject event');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Event' : 'Create New Event'}
        </h2>
        {isEdit && (
          <div className="flex space-x-2">
            {!formData.is_approved && (
              <Button 
                variant="success" 
                onClick={handleApprove}
                disabled={submitting}
              >
                Approve Event
              </Button>
            )}
            <Button 
              variant="danger" 
              onClick={handleReject}
              disabled={submitting}
            >
              {formData.is_approved ? 'Unpublish' : 'Reject'}
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Event Information
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {isEdit ? 'Update the event details below.' : 'Fill in the details for your new event.'}
            </p>
          </div>
          
          <div className="px-4 py-5 sm:p-6 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter event title"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Provide a detailed description of the event"
              />
            </div>

            {/* Event Type */}
            <div>
              <label htmlFor="event_type" className="block text-sm font-medium text-gray-700">
                Event Type <span className="text-red-500">*</span>
              </label>
              <select
                id="event_type"
                name="event_type"
                required
                value={formData.event_type}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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

            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="start_datetime" className="block text-sm font-medium text-gray-700">
                  Start Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="start_datetime"
                  id="start_datetime"
                  required
                  value={formData.start_datetime}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="end_datetime" className="block text-sm font-medium text-gray-700">
                  End Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="end_datetime"
                  id="end_datetime"
                  required
                  value={formData.end_datetime}
                  onChange={handleChange}
                  min={formData.start_datetime}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="is_online"
                  name="is_online"
                  type="checkbox"
                  checked={formData.is_online}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="is_online" className="ml-2 block text-sm text-gray-700">
                  This is an online event
                </label>
              </div>

              {formData.is_online ? (
                <div>
                  <label htmlFor="meeting_link" className="block text-sm font-medium text-gray-700">
                    Meeting Link <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    name="meeting_link"
                    id="meeting_link"
                    required={formData.is_online}
                    value={formData.meeting_link}
                    onChange={handleChange}
                    placeholder="https://meet.google.com/xyz-abc-def"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              ) : (
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    id="location"
                    required={!formData.is_online}
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter event location"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              )}

              <div>
                <label htmlFor="location_url" className="block text-sm font-medium text-gray-700">
                  Location URL (Optional)
                </label>
                <input
                  type="url"
                  name="location_url"
                  id="location_url"
                  value={formData.location_url}
                  onChange={handleChange}
                  placeholder="https://maps.google.com/..."
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Registration */}
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="registration_required"
                  name="registration_required"
                  type="checkbox"
                  checked={formData.registration_required}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="registration_required" className="ml-2 block text-sm text-gray-700">
                  Registration required
                </label>
              </div>

              {formData.registration_required && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="max_participants" className="block text-sm font-medium text-gray-700">
                      Maximum Participants
                    </label>
                    <input
                      type="text"
                      name="max_participants"
                      id="max_participants"
                      value={formData.max_participants}
                      onChange={handleNumberInput}
                      placeholder="Leave empty for unlimited"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="registration_deadline" className="block text-sm font-medium text-gray-700">
                      Registration Deadline
                    </label>
                    <input
                      type="datetime-local"
                      name="registration_deadline"
                      id="registration_deadline"
                      value={formData.registration_deadline}
                      onChange={handleChange}
                      min={new Date().toISOString().slice(0, 16)}
                      max={formData.start_datetime}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="is_free"
                  name="is_free"
                  type="checkbox"
                  checked={formData.is_free}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="is_free" className="ml-2 block text-sm text-gray-700">
                  This is a free event
                </label>
              </div>

              {!formData.is_free && (
                <div className="w-1/3">
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="text"
                      name="price"
                      id="price"
                      required
                      value={formData.price}
                      onChange={handleNumberInput}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={submitting}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    {isEdit ? 'Updating...' : 'Creating...'}
                  </>
                ) : isEdit ? (
                  'Update Event'
                ) : (
                  'Create Event'
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminEventForm;
