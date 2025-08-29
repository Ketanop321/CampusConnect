import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  ClockIcon, 
  MapPinIcon, 
  UserIcon, 
  TagIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import Button from '../../components/ui/Button';
import lostFoundService from '../../services/lostFoundService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const LostFoundDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const data = await lostFoundService.getLostFoundItem(id);
        setItem(data);
      } catch (err) {
        console.error('Error fetching item:', err);
        setError('Failed to load item details');
        toast.error('Failed to load item details');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const statusColors = {
    lost: 'bg-red-100 text-red-800',
    found: 'bg-green-100 text-green-800',
    claimed: 'bg-purple-100 text-purple-800',
  };
  
  const statusIcons = {
    lost: <ExclamationCircleIcon className="h-5 w-5 text-red-500" />,
    found: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
    claimed: <CheckCircleIcon className="h-5 w-5 text-purple-500" />,
  };

  const getImageUrl = () => {
    if (!item?.image) return null;
    if (item.image.startsWith('http')) return item.image;
    return `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}${item.image}`;
  };

  const imageUrl = getImageUrl();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Item Not Found</h2>
            <p className="text-gray-600 mb-6">The requested item could not be found or may have been removed.</p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to List
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to List
        </Button>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-900">{item.item_name}</h1>
              <div className="mt-2 sm:mt-0 flex items-center space-x-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    statusColors[item.status] || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {statusIcons[item.status]}
                  <span className="ml-1">
                    {item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
                  </span>
                </span>
                {item.claimed_by && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                    Claimed
                  </span>
                )}
              </div>
            </div>
            <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <TagIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                <span className="capitalize">{item.category?.toLowerCase() || 'Uncategorized'}</span>
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <MapPinIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                <span>{item.location || 'Location not specified'}</span>
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <ClockIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                <span>
                  {format(new Date(item.date_occurred || item.created_at), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
            </div>
          </div>

          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Description</h3>
                  <div className="mt-2 text-gray-600 whitespace-pre-line">
                    {item.description || 'No description provided.'}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
                  <div className="mt-2">
                    {item.contact_info ? (
                      <div className="flex items-center text-gray-600">
                        <UserIcon className="flex-shrink-0 mr-2 h-5 w-5 text-gray-400" />
                        <span>{item.contact_info}</span>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No contact information provided.</p>
                    )}
                  </div>
                </div>

                {item.reporter && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Reported By</h3>
                    <div className="mt-2 flex items-center text-gray-600">
                      <UserIcon className="flex-shrink-0 mr-2 h-5 w-5 text-gray-400" />
                      <span>{item.reporter.first_name || item.reporter.email}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                {imageUrl ? (
                  <div className="rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={imageUrl}
                      alt={item.item_name || 'Lost and found item'}
                      className="w-full h-auto max-h-96 object-contain"
                      onError={() => setImageError(true)}
                    />
                  </div>
                ) : (
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                    <PhotoIcon className="h-16 w-16" />
                    <span className="sr-only">No image available</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LostFoundDetailPage;
