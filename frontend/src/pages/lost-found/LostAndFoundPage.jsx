import { useState } from 'react';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
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
  const { user, token } = useAuth();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Fetch all lost and found items
  const { data: itemsData, isLoading, error } = useQuery({
    queryKey: ['lostFoundItems'],
    queryFn: lostFoundService.getLostFoundItems,
  });
  
  // Ensure items is always an array
  const items = Array.isArray(itemsData) ? itemsData : [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (itemData) => lostFoundService.createLostFoundItem(itemData, token),
    onSuccess: () => {
      queryClient.invalidateQueries(['lostFoundItems']);
      toast.success('Item created successfully');
      setIsFormOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to create item');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => lostFoundService.updateLostFoundItem(id, data, token),
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
    mutationFn: (id) => lostFoundService.claimItem(id, token),
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
    mutationFn: (id) => lostFoundService.markAsFound(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries(['lostFoundItems']);
      toast.success('Item marked as found');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to update item status');
    },
  });

  // Filter items based on search and filters
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleSubmitItem = async (formData) => {
  try {
    // Map frontend form fields to backend expected field names
    const itemData = {
      item_name: formData.item_name,
      description: formData.description,
      status: formData.status,
      location: formData.location,
      date_occurred: formData.date_occurred,
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error loading lost and found items. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Lost & Found</h1>
          <p className="mt-2 text-sm text-gray-700">
            Browse lost and found items or report a lost/found item.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Report Item
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
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
                placeholder="Search items..."
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
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
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
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <LostFoundItem
              key={item.id}
              item={item}
              onClaim={handleClaimItem}
              onMarkAsFound={handleMarkAsFound}
              onEdit={handleEditItem}
              currentUserId={user?.id}
              isAdmin={user?.is_staff}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white shadow rounded-lg">
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">No items found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterStatus !== 'all' || filterCategory !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Be the first to report a lost or found item.'}
          </p>
          <div className="mt-6">
            <Button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Report Item
            </Button>
          </div>
        </div>
      )}

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
