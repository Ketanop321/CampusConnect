import { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon, BookOpenIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import BookItem from '../../components/book-bank/BookItem';
import BookForm from '../../components/book-bank/BookForm';
import { Button } from '../../components/ui/Button';
import { getBooks, createBook, updateBook, deleteBook, requestBook } from '../../services/bookService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

// Helper function to format book data
const formatBookData = (book) => {
  // Handle the case where book is already formatted or comes from API
  const formattedBook = {
    ...book,
    id: book.id,
    title: book.title || 'Untitled',
    author: book.author || 'Unknown Author',
    isbn: book.isbn || 'N/A',
    description: book.description || 'No description available',
    condition: book.condition || 'good',
    condition_display: book.condition_display || 'Good',
    price: parseFloat(book.price) || 0,
    department: book.department || 'General',
    contact_email: book.contact_email || '',
    contact_phone: book.contact_phone || '',
    status: 'available', // Default status
    postedDate: book.created_at || new Date().toISOString(),
    seller: book.posted_by || { 
      id: book.posted_by?.id || '',
      name: book.posted_by?.name || 'Unknown Seller',
      email: book.posted_by?.email || ''
    },
    // Handle images array or single image
    image: (book.images && book.images[0]?.image) || book.image || 'https://via.placeholder.com/200x300?text=No+Image',
  };
  
  return formattedBook;
};

const BookBankPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    condition: 'all',
    sortBy: 'newest',
  });

  // Fetch books from API
  const { data: booksResponse, isLoading, isError, error } = useQuery({
    queryKey: ['books'],
    queryFn: getBooks,
    select: (data) => {
      // Handle both array response and paginated response
      const books = Array.isArray(data) ? data : (data.results || []);
      return books.map(formatBookData);
    },
  });
  
  const booksData = Array.isArray(booksResponse) ? booksResponse : (booksResponse?.results || []);

  // Create book mutation
  const createBookMutation = useMutation({
    mutationFn: createBook,
    onSuccess: () => {
      queryClient.invalidateQueries(['books']);
      setIsFormOpen(false);
      toast.success('Book listed successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to list book');
    },
  });

  // Update book mutation
  const updateBookMutation = useMutation({
    mutationFn: ({ id, ...data }) => updateBook(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['books']);
      setIsFormOpen(false);
      setEditingBook(null);
      toast.success('Book updated successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to update book');
    },
  });

  // Delete book mutation
  const deleteBookMutation = useMutation({
    mutationFn: deleteBook,
    onSuccess: () => {
      queryClient.invalidateQueries(['books']);
      toast.success('Book deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to delete book');
    },
  });

  // Request book mutation
  const requestBookMutation = useMutation({
    mutationFn: ({ bookId, message }) => requestBook(bookId, message),
    onSuccess: () => {
      queryClient.invalidateQueries(['books']);
      toast.success('Book request sent successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to send book request');
    },
  });

  const handleEditBook = (book) => {
    setEditingBook(book);
    setIsFormOpen(true);
  };

  const handleDeleteBook = (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      deleteBookMutation.mutate(bookId);
    }
  };

  const handleRequestBook = (bookId, message) => {
    requestBookMutation.mutate({ bookId, message });
  };

  const handleSubmitBook = (bookData) => {
    if (editingBook) {
      updateBookMutation.mutate({ id: editingBook.id, ...bookData });
    } else {
      createBookMutation.mutate(bookData);
    }
  };

  // Use the data from the API
  const books = booksData || [];

  const filteredBooks = books.filter((book) => {
    // Filter by search term
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.includes(searchTerm);

    // Filter by status
    const matchesStatus = filters.status === 'all' || book.status === filters.status;
    
    // Filter by condition
    const matchesCondition = filters.condition === 'all' || book.condition.toLowerCase() === filters.condition;

    return matchesSearch && matchesStatus && matchesCondition;
  });

  // Sort books
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (filters.sortBy === 'newest') {
      return new Date(b.postedDate) - new Date(a.postedDate);
    } else if (filters.sortBy === 'price-low') {
      return a.price - b.price;
    } else if (filters.sortBy === 'price-high') {
      return b.price - a.price;
    } else if (filters.sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Book Bank</h1>
          <p className="mt-2 text-sm text-gray-700">
            Buy, sell, or exchange textbooks with other students.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Sell a Book
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              Search
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Search by title, author, or ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              name="status"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="condition" className="block text-sm font-medium text-gray-700">
              Condition
            </label>
            <select
              id="condition"
              name="condition"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={filters.condition}
              onChange={(e) => handleFilterChange('condition', e.target.value)}
            >
              <option value="all">All Conditions</option>
              <option value="new">New</option>
              <option value="like new">Like New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700">
              Sort By
            </label>
            <select
              id="sort"
              name="sort"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      <div className="mt-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <ExclamationCircleIcon className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading books</h3>
            <p className="mt-1 text-sm text-gray-500">Failed to load books. Please try again later.</p>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-12">
            <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No books found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filters.status !== 'all' || filters.condition !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Be the first to list a book!'}
            </p>
            <div className="mt-6">
              <Button
                onClick={() => {
                  setEditingBook(null);
                  setIsFormOpen(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Sell a Book
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {books.map((book) => (
              <BookItem
                key={book.id}
                book={book}
                onPurchase={(bookId) => handleRequestBook(bookId, 'I am interested in buying this book.')}
                onEdit={handleEditBook}
                onDelete={handleDeleteBook}
              />
            ))}
          </div>
        )}
      </div>

      {/* Book Form Modal */}
      <BookForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingBook(null);
        }}
        onSubmit={handleSubmitBook}
        initialData={editingBook}
        isSubmitting={createBookMutation.isLoading || updateBookMutation.isLoading}
      />
    </div>
  );
};

export default BookBankPage;
