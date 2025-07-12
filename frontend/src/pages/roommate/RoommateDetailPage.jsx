import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, UserIcon } from '@heroicons/react/24/outline';
import { getRoommatePost, deleteRoommatePost } from '../../services/roommateService';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

const RoommateDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const data = await getRoommatePost(id);
        setPost(data);
      } catch (err) {
        setError('Failed to load post. Please try again later.');
        console.error('Error fetching post:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deleteRoommatePost(id);
        navigate('/roommate');
      } catch (err) {
        setError('Failed to delete post. Please try again.');
        console.error('Error deleting post:', err);
      }
    }
  };

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

  if (!post) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Post not found</h3>
          <p className="mt-1 text-sm text-gray-500">The post you're looking for doesn't exist or has been removed.</p>
          <div className="mt-6">
            <Link to="/roommate" className="text-indigo-600 hover:text-indigo-500 font-medium">
              Go back to listings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = user && user.id === post.user.id;
  const preferredGender = post.preferred_gender === 'M' ? 'Male' : 
                         post.preferred_gender === 'F' ? 'Female' : 
                         post.preferred_gender === 'O' ? 'Other' : 'Any';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          to="/roommate"
          className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to listings
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {/* Image Gallery */}
        <div className="bg-gray-100 p-4">
          <div className="relative h-64 md:h-96 rounded-lg overflow-hidden">
            {post.images && post.images.length > 0 ? (
              <img
                src={post.images[0].image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <span className="text-gray-400">No images available</span>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 py-5 sm:px-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
              <div className="mt-1 flex items-center text-sm text-gray-500">
                <MapPinIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                {post.location}
              </div>
            </div>
            <div className="text-2xl font-bold text-indigo-600">${post.rent}<span className="text-base font-normal text-gray-500">/month</span></div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {post.room_type === 'private' ? 'Private Room' : post.room_type === 'shared' ? 'Shared Room' : 'Entire Apartment'}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {post.available_from} (Available from)
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {post.lease_duration} months lease
            </span>
          </div>
        </div>

        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Description</h2>
          <div className="mt-2 text-gray-700 whitespace-pre-line">
            {post.description || 'No description provided.'}
          </div>
        </div>

        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Details</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Preferred Gender:</span> {preferredGender}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Current Occupants:</span> {post.current_occupants} of {post.total_occupants}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Occupation:</span> {post.occupation}
              </p>
              {post.university && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">University:</span> {post.university}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Furnished:</span> {post.has_furniture ? 'Yes' : 'No'}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Parking:</span> {post.has_parking ? 'Available' : 'Not Available'}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Laundry:</span> {post.has_laundry ? 'Available' : 'Not Available'}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Pets:</span> {post.is_pets_allowed ? 'Allowed' : 'Not Allowed'}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Smoking:</span> {post.is_smoking_allowed ? 'Allowed' : 'Not Allowed'}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Contact Information</h2>
          <div className="mt-4 space-y-2">
            <div className="flex items-center">
              <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">{post.user.name || 'Not specified'}</span>
            </div>
            <div className="flex items-center">
              <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
              <a href={`mailto:${post.contact_email}`} className="text-sm text-indigo-600 hover:text-indigo-500">
                {post.contact_email}
              </a>
            </div>
            {post.contact_number && (
              <div className="flex items-center">
                <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                <a href={`tel:${post.contact_number}`} className="text-sm text-indigo-600 hover:text-indigo-500">
                  {post.contact_number}
                </a>
              </div>
            )}
          </div>
        </div>

        {isOwner && (
          <div className="bg-gray-50 px-4 py-4 sm:px-6 flex justify-end space-x-3">
            <Button variant="outline" onClick={() => navigate(`/roommate/edit/${post.id}`)}>
              Edit Post
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete Post
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoommateDetailPage;
