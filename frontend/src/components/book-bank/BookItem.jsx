import { useState } from 'react';
import { 
  BookOpenIcon, 
  CurrencyDollarIcon, 
  UserIcon, 
  TagIcon, 
  ClockIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

const BookItem = ({ book, onPurchase, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const conditionColors = {
    'new': 'bg-green-100 text-green-800',
    'like new': 'bg-blue-100 text-blue-800',
    'good': 'bg-yellow-100 text-yellow-800',
    'fair': 'bg-orange-100 text-orange-800',
    'poor': 'bg-red-100 text-red-800',
  };

  const statusLabels = {
    'available': 'Available',
    'pending': 'Pending',
    'sold': 'Sold',
  };

  const statusColors = {
    'available': 'bg-green-100 text-green-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'sold': 'bg-gray-100 text-gray-800',
  };

  const handlePurchase = async () => {
    try {
      setIsPurchasing(true);
      await onPurchase(book.id);
    } finally {
      setIsPurchasing(false);
    }
  };

  const { user } = useAuth();
  const isOwner = user?.id === book.posted_by?.id;

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg relative">
      {/* Edit and Delete Buttons - Only show for owner */}
      {isOwner && (
        <div className="absolute top-2 right-2 flex space-x-1 z-10">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(book);
            }}
            className="p-2 rounded-full bg-white/80 text-gray-700 hover:bg-white transition-all shadow-sm"
            title="Edit book"
            aria-label="Edit book"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('Are you sure you want to delete this book?')) {
                onDelete(book.id);
              }
            }}
            className="p-2 rounded-full bg-white/80 text-red-600 hover:bg-red-50 transition-all shadow-sm"
            title="Delete book"
            aria-label="Delete book"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start">
          <div className="flex-shrink-0 h-40 w-28 bg-gray-200 rounded-md overflow-hidden">
            {book.image ? (
              <img
                src={book.image}
                alt={`Cover of ${book.title}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
                <BookOpenIcon className="h-12 w-12" />
              </div>
            )}
          </div>
          
          <div className="ml-4 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">{book.title}</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[book.status] || 'bg-gray-100 text-gray-800'}`}>
                {statusLabels[book.status] || book.status}
              </span>
            </div>
            
            <p className="mt-1 text-sm text-gray-500">by {book.author}</p>
            
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <TagIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
              <span>ISBN: {book.isbn}</span>
            </div>
            
            {book.edition && (
              <div className="mt-1 flex items-center text-sm text-gray-500">
                <BookOpenIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                <span>{book.edition} Edition</span>
              </div>
            )}
            
            <div className="mt-1 flex items-center text-sm text-gray-500">
              <TagIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
              <span>Condition: </span>
              <span className={`ml-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${conditionColors[book.condition.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
                {book.condition}
              </span>
            </div>
            
            <div className="mt-2 flex items-baseline">
              <span className="text-2xl font-bold text-gray-900">
                ${book.price.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center text-sm text-gray-500">
              <UserIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
              <span>{book.seller?.name || 'Unknown Seller'}</span>
              {book.seller?.rating && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  ★ {book.seller.rating}
                </span>
              )}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <ClockIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
              <span>{format(new Date(book.postedDate), 'MMM d, yyyy')}</span>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-gray-600 line-clamp-2">
              {book.description}
            </p>
            {book.description && book.description.length > 100 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-1 text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                {isExpanded ? 'Show less' : 'Read more'}
              </button>
            )}
            {isExpanded && book.description && (
              <p className="mt-2 text-sm text-gray-600">{book.description}</p>
            )}
          </div>
          
          {book.status === 'available' && (
            <div className="mt-5 flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={handlePurchase}
                disabled={isPurchasing}
                className="ml-3"
              >
                {isPurchasing ? 'Processing...' : 'Buy Now'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookItem;
