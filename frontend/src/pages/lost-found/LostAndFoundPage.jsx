import { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import LostFoundItem from '../../components/lost-found/LostFoundItem';
import LostFoundForm from '../../components/lost-found/LostFoundForm';
import Button from '../../components/ui/Button';
import { useQuery } from '@tanstack/react-query';

// Mock data - replace with actual API calls
const mockItems = [
  {
    id: '1',
    itemName: 'Black Backpack',
    description: 'Nike black backpack with a laptop compartment',
    location: 'Library, 2nd floor',
    date: '2023-06-15T10:30:00Z',
    status: 'found',
    category: 'Bags',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    contact: 'john@example.com',
    createdAt: '2023-06-15T10:35:00Z',
  },
  {
    id: '2',
    itemName: 'Silver Water Bottle',
    description: 'Hydro Flask 32oz, silver color with some stickers',
    location: 'Student Center, near Starbucks',
    date: '2023-06-16T14:15:00Z',
    status: 'lost',
    category: 'Personal Items',
    image: 'https://images.unsplash.com/photo-1602143407151-a6214b1cc5f2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    contact: 'sarah@example.com',
    createdAt: '2023-06-16T15:30:00Z',
  },
  {
    id: '3',
    itemName: 'Wireless Earbuds',
    description: 'Apple AirPods Pro with case',
    location: 'Engineering Building, Room 205',
    date: '2023-06-17T09:45:00Z',
    status: 'found',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1738&q=80',
    contact: 'lostandfound@campus.edu',
    createdAt: '2023-06-17T10:15:00Z',
  },
];

const fetchLostFoundItems = async () => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockItems);
    }, 500);
  });
};

const LostAndFoundPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['lostFoundItems'],
    queryFn: fetchLostFoundItems,
  });

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleSubmitItem = (newItem) => {
    console.log('New item submitted:', newItem);
    // In a real app, you would add the item to the database here
    setIsFormOpen(false);
  };

  const handleClaimItem = (itemId) => {
    console.log('Item claimed:', itemId);
    // In a real app, you would update the item status in the database here
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
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitItem}
      />
    </div>
  );
};

export default LostAndFoundPage;
