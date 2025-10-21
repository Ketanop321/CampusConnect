import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  adminGetEvent, 
  adminDeleteEvent,
  adminApproveEvent,
  adminRejectEvent,
  adminGetEventRegistrations,
  adminUpdateRegistrationStatus
} from '../../services/noticeboardService';
import { format, parseISO, isBefore, isAfter } from 'date-fns';
import { Button } from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
// Tabs and Modal components are not available; using simple buttons and native confirm

export const AdminEventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [registrationLoading, setRegistrationLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(parseISO(dateString), 'PPpp');
  };

  // Status helpers
  const now = new Date();
  const hasStarted = event ? isAfter(now, parseISO(event.start_datetime)) : false;
  const hasEnded = event ? isAfter(now, parseISO(event.end_datetime)) : false;
  
  // Check if registration is open
  const isRegistrationOpen = event => {
    if (!event.registration_required) return false;
    
    const now = new Date();
    const startDate = parseISO(event.start_datetime);
    const deadline = event.registration_deadline ? parseISO(event.registration_deadline) : startDate;
    
    return isBefore(now, deadline) && isAfter(deadline, new Date());
  };

  // Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const eventData = await adminGetEvent(id);
        setEvent(eventData);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event details');
        toast.error('Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  // Fetch registrations when tab is active
  useEffect(() => {
    if (activeTab === 'registrations') {
      const fetchRegistrations = async () => {
        try {
          setRegistrationLoading(true);
          const data = await adminGetEventRegistrations(id);
          setRegistrations(Array.isArray(data) ? data : data.results || []);
        } catch (err) {
          console.error('Error fetching registrations:', err);
          toast.error('Failed to load registrations');
        } finally {
          setRegistrationLoading(false);
        }
      };

      fetchRegistrations();
    }
  }, [activeTab, id]);

  // Handle event deletion
  const handleDelete = async () => {
    try {
      setDeleting(true);
      await adminDeleteEvent(id);
      toast.success('Event deleted successfully');
      navigate('/admin/events');
    } catch (err) {
      console.error('Error deleting event:', err);
      toast.error('Failed to delete event');
      setDeleting(false);
    }
  };

  // Handle approve/reject event
  const handleApproveReject = async (approve) => {
    try {
      if (approve) {
        await adminApproveEvent(id);
        setEvent(prev => ({ ...prev, is_approved: true }));
        toast.success('Event approved successfully');
      } else {
        await adminRejectEvent(id);
        setEvent(prev => ({ ...prev, is_approved: false }));
        toast.success('Event rejected');
      }
    } catch (err) {
      console.error(`Error ${approve ? 'approving' : 'rejecting'} event:`, err);
      toast.error(`Failed to ${approve ? 'approve' : 'reject'} event`);
    }
  };

  // Handle registration status update
  const handleRegistrationStatusUpdate = async (registrationId, status) => {
    try {
      await adminUpdateRegistrationStatus(registrationId, status);
      
      // Update local state
      setRegistrations(prev => 
        prev.map(reg => 
          reg.id === registrationId 
            ? { ...reg, status, updated_at: new Date().toISOString() } 
            : reg
        )
      );
      
      toast.success('Registration updated successfully');
    } catch (err) {
      console.error('Error updating registration status:', err);
      toast.error('Failed to update registration');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Event not found</h3>
        <p className="mt-2 text-sm text-gray-500">The requested event could not be found.</p>
        <div className="mt-6">
          <Link
            to="/admin/events"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
          <div className="flex items-center mt-1 space-x-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              event.is_approved 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {event.is_approved ? 'Approved' : 'Pending Approval'}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              hasEnded 
                ? 'bg-gray-100 text-gray-800' 
                : hasStarted 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-purple-100 text-purple-800'
            }`}>
              {hasEnded ? 'Ended' : hasStarted ? 'In Progress' : 'Upcoming'}
            </span>
            {event.registration_required && (
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                isRegistrationOpen(event) 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {isRegistrationOpen(event) ? 'Registration Open' : 'Registration Closed'}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Link to={`/admin/events/${id}/edit`}>
            <Button variant="secondary">
              Edit Event
            </Button>
          </Link>
          
          {!event.is_approved && (
            <Button 
              variant="success"
              onClick={() => handleApproveReject(true)}
              disabled={deleting}
            >
              Approve
            </Button>
          )}
          
          <Button 
            variant="danger"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
                handleDelete();
              }
            }}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {[
            { key: 'details', label: 'Event Details', disabled: false },
            { key: 'registrations', label: `Registrations (${registrations.length})`, disabled: !event.registration_required },
            { key: 'analytics', label: 'Analytics', disabled: false },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => !tab.disabled && setActiveTab(tab.key)}
              disabled={tab.disabled}
              className={
                `whitespace-nowrap py-4 px-1 border-b-2 text-sm font-medium ` +
                (activeTab === tab.key
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300') +
                (tab.disabled ? ' opacity-50 cursor-not-allowed' : '')
              }
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'details' && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Event Information
                </h3>
              </div>
              
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Description</h4>
                    <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                      {event.description || 'No description provided.'}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Event Type</h4>
                    <p className="mt-1 text-sm text-gray-900 capitalize">
                      {event.event_type.replace('_', ' ')}
                    </p>
                    
                    <h4 className="mt-4 text-sm font-medium text-gray-500">Organizer</h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {event.organizer?.name || 'N/A'}
                    </p>
                    
                    <h4 className="mt-4 text-sm font-medium text-gray-500">Created At</h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(event.created_at)}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Date & Time</h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(event.start_datetime)} - {formatDate(event.end_datetime)}
                    </p>
                    
                    <h4 className="mt-4 text-sm font-medium text-gray-500">Location</h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {event.is_online ? (
                        <a 
                          href={event.meeting_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          {event.meeting_link}
                        </a>
                      ) : event.location_url ? (
                        <a 
                          href={event.location_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          {event.location}
                        </a>
                      ) : (
                        event.location || 'N/A'
                      )}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Registration</h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {event.registration_required 
                        ? `Required${event.registration_deadline ? ` (Deadline: ${formatDate(event.registration_deadline)})` : ''}` 
                        : 'Not required'}
                    </p>
                    
                    {event.registration_required && (
                      <>
                        <h4 className="mt-4 text-sm font-medium text-gray-500">Max Participants</h4>
                        <p className="mt-1 text-sm text-gray-900">
                          {event.max_participants || 'No limit'}
                        </p>
                        
                        <h4 className="mt-4 text-sm font-medium text-gray-500">Price</h4>
                        <p className="mt-1 text-sm text-gray-900">
                          {event.is_free ? 'Free' : `$${parseFloat(event.price).toFixed(2)}`}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
        )}

        {activeTab === 'registrations' && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Event Registrations
                </h3>
                <div className="text-sm text-gray-500">
                  {registrations.length} {registrations.length === 1 ? 'registration' : 'registrations'}
                </div>
              </div>
              
              {registrationLoading ? (
                <div className="flex items-center justify-center p-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : registrations.length === 0 ? (
                <div className="text-center p-8">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      vectorEffect="non-scaling-stroke"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No registrations yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    As people register for this event, their information will appear here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Registered At
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {registrations.map((registration) => (
                        <tr key={registration.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {registration.user?.name || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {registration.user?.email || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              registration.status === 'confirmed' 
                                ? 'bg-green-100 text-green-800' 
                                : registration.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {registration.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(registration.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {registration.status !== 'confirmed' && (
                              <button
                                onClick={() => handleRegistrationStatusUpdate(registration.id, 'confirmed')}
                                className="text-green-600 hover:text-green-900 mr-4"
                              >
                                Confirm
                              </button>
                            )}
                            {registration.status !== 'cancelled' && (
                              <button
                                onClick={() => handleRegistrationStatusUpdate(registration.id, 'cancelled')}
                                className="text-red-600 hover:text-red-900"
                              >
                                Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
        )}

        {activeTab === 'analytics' && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Event Analytics
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  View analytics and insights for this event.
                </p>
              </div>
              
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500">Total Registrations</h4>
                    <p className="mt-1 text-3xl font-semibold text-gray-900">
                      {registrations.length}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500">Confirmed</h4>
                    <p className="mt-1 text-3xl font-semibold text-green-600">
                      {registrations.filter(r => r.status === 'confirmed').length}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500">Cancelled</h4>
                    <p className="mt-1 text-3xl font-semibold text-red-600">
                      {registrations.filter(r => r.status === 'cancelled').length}
                    </p>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Registration Timeline</h4>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                    Registration timeline chart will be displayed here
                  </div>
                </div>
              </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminEventDetailPage;
