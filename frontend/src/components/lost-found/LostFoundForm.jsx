import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Button from '../ui/Button';
import { toast } from 'react-toastify';

// Remove any OpenClosedContext if it's not being used

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
  item_name: yup.string().required('Item name is required'),
  status: yup.string().required('Status is required').oneOf(['lost', 'found']),
  category: yup.string().required('Category is required'),
  location: yup.string().required('Location is required'),
  date_occurred: yup.date().required('Date is required').max(new Date(), 'Date cannot be in the future'),
  description: yup.string().required('Description is required'),
  contact_info: yup
    .string()
    .email('Please enter a valid email')
    .required('Contact email is required'),
  image: yup
    .mixed()
    .test('fileSize', 'File size is too large (max 5MB)', (value) => {
      if (!value || !value[0]) return true; // Skip if no file
      return value[0].size <= 5 * 1024 * 1024; // 5MB
    })
    .test('fileType', 'Unsupported file type', (value) => {
      if (!value || !value[0]) return true; // Skip if no file
      return ['image/jpeg', 'image/png', 'image/webp'].includes(value[0].type);
    }),
});

const LostFoundForm = ({ isOpen, onClose, onSubmit, initialData, isSubmitting: isSubmittingProp }) => {
  const [preview, setPreview] = useState(null);
  const [isImageRemoved, setIsImageRemoved] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    trigger,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialData || {
      status: 'lost',
      date_occurred: new Date().toISOString().split('T')[0],
    },
  });

  const status = watch('status');
  const image = watch('image');
  const currentImage = watch('currentImage');

  // Set initial values when form opens or initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        // Convert backend field names to form field names if needed
        item_name: initialData.itemName || initialData.item_name,
        contact_info: initialData.contact || initialData.contact_info,
        date_occurred: initialData.date || initialData.date_occurred,
        currentImage: initialData.image,
      });
      
      if (initialData.image && !initialData.image.startsWith('data:')) {
        setPreview(initialData.image);
      } else if (initialData.image) {
        setPreview(initialData.image);
      }
    } else {
      reset({
        status: 'lost',
        date_occurred: new Date().toISOString().split('T')[0],
      });
    }
    
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [initialData, isOpen, reset]);

  // Create preview for image
  useEffect(() => {
    if (!image || !image[0]) {
      if (!currentImage) {
        setPreview(null);
      }
      return;
    }

    const objectUrl = URL.createObjectURL(image[0]);
    setPreview(objectUrl);
    setIsImageRemoved(false);

    // Free memory when component unmounts or image changes
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [image, currentImage]);

  const handleFormSubmit = async (data) => {
    try {
      // If no new image is selected but there was a previous image, keep the existing one
      if (!data.image?.[0] && currentImage && !isImageRemoved) {
        data.image = currentImage;
      }
      
      // If image was removed, ensure we don't send the old image
      if (isImageRemoved && !data.image?.[0]) {
        data.image = null;
      }
      
      // If there's a new image, prepare it for upload
      if (data.image?.[0] && data.image[0] instanceof File) {
        // The image will be handled by FormData in the service
      }
      
      // Call the onSubmit prop with form data
      await onSubmit(data);
      
      // Reset form if this is not an edit
      if (!initialData) {
        reset({
          status: 'lost',
          date_occurred: new Date().toISOString().split('T')[0],
        });
        setPreview(null);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error.message || 'Failed to submit form');
    }
  };
  
  const handleRemoveImage = () => {
    setValue('image', null);
    setValue('currentImage', null);
    setPreview(null);
    setIsImageRemoved(true);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
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
                          <label htmlFor="item_name" className="block text-sm font-medium text-gray-700">
                            Item Name *
                          </label>
                          <input
                            type="text"
                            id="item_name"
                            {...register('item_name')}
                            className={`mt-1 block w-full rounded-md border ${
                              errors.item_name ? 'border-red-300' : 'border-gray-300'
                            } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                            placeholder="e.g., Black Backpack, iPhone 13, etc."
                          />
                          {errors.item_name && (
                            <p className="mt-1 text-sm text-red-600">{errors.item_name.message}</p>
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
                            <label htmlFor="date_occurred" className="block text-sm font-medium text-gray-700">
                              Date *
                            </label>
                            <input
                              type="date"
                              id="date_occurred"
                              {...register('date_occurred')}
                              className={`mt-1 block w-full rounded-md border ${
                                errors.date_occurred ? 'border-red-300' : 'border-gray-300'
                              } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                            />
                            {errors.date_occurred && (
                              <p className="mt-1 text-sm text-red-600">{errors.date_occurred.message}</p>
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
                          <label htmlFor="contact_info" className="block text-sm font-medium text-gray-700">
                            Contact Email *
                          </label>
                          <input
                            type="email"
                            id="contact_info"
                            {...register('contact_info')}
                            className={`mt-1 block w-full rounded-md border ${
                              errors.contact_info ? 'border-red-300' : 'border-gray-300'
                            } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                            placeholder="your.email@example.com"
                          />
                          {errors.contact_info && (
                            <p className="mt-1 text-sm text-red-600">{errors.contact_info.message}</p>
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
                            disabled={isSubmittingProp}
                          >
                            {isSubmittingProp ? 'Submitting...' : 'Submit Report'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="mt-3 w-full justify-center sm:col-start-1 sm:mt-0"
                            onClick={onClose}
                            disabled={isSubmittingProp}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default LostFoundForm;
