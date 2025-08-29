import React, { useState, useMemo } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import LostFoundItem from '../../components/lost-found/LostFoundItem';
import LostFoundForm from '../../components/lost-found/LostFoundForm';
import Button from '../../components/ui/Button';
import lostFoundService from '../../services/lostFoundService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// Helper function to format date for input field
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

const LostAndFoundPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Fetch all lost and found items
  const { data: response, isLoading, error, refetch, isError } = useQuery({
    queryKey: ['lostFoundItems'],
    queryFn: () => lostFoundService.getLostFoundItems(),
    retry: 2,
    refetchOnWindowFocus: false,
  });
  
  // Extract items from response, handling different possible response formats
  const items = React.useMemo(() => {
    if (!response) return [];
    // Handle different possible response formats
    if (Array.isArray(response)) return response;
    if (response?.results) return response.results;
    if (response?.data) return Array.isArray(response.data) ? response.data : [response.data];
    return [];
  }, [response]);
  
  // Filter items based on search and filters
  const filteredItems = React.useMemo(() => {
    if (!Array.isArray(items)) return [];
    
    return items.filter((item) => {
      if (!item) return false;
      
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        (item.item_name?.toLowerCase().includes(searchLower) ||
         item.description?.toLowerCase().includes(searchLower) ||
         searchLower === '');
      
      const matchesStatus = 
        filterStatus === 'all' || 
        item.status?.toLowerCase() === filterStatus.toLowerCase();
      
      const matchesCategory = 
        filterCategory === 'all' || 
        item.category?.toLowerCase() === filterCategory.toLowerCase();
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [items, searchTerm, filterStatus, filterCategory]);
  
  // Log for debugging
  console.log('API Response:', response);
  console.log('Processed items:', items);
  console.log('Filtered items:', filteredItems);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (itemData) => {
      return lostFoundService.createLostFoundItem(itemData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['lostFoundItems']);
      toast.success('Item created successfully');
      setIsFormOpen(false);
    },
    onError: (error) => {
      console.error('Create item error:', error);
      toast.error(error.response?.data?.detail || error.message || 'Failed to create item');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => {
      return lostFoundService.updateLostFoundItem(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['lostFoundItems']);
      toast.success('Item updated successfully');
      setIsFormOpen(false);
      setEditingItem(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to update item');
    },
  });

  // Claim mutation
  const claimMutation = useMutation({
    mutationFn: (id) => lostFoundService.claimItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['lostFoundItems']);
      toast.success('Item claimed successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to claim item');
    },
  });

  // Mark as found mutation
  const markAsFoundMutation = useMutation({
    mutationFn: (id) => lostFoundService.markAsFound(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['lostFoundItems']);
      toast.success('Item marked as found');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to update item status');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => {
      return lostFoundService.deleteLostFoundItem(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['lostFoundItems']);
      toast.success('Item deleted successfully');
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete item');
    },
  });

  // Filter items based on search and filters will be done in the render section

  const handleSubmitItem = async (formData) => {
  try {
    // Format the date to include time in ISO format
    const formatDateWithTime = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      // Set time to noon to avoid timezone issues
      date.setHours(12, 0, 0, 0);
      return date.toISOString();
    };

    // Map frontend form fields to backend expected field names
    const itemData = {
      item_name: formData.item_name,
      description: formData.description,
      status: formData.status,
      location: formData.location,
      date_occurred: formatDateWithTime(formData.date_occurred),
      category: formData.category,
      contact_info: formData.contact_info,
      image: formData.image?.[0] || null,
    };

    if (editingItem) {
      await updateMutation.mutateAsync({ id: editingItem.id, ...itemData });
    } else {
      await createMutation.mutateAsync(itemData);
    }
  } catch (error) {
    console.error('Error submitting item:', error);
    toast.error(
      error?.response?.data?.detail || error?.message || 'Failed to submit item. Please try again.'
    );
  }
};

  const handleEditItem = (item) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleClaimItem = async (itemId) => {
    try {
      await claimMutation.mutateAsync(itemId);
    } catch (error) {
      console.error('Error claiming item:', error);
    }
  };

  const handleMarkAsFound = async (itemId) => {
    try {
      await markAsFoundMutation.mutateAsync(itemId);
    } catch (error) {
      console.error('Error marking item as found:', error);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  // Skeleton Loader Component
  const SkeletonLoader = () => (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
          <div className="h-48 bg-gray-200"></div>
          <div className="p-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-100 rounded w-1/2 mb-4"></div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="h-3 bg-gray-100 rounded w-1/4"></div>
              <span>•</span>
              <div className="h-3 bg-gray-100 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-100 rounded w-1/2 mb-8"></div>
          <SkeletonLoader />
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Error in LostAndFoundPage:', error);
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Error loading items</h3>
          <p className="mt-1 text-sm text-gray-500">
            {error.response?.data?.detail || error.message || 'Failed to load lost and found items. Please try again.'}
          </p>
          <div className="mt-6">
            <Button
              onClick={() => refetch()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Lost & Found</h1>
          <p className="mt-2 text-sm text-gray-700">
            Browse lost and found items or report a lost/found item.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-4">
          <Button
            type="button"
            onClick={() => {
              setEditingItem(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Report Item
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              Search by name or description
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
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Filter by Status
            </label>
            <select
              id="status"
              name="status"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="lost">Lost</option>
              <option value="found">Found</option>
              <option value="claimed">Claimed</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="category"
              name="category"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Bags">Bags</option>
              <option value="Clothing">Clothing</option>
              <option value="Personal Items">Personal Items</option>
              <option value="Accessories">Accessories</option>
              <option value="Documents">Documents</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="mt-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Loading items...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="mt-2 text-lg font-medium text-gray-900">Error loading items</h3>
            <p className="mt-1 text-sm text-gray-500">
              {error?.response?.data?.detail || error.message || 'Failed to load items. Please try again.'}
            </p>
            <div className="mt-6">
              <Button
                onClick={() => refetch()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" />
                Retry
              </Button>
            </div>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="h-full">
                <LostFoundItem
                  item={item}
                  onClaim={handleClaimItem}
                  onMarkAsFound={handleMarkAsFound}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                  currentUserId={user?.id}
                  isAdmin={user?.is_staff}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100">
              <svg
                className="h-8 w-8 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No items found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchTerm || filterStatus !== 'all' || filterCategory !== 'all'
                ? 'No items match your search criteria. Try adjusting your filters.'
                : 'Be the first to report a lost or found item.'}
            </p>
            <div className="mt-6">
              <Button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterCategory('all');
                  setIsFormOpen(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Report Item
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Report Item Form Modal */}
      <LostFoundForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleSubmitItem}
        initialData={editingItem ? {
          item_name: editingItem.item_name,
          status: editingItem.status,
          category: editingItem.category,
          location: editingItem.location,
          date_occurred: formatDateForInput(editingItem.date_occurred),
          description: editingItem.description,
          contact_info: editingItem.contact_info,
        } : undefined}
        isSubmitting={createMutation.isLoading || updateMutation.isLoading}
      />
    </div>
  );
};

export default LostAndFoundPage;
