import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Button from '../ui/Button';

const statusOptions = [
  { value: 'lost', label: 'Lost' },
  { value: 'found', label: 'Found' },
];

const categoryOptions = [
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Bags', label: 'Bags' },
  { value: 'Clothing', label: 'Clothing' },
  { value: 'Personal Items', label: 'Personal Items' },
  { value: 'Accessories', label: 'Accessories' },
  { value: 'Documents', label: 'Documents' },
  { value: 'Other', label: 'Other' },
];

const schema = yup.object().shape({
  itemName: yup.string().required('Item name is required'),
  status: yup.string().required('Status is required').oneOf(['lost', 'found']),
  category: yup.string().required('Category is required'),
  location: yup.string().required('Location is required'),
  date: yup.date().required('Date is required').max(new Date(), 'Date cannot be in the future'),
  description: yup.string().required('Description is required'),
  contact: yup
    .string()
    .email('Please enter a valid email')
    .required('Contact email is required'),
  image: yup.mixed().test('fileSize', 'File is too large', (value) => {
    if (!value || !value[0]) return true; // Skip validation if no file
    return value[0].size <= 5 * 1024 * 1024; // 5MB
  }),
});

const LostFoundForm = ({ isOpen, onClose, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      status: 'lost',
      date: new Date().toISOString().split('T')[0],
    },
  });

  const status = watch('status');
  const image = watch('image');

  // Create preview for image
  useEffect(() => {
    if (!image || !image[0]) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(image[0]);
    setPreview(objectUrl);

    // Free memory when component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  const handleFormSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      // In a real app, you would upload the image to a storage service
      // and get back a URL to store in your database
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'image' && value[0]) {
          formData.append('image', value[0]);
        } else if (key !== 'image') {
          formData.append(key, value);
        }
      });
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Call the onSubmit prop with form data
      onSubmit({
        ...data,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        image: preview || 'https://via.placeholder.com/400x200?text=No+Image',
      });
      
      // Reset form and close modal
      reset();
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={onClose}>
        <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">
            &#8203;
          </span>
          
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block w-full transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:max-w-2xl sm:p-6 sm:align-middle">
              <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
                <button
                  type="button"
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={onClose}
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    {status === 'lost' ? 'Report a Lost Item' : 'Report a Found Item'}
                  </Dialog.Title>
                  
                  <div className="mt-5">
                    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                            Status *
                          </label>
                          <select
                            id="status"
                            {...register('status')}
                            className={`mt-1 block w-full rounded-md border ${
                              errors.status ? 'border-red-300' : 'border-gray-300'
                            } py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm`}
                          >
                            {statusOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          {errors.status && (
                            <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                          )}
                        </div>
                        
                        <div>
                          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                            Category *
                          </label>
                          <select
                            id="category"
                            {...register('category')}
                            className={`mt-1 block w-full rounded-md border ${
                              errors.category ? 'border-red-300' : 'border-gray-300'
                            } py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm`}
                          >
                            <option value="">Select a category</option>
                            {categoryOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          {errors.category && (
                            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="itemName" className="block text-sm font-medium text-gray-700">
                          Item Name *
                        </label>
                        <input
                          type="text"
                          id="itemName"
                          {...register('itemName')}
                          className={`mt-1 block w-full rounded-md border ${
                            errors.itemName ? 'border-red-300' : 'border-gray-300'
                          } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                          placeholder="e.g., Black Backpack, iPhone 13, etc."
                        />
                        {errors.itemName && (
                          <p className="mt-1 text-sm text-red-600">{errors.itemName.message}</p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                            Location *
                          </label>
                          <input
                            type="text"
                            id="location"
                            {...register('location')}
                            className={`mt-1 block w-full rounded-md border ${
                              errors.location ? 'border-red-300' : 'border-gray-300'
                            } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                            placeholder="e.g., Library, Room 205, etc."
                          />
                          {errors.location && (
                            <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                          )}
                        </div>
                        
                        <div>
                          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                            Date *
                          </label>
                          <input
                            type="date"
                            id="date"
                            {...register('date')}
                            className={`mt-1 block w-full rounded-md border ${
                              errors.date ? 'border-red-300' : 'border-gray-300'
                            } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                          />
                          {errors.date && (
                            <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          Description *
                        </label>
                        <div className="mt-1">
                          <textarea
                            id="description"
                            rows={3}
                            {...register('description')}
                            className={`block w-full rounded-md border ${
                              errors.description ? 'border-red-300' : 'border-gray-300'
                            } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                            placeholder="Provide a detailed description of the item..."
                            defaultValue={''}
                          />
                        </div>
                        {errors.description && (
                          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="contact" className="block text-sm font-medium text-gray-700">
                          Contact Email *
                        </label>
                        <input
                          type="email"
                          id="contact"
                          {...register('contact')}
                          className={`mt-1 block w-full rounded-md border ${
                            errors.contact ? 'border-red-300' : 'border-gray-300'
                          } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                          placeholder="your.email@example.com"
                        />
                        {errors.contact && (
                          <p className="mt-1 text-sm text-red-600">{errors.contact.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Item Photo</label>
                        <div className="mt-1 flex items-center">
                          <label
                            htmlFor="image-upload"
                            className="cursor-pointer rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                          >
                            Choose File
                          </label>
                          <input
                            id="image-upload"
                            name="image-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            {...register('image')}
                          />
                          <span className="ml-2 text-sm text-gray-500">
                            {image && image[0] ? image[0].name : 'No file chosen'}
                          </span>
                        </div>
                        {errors.image && (
                          <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>
                        )}
                        {preview && (
                          <div className="mt-2">
                            <img
                              src={preview}
                              alt="Preview"
                              className="h-32 w-32 object-cover rounded-md"
                            />
                          </div>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                          Upload a clear photo of the item (max 5MB)
                        </p>
                      </div>
                      
                      <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                        <Button
                          type="submit"
                          variant="primary"
                          className="w-full justify-center sm:col-start-2"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit Report'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-3 w-full justify-center sm:col-start-1 sm:mt-0"
                          onClick={onClose}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default LostFoundForm;
