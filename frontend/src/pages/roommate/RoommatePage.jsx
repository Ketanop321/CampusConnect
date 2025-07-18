import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { getRoommatePosts } from '../../services/roommateService';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
};

const RoommatePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    location: '',
    minRent: '',
    maxRent: '',
    roomType: '',
    preferredGender: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await getRoommatePosts();
      // Handle paginated response (results array) or direct array response
      setPosts(Array.isArray(response) ? response : (response.results || []));
      setError(null);
    } catch (error) {
      console.error('Error fetching roommate posts:', error);
      setError('Failed to load posts. Please try again later.');
      setPosts([]); // Ensure posts is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Filter posts based on search and filters
  const filteredPosts = Array.isArray(posts) ? posts.filter(post => {
    if (!post) return false;
    
    // Location search
    const searchTerm = (filters.location || '').toLowerCase();
    const postTitle = (post.title || '').toLowerCase();
    const postDescription = (post.description || '').toLowerCase();
    const postLocation = (post.location || '').toLowerCase();
    
    const matchesSearch = !searchTerm || 
      postTitle.includes(searchTerm) || 
      postDescription.includes(searchTerm) ||
      postLocation.includes(searchTerm);
    
    // Numeric filters
    const postRent = parseFloat(post.rent) || 0;
    const matchesMinRent = !filters.minRent || postRent >= parseFloat(filters.minRent);
    const matchesMaxRent = !filters.maxRent || postRent <= parseFloat(filters.maxRent);
    
    // Exact match filters
    const matchesRoomType = !filters.roomType || post.room_type === filters.roomType;
    const matchesGender = !filters.preferredGender || post.preferred_gender === filters.preferredGender;
    
    return matchesSearch && matchesMinRent && matchesMaxRent && 
           matchesRoomType && matchesGender;
  }) : [];

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
              <p className="text-sm text-red-700">Error loading posts. Please try again later.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Find a Roommate</h1>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={toggleFilters} className="flex items-center">
            <FunnelIcon className="h-4 w-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Filters'}
          </Button>
          <Button asChild className="flex items-center">
            <Link to="/roommate/new" className="flex items-center">
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Post
            </Link>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="Search by location..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label htmlFor="minRent" className="block text-sm font-medium text-gray-700 mb-1">
                  Min Rent ($)
                </label>
                <input
                  type="number"
                  name="minRent"
                  id="minRent"
                  value={filters.minRent}
                  onChange={handleFilterChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Min"
                />
              </div>
              <div>
                <label htmlFor="maxRent" className="block text-sm font-medium text-gray-700 mb-1">
                  Max Rent ($)
                </label>
                <input
                  type="number"
                  name="maxRent"
                  id="maxRent"
                  value={filters.maxRent}
                  onChange={handleFilterChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Max"
                />
              </div>
              <div>
                <label htmlFor="roomType" className="block text-sm font-medium text-gray-700 mb-1">
                  Room Type
                </label>
                <select
                  id="roomType"
                  name="roomType"
                  value={filters.roomType}
                  onChange={handleFilterChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Any</option>
                  <option value="private">Private Room</option>
                  <option value="shared">Shared Room</option>
                  <option value="apartment">Entire Apartment</option>
                </select>
              </div>
              <div>
                <label htmlFor="preferredGender" className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Gender
                </label>
                <select
                  id="preferredGender"
                  name="preferredGender"
                  value={filters.preferredGender}
                  onChange={handleFilterChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Any</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Roommate Posts Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No posts found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.location || filters.minRent || filters.maxRent || filters.roomType || filters.preferredGender
                ? 'Try adjusting your search or filter criteria.'
                : 'There are currently no posts.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 hover:shadow-md transition-shadow duration-200">
                {post.images && post.images.length > 0 && (
                  <div className="h-48 bg-gray-100 overflow-hidden">
                    <img
                      src={post.images[0].image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{post.title || 'No Title'}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {post.rent ? formatCurrency(post.rent) + '/mo' : 'Price not set'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {post.description || 'No description provided.'}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <span className="inline-block h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 font-medium flex items-center justify-center">
                          {post.user?.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="ml-2">
                        <p className="text-sm font-medium text-gray-900">
                          {post.user?.name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {post.location || 'Location not specified'}
                        </p>
                      </div>
                    </div>
                    <Link
                      to={`/roommate/${post.id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoommatePage;
