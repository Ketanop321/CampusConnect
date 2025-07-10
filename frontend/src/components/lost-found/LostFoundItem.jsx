import { useState } from 'react';
import { ClockIcon, MapPinIcon, UserIcon, TagIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import Button from '../ui/Button';

const LostFoundItem = ({ item, onClaim }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const statusColors = {
    lost: 'bg-red-100 text-red-800',
    found: 'bg-green-100 text-green-800',
    claimed: 'bg-gray-100 text-gray-800',
  };

  const handleClaim = async () => {
    try {
      setIsClaiming(true);
      await onClaim(item.id);
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="h-48 overflow-hidden">
        <img
          src={item.image || 'https://via.placeholder.com/400x200?text=No+Image'}
          alt={item.itemName}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{item.itemName}</h3>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              statusColors[item.status] || 'bg-gray-100 text-gray-800'
            }`}
          >
            {item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
          </span>
        </div>
        
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <TagIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
          {item.category || 'Uncategorized'}
        </div>
        
        <div className="mt-2 flex items-start text-sm text-gray-500">
          <MapPinIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 mt-0.5" />
          <span>{item.location || 'Location not specified'}</span>
        </div>
        
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <ClockIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
          <span>
            {format(new Date(item.date || item.createdAt), 'MMM d, yyyy h:mm a')}
          </span>
        </div>
        
        {item.contact && (
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <UserIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
            <span className="truncate">Contact: {item.contact}</span>
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
        
        <div className="mt-5 flex justify-end space-x-3">
          {item.status === 'found' && (
            <Button
              type="button"
              variant="outline"
              onClick={handleClaim}
              disabled={isClaiming}
              className="text-sm"
            >
              {isClaiming ? 'Claiming...' : 'Claim Item'}
            </Button>
          )}
          <Button
            type="button"
            variant="primary"
            className="text-sm"
            onClick={() => {
              // In a real app, this would navigate to a detail view
              console.log('View details for item:', item.id);
            }}
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LostFoundItem;
