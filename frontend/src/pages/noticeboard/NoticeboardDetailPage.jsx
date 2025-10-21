import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  CalendarIcon, 
  MapPinIcon, 
  UserIcon, 
  UserGroupIcon, 
  LinkIcon, 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { 
  getEvent, 
  registerForEvent, 
  getEventComments, 
  addEventComment, 
  deleteEvent 
} from '../../services/noticeboardService';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const NoticeboardDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEventAndComments = async () => {
      try {
        setLoading(true);
        
        // First fetch the event
        const eventData = await getEvent(id);
        setEvent(eventData);
        
        // Then try to fetch comments, but don't fail if it doesn't work
        try {
          const commentsData = await getEventComments(id);
          setComments(commentsData);
        } catch (commentErr) {
          console.warn('Could not load comments:', commentErr);
          setComments([]);
        }
      } catch (err) {
        setError('Failed to load event. Please try again.');
        console.error('Error fetching event:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEventAndComments();
  }, [id]);

  const handleRegister = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/noticeboard/${id}` } });
      return;
    }

    try {
      setIsRegistering(true);
      await registerForEvent(id);
      // Refresh event data to show updated registration status
      const updatedEvent = await getEvent(id);
      setEvent(updatedEvent);
    } catch (err) {
      setError('Failed to register for event. Please try again.');
      console.error('Error registering for event:', err);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    try {
      setIsSubmittingComment(true);
      const comment = await addEventComment(id, { content: newComment });
      setComments([...comments, comment]);
      setNewComment('');
    } catch (err) {
      setError('Failed to post comment. Please try again.');
      console.error('Error posting comment:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        await deleteEvent(id);
        navigate('/noticeboard');
      } catch (err) {
        setError('Failed to delete event. Please try again.');
        console.error('Error deleting event:', err);
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isRegistered = event?.registrations?.some(reg => reg.user.id === user?.id);
  const isOwner = !!(user && user.is_staff && event?.organizer?.id === user.id);
  const registrationClosed = event?.registration_required && 
    event.registration_deadline && 
    new Date(event.registration_deadline) < new Date();
  const isFull = event?.max_participants && 
    event.registrations_count >= event.max_participants;
  const canRegister = event?.registration_required && 
    !isRegistered && 
    !registrationClosed && 
    !isFull;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
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
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Event not found</h3>
          <p className="mt-1 text-sm text-gray-500">The event you're looking for doesn't exist or has been removed.</p>
          <div className="mt-6">
            <Link to="/noticeboard" className="text-indigo-600 hover:text-indigo-500 font-medium">
              Back to events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          to="/noticeboard"
          className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to events
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {/* Event Header */}
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
              <div className="mt-1 flex items-center text-sm text-gray-500">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
                </span>
                <span className="mx-2">•</span>
                <span>Organized by {event.organizer?.name || 'Unknown'}</span>
              </div>
            </div>
            
            {isOwner && (
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/noticeboard/${event.id}/edit`)}
                >
                  Edit Event
                </Button>
                <Button 
                  variant="danger" 
                  onClick={handleDeleteEvent}
                >
                  Delete Event
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Event Image */}
        {(event.primary_image || (event.images && event.images.length > 0)) && (
          <div className="relative h-64 md:h-80 bg-gradient-to-br from-indigo-50 to-purple-50 overflow-hidden">
            <img
              src={event.primary_image || event.images[0].image}
              alt={event.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Image failed to load:', e.target.src);
                e.target.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        )}

        {/* Event Details */}
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Main Content */}
            <div className="md:col-span-2">
              <div className="prose max-w-none">
                <h2 className="text-lg font-medium text-gray-900 mb-4">About This Event</h2>
                <div className="text-gray-700 whitespace-pre-line">
                  {event.description || 'No description provided.'}
                </div>
              </div>

              {/* Comments Section */}
              <div className="mt-12">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Comments ({comments.length})
                </h3>
                
                {user ? (
                  <form onSubmit={handleCommentSubmit} className="mb-6">
                    <div className="flex space-x-3">
                      <div className="flex-shrink-0">
                        <span className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 font-medium flex items-center justify-center">
                          {user.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <label htmlFor="comment" className="sr-only">
                          Add your comment
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            id="comment"
                            name="comment"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="Add a comment..."
                            disabled={isSubmittingComment}
                          />
                          <Button 
                            type="submit" 
                            size="sm"
                            disabled={!newComment.trim() || isSubmittingComment}
                          >
                            {isSubmittingComment ? 'Posting...' : 'Post'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-4 border border-gray-200 rounded-md bg-gray-50">
                    <p className="text-sm text-gray-600">
                      <Link 
                        to="/login" 
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        Sign in
                      </Link>{' '}
                      to leave a comment
                    </p>
                  </div>
                )}

                <div className="space-y-6">
                  {comments.length > 0 ? (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex space-x-3">
                        <div className="flex-shrink-0">
                          <span className="h-10 w-10 rounded-full bg-gray-100 text-gray-600 font-medium flex items-center justify-center">
                            {comment.user?.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-gray-900">
                                {comment.user?.name || 'Anonymous'}
                              </h4>
                              <span className="text-xs text-gray-500">
                                {new Date(comment.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-700">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-center text-gray-500 py-4">
                      No comments yet. Be the first to comment!
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-gray-50 p-4 rounded-lg sticky top-4">
                <div className="space-y-6">
                  {/* Date & Time */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Date & Time</h3>
                    <div className="mt-1 flex items-center">
                      <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm text-gray-900">
                          {formatDate(event.start_datetime)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatTime(event.start_datetime)} - {formatTime(event.end_datetime)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      {event.is_online ? 'Location' : 'Venue'}
                    </h3>
                    <div className="mt-1">
                      {event.is_online ? (
                        <div className="flex items-start">
                          <LinkIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-indigo-600">Online Event</p>
                            {event.meeting_link && (
                              <a 
                                href={event.meeting_link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-indigo-600 hover:underline"
                              >
                                Join Meeting
                              </a>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start">
                          <MapPinIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-900">
                            {event.location}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Registration Status */}
                  {event.registration_required && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Registration</h3>
                      <div className="mt-1">
                        {isRegistered ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircleIcon className="h-5 w-5 mr-1.5" />
                            <span className="text-sm font-medium">You're registered</span>
                          </div>
                        ) : registrationClosed ? (
                          <div className="flex items-center text-amber-600">
                            <XCircleIcon className="h-5 w-5 mr-1.5" />
                            <span className="text-sm">Registration closed</span>
                          </div>
                        ) : isFull ? (
                          <div className="flex items-center text-red-600">
                            <XCircleIcon className="h-5 w-5 mr-1.5" />
                            <span className="text-sm">Event is full</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-green-600">
                            <UserIcon className="h-5 w-5 mr-1.5" />
                            <span className="text-sm">
                              {event.registrations_count || 0} / {event.max_participants || '∞'} registered
                            </span>
                          </div>
                        )}
                        
                        {event.registration_deadline && (
                          <p className="mt-1 text-xs text-gray-500">
                            Registration {registrationClosed ? 'closed' : 'closes'} on {formatDate(event.registration_deadline)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-2">
                    {canRegister ? (
                      <Button 
                        onClick={handleRegister}
                        className="w-full justify-center"
                        disabled={isRegistering}
                      >
                        {isRegistering ? 'Registering...' : 'Register Now'}
                      </Button>
                    ) : isRegistered ? (
                      <Button 
                        variant="outline" 
                        className="w-full justify-center"
                        disabled
                      >
                        Already Registered
                      </Button>
                    ) : null}
                    
                    {event.is_online && event.meeting_link && (
                      <a
                        href={event.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex w-full justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Join Online Event
                      </a>
                    )}
                    
                    {event.location_url && !event.is_online && (
                      <a
                        href={event.location_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex w-full justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        View on Map
                      </a>
                    )}
                  </div>

                  {/* Share Buttons */}
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Share this event</h3>
                    <div className="flex space-x-2">
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <span className="sr-only">Share on Facebook</span>
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                        </svg>
                      </a>
                      <a
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(event.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <span className="sr-only">Share on Twitter</span>
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                      </a>
                      <a
                        href={`mailto:?subject=${encodeURIComponent(event.title)}&body=Check out this event: ${encodeURIComponent(window.location.href)}`}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <span className="sr-only">Share via Email</span>
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </a>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          // You might want to show a toast notification here
                        }}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <span className="sr-only">Copy link</span>
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticeboardDetailPage;
