import { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import BookItem from '../../components/book-bank/BookItem';
import BookForm from '../../components/book-bank/BookForm';
import Button from '../../components/ui/Button';

// Mock data - replace with actual API calls
const mockBooks = [
  {
    id: '1',
    title: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen',
    isbn: '978-0262033848',
    edition: '3rd',
    condition: 'Good',
    price: 45.99,
    status: 'available',
    description: 'Comprehensive guide to algorithms and data structures.',
    seller: {
      id: 'user1',
      name: 'Alex Johnson',
      email: 'alex@example.com',
      rating: 4.8,
    },
    image: 'https://m.media-amazon.com/images/I/41vLer1KbmL._SY425_.jpg',
    postedDate: '2023-05-15T10:30:00Z',
  },
  {
    id: '2',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    isbn: '978-0132350884',
    edition: '1st',
    condition: 'Like New',
    price: 35.50,
    status: 'available',
    description: 'A must-read for any developer who wants to write clean, maintainable code.',
    seller: {
      id: 'user2',
      name: 'Sarah Williams',
      email: 'sarah@example.com',
      rating: 4.9,
    },
    image: 'https://m.media-amazon.com/images/I/41xShlnTZTL._SY425_.jpg',
    postedDate: '2023-06-01T14:15:00Z',
  },
  {
    id: '3',
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    isbn: '978-1449373320',
    edition: '1st',
    condition: 'Good',
    price: 42.75,
    status: 'sold',
    description: 'The big ideas behind reliable, scalable, and maintainable systems.',
    seller: {
      id: 'user3',
      name: 'Michael Chen',
      email: 'michael@example.com',
      rating: 4.7,
    },
    image: 'https://m.media-amazon.com/images/I/51ZSpMl1-2L._SY425_.jpg',
    postedDate: '2023-05-20T09:45:00Z',
  },
];

const fetchBooks = async () => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockBooks);
    }, 500);
  });
};

const BookBankPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    condition: 'all',
    sortBy: 'newest',
  });

  const { data: books = [], isLoading } = useQuery({
    queryKey: ['books'],
    queryFn: fetchBooks,
  });

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

  const handleSubmitBook = (newBook) => {
    console.log('New book submitted:', newBook);
    // In a real app, you would add the book to the database here
    setIsFormOpen(false);
  };

  const handlePurchase = (bookId) => {
    console.log('Purchase initiated for book:', bookId);
    // In a real app, you would handle the purchase flow here
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

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
      {sortedBooks.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sortedBooks.map((book) => (
            <BookItem
              key={book.id}
              book={book}
              onPurchase={handlePurchase}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white shadow rounded-lg">
          <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No books found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filters.status !== 'all' || filters.condition !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Be the first to list a book for sale.'}
          </p>
          <div className="mt-6">
            <Button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Sell a Book
            </Button>
          </div>
        </div>
      )}

      {/* Sell Book Form Modal */}
      <BookForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitBook}
      />
    </div>
  );
};

export default BookBankPage;
