import { useState } from 'react';
import { 
  ClockIcon, 
  MapPinIcon, 
  UserIcon, 
  TagIcon, 
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import Button from '../ui/Button';
import { toast } from 'react-hot-toast';

const LostFoundItem = ({ 
  item, 
  onClaim, 
  onMarkAsFound, 
  onEdit,
  onDelete,
  currentUserId,
  isAdmin 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isMarkingAsFound, setIsMarkingAsFound] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  const isOwner = item.reporter?.id === currentUserId;

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

  const handleClaim = async () => {
    if (!currentUserId) {
      toast.error('Please log in to claim this item');
      return;
    }
    
    try {
      setIsClaiming(true);
      await onClaim(item.id);
    } catch (error) {
      console.error('Error claiming item:', error);
      toast.error(error.message || 'Failed to claim item');
    } finally {
      setIsClaiming(false);
    }
  };
  
  const handleMarkAsFound = async () => {
    try {
      setIsMarkingAsFound(true);
      await onMarkAsFound(item.id);
    } catch (error) {
      console.error('Error marking as found:', error);
      toast.error(error.message || 'Failed to update status');
    } finally {
      setIsMarkingAsFound(false);
    }
  };
  
  const handleEdit = () => {
    onEdit(item);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(item.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error(error.message || 'Failed to delete item');
    } finally {
      setIsDeleting(false);
    }
  };

  // Format the image URL to use the correct backend URL if it's a relative path
  const getImageUrl = () => {
    if (!item.image) return null;
    if (item.image.startsWith('http')) return item.image;
    return `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}${item.image}`;
  };

  const imageUrl = getImageUrl();

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg h-full flex flex-col">
      <div className="h-48 overflow-hidden relative bg-gray-100">
        {imageLoading && imageUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse bg-gray-200 w-full h-full" />
          </div>
        )}
        
        {!imageError && imageUrl ? (
          <img
            src={imageUrl}
            alt={item.item_name || 'Lost and found item'}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              isExpanded ? 'scale-105' : 'hover:scale-105'
            }`}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-400">
            <PhotoIcon className="h-12 w-12" />
          </div>
        )}
        
        {(isOwner || isAdmin) && (
          <div className="absolute top-2 right-2 flex space-x-1">
            <button
              onClick={handleEdit}
              className="p-2 rounded-full bg-white/80 text-gray-700 hover:bg-white transition-all shadow-sm"
              title="Edit item"
              aria-label="Edit item"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={handleDeleteClick}
              className="p-2 rounded-full bg-white/80 text-red-600 hover:bg-red-50 transition-all shadow-sm"
              title="Delete item"
              aria-label="Delete item"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {item.item_name}
          </h3>
          <div className="flex items-center space-x-2">
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
        
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <TagIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
          <span className="capitalize">{item.category?.toLowerCase() || 'Uncategorized'}</span>
        </div>
        
        <div className="mt-2 flex items-start text-sm text-gray-500">
          <MapPinIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 mt-0.5" />
          <span>{item.location || 'Location not specified'}</span>
        </div>
        
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <ClockIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
          <span>
            {format(new Date(item.date_occurred || item.created_at), 'MMM d, yyyy h:mm a')}
          </span>
        </div>
        
        {item.contact_info && (
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <UserIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
            <span className="truncate">Contact: {item.contact_info}</span>
          </div>
        )}
        {item.reporter && (
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <UserIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
            <span className="truncate">
              Reported by: {item.reporter.first_name || item.reporter.email}
            </span>
          </div>
        )}
        
        <div className="mt-4">
          <p className="text-sm text-gray-500 line-clamp-2">
            {item.description || 'No description provided.'}
          </p>
          {item.description && item.description.length > 100 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-1 text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
          {isExpanded && item.description && (
            <p className="mt-2 text-sm text-gray-500">{item.description}</p>
          )}
        </div>
        
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          {isOwner && item.status === 'lost' && (
            <Button
              type="button"
              variant="outline"
              onClick={handleMarkAsFound}
              disabled={isMarkingAsFound}
              className="text-sm"
            >
              {isMarkingAsFound ? 'Updating...' : 'Mark as Found'}
            </Button>
          )}
          
          {item.status === 'found' && !item.claimed_by && (
            <Button
              type="button"
              variant="outline"
              onClick={handleClaim}
              disabled={isClaiming}
              className="text-sm"
            >
              {isClaiming ? 'Claiming...' : 'I Found This'}
            </Button>
          )}
          
          {(isOwner || isAdmin) && (
            <Button
              type="button"
              variant="outline"
              onClick={handleEdit}
              className="text-sm"
            >
              <PencilIcon className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
          
          <Button
            type="button"
            variant="primary"
            className="text-sm"
            onClick={() => {
              window.location.href = `/lost-found/${item.id}`;
            }}
          >
            View Details
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Delete item
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete this item? This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LostFoundItem;
