import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import BookForm from '../../components/book-bank/BookForm';
import { Button } from '../../components/ui/Button';
import { getBook, updateBook } from '../../services/bookService';
import { useAuth } from '../../context/AuthContext';
import { handleApiError } from '../../utils/errorHandling';
import toast from 'react-hot-toast';

const BookEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(true);

  // Fetch book details
  const { data: book, isLoading, error } = useQuery({
    queryKey: ['book', id],
    queryFn: () => getBook(id),
  });

  // Update book mutation
  const updateBookMutation = useMutation({
    mutationFn: (bookData) => updateBook(id, bookData),
    onSuccess: (data) => {
      console.log('Update successful:', data);
      // Invalidate queries to refresh data
      queryClient.invalidateQueries(['book', id]);
      queryClient.invalidateQueries(['books']);
      toast.success('Book updated successfully!');
      navigate(`/book-bank/${id}`);
    },
    onError: (error) => {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    },
  });

  // Check if user is the owner
  const isOwner = user?.id && book?.posted_by?.id && String(user.id) === String(book.posted_by.id);

  useEffect(() => {
    if (book && !isOwner) {
      toast.error('You do not have permission to edit this book');
      navigate(`/book-bank/${id}`);
    }
  }, [book, isOwner, navigate, id]);

  const handleClose = () => {
    setIsFormOpen(false);
    navigate(`/book-bank/${id}`);
  };

  const handleSubmit = async (formData) => {
    try {
      await updateBookMutation.mutateAsync(formData);
    } catch (error) {
      // Error is handled in the mutation
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
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
            <p className="text-gray-600 mb-6">The requested book could not be found.</p>
            <Button onClick={() => navigate('/book-bank')}>
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Book Bank
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6">You do not have permission to edit this book.</p>
            <Button onClick={() => navigate(`/book-bank/${id}`)}>
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Book Details
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
          onClick={() => navigate(`/book-bank/${id}`)}
          className="mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Book Details
        </Button>

        <div className="bg-white p-6 rounded-lg shadow">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit Book: {book.title}</h1>
          
          <BookForm
            isOpen={isFormOpen}
            onClose={handleClose}
            onSubmit={handleSubmit}
            initialData={book}
            isSubmitting={updateBookMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
};

export default BookEditPage;
