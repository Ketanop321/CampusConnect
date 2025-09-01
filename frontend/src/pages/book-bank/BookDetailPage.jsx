import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  ClockIcon, 
  UserIcon, 
  TagIcon,
  BookOpenIcon,
  CurrencyDollarIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import Button from '../../components/ui/Button';
import { getBook, deleteBook, requestBook } from '../../services/bookService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const data = await getBook(id);
        setBook(data);
      } catch (err) {
        console.error('Error fetching book:', err);
        setError('Failed to load book details');
        toast.error('Failed to load book details');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  const conditionColors = {
    'new': 'bg-green-100 text-green-800',
    'good': 'bg-yellow-100 text-yellow-800',
    'fair': 'bg-orange-100 text-orange-800',
    'poor': 'bg-red-100 text-red-800',
  };

  const statusColors = {
    'available': 'bg-green-100 text-green-800',
    'sold': 'bg-gray-100 text-gray-800',
  };

  const getImageUrl = () => {
    if (!book?.primary_image && !book?.image) return null;
    const imageUrl = book.primary_image || book.image;
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}${imageUrl}`;
  };

  const handlePurchase = async () => {
    if (!user) {
      toast.error('Please log in to purchase this book');
      return;
    }
    
    try {
      setIsPurchasing(true);
      await requestBook(book.id, 'I am interested in buying this book.');
      toast.success('Purchase request sent successfully!');
    } catch (error) {
      console.error('Error requesting book:', error);
      toast.error(error.response?.data?.detail || 'Failed to send purchase request');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleEdit = () => {
    navigate(`/book-bank/${book.id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this book listing?')) {
      try {
        await deleteBook(book.id);
        toast.success('Book deleted successfully!');
        navigate('/book-bank');
      } catch (error) {
        console.error('Error deleting book:', error);
        toast.error(error.response?.data?.detail || 'Failed to delete book');
      }
    }
  };

  const imageUrl = getImageUrl();
  const isOwner = user?.id && book?.posted_by?.id && String(user.id) === String(book.posted_by.id);
  const isAvailable = book?.is_available || book?.status === 'available';

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

  if (error || !book) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Book Not Found</h2>
            <p className="text-gray-600 mb-6">The requested book could not be found or may have been removed.</p>
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
              <h1 className="text-2xl font-semibold text-gray-900">{book.title}</h1>
              <div className="mt-2 sm:mt-0 flex items-center space-x-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    statusColors[isAvailable ? 'available' : 'sold'] || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {isAvailable ? 'Available' : 'Sold'}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    conditionColors[book.condition?.toLowerCase()] || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {book.condition_display || book.condition}
                </span>
              </div>
            </div>
            <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <UserIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                <span>by {book.author}</span>
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <TagIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                <span>ISBN: {book.isbn || 'N/A'}</span>
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <ClockIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                <span>
                  Listed {format(new Date(book.created_at), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-gray-900">
                ${parseFloat(book.price || 0).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Description</h3>
                  <div className="mt-2 text-gray-600 whitespace-pre-line">
                    {book.description || 'No description provided.'}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900">Book Details</h3>
                  <div className="mt-2 space-y-2">
                    {book.department && (
                      <div className="flex items-center text-gray-600">
                        <TagIcon className="flex-shrink-0 mr-2 h-5 w-5 text-gray-400" />
                        <span>Department: {book.department}</span>
                      </div>
                    )}
                    {book.edition && (
                      <div className="flex items-center text-gray-600">
                        <BookOpenIcon className="flex-shrink-0 mr-2 h-5 w-5 text-gray-400" />
                        <span>Edition: {book.edition}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
                  <div className="mt-2 space-y-2">
                    {book.contact_email && (
                      <div className="flex items-center text-gray-600">
                        <UserIcon className="flex-shrink-0 mr-2 h-5 w-5 text-gray-400" />
                        <span>Email: {book.contact_email}</span>
                      </div>
                    )}
                    {book.contact_phone && (
                      <div className="flex items-center text-gray-600">
                        <UserIcon className="flex-shrink-0 mr-2 h-5 w-5 text-gray-400" />
                        <span>Phone: {book.contact_phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {book.posted_by && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Seller</h3>
                    <div className="mt-2 flex items-center text-gray-600">
                      <UserIcon className="flex-shrink-0 mr-2 h-5 w-5 text-gray-400" />
                      <span>{book.posted_by.first_name || book.posted_by.email}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                {imageUrl ? (
                  <div className="rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={imageUrl}
                      alt={book.title || 'Book cover'}
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

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap justify-end gap-3">
              {isOwner && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleEdit}
                    className="inline-flex items-center"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDelete}
                    className="inline-flex items-center text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}
              
              {!isOwner && isAvailable && (
                <Button
                  variant="primary"
                  onClick={handlePurchase}
                  disabled={isPurchasing}
                  className="inline-flex items-center"
                >
                  <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                  {isPurchasing ? 'Processing...' : 'Buy Now'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;