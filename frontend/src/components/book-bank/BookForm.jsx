import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Button from '../ui/Button';

const conditionOptions = [
  { value: 'new', label: 'New' },
  { value: 'like new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

const schema = yup.object().shape({
  title: yup.string().required('Title is required'),
  author: yup.string().required('Author is required'),
  isbn: yup
    .string()
    .matches(/^(\d{10}|\d{13})$/, 'ISBN must be 10 or 13 digits')
    .required('ISBN is required'),
  edition: yup.string(),
  condition: yup.string().required('Condition is required'),
  price: yup
    .number()
    .typeError('Price must be a number')
    .positive('Price must be greater than 0')
    .required('Price is required'),
  description: yup.string().required('Description is required'),
  image: yup.mixed().test('fileSize', 'File is too large', (value) => {
    if (!value || !value[0]) return true; // Skip validation if no file
    return value[0].size <= 5 * 1024 * 1024; // 5MB
  }),
});

const BookForm = ({ isOpen, onClose, onSubmit }) => {
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
      condition: 'good',
    },
  });

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
        status: 'available',
        seller: {
          id: 'current-user-id', // In a real app, this would come from auth context
          name: 'Current User',
          email: 'user@example.com',
          rating: 5.0,
        },
        postedDate: new Date().toISOString(),
        image: preview || 'https://via.placeholder.com/200x300?text=No+Image',
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
                  disabled={isSubmitting}
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Sell a Book
                  </Dialog.Title>
                  
                  <div className="mt-5">
                    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                            Title *
                          </label>
                          <input
                            type="text"
                            id="title"
                            {...register('title')}
                            className={`mt-1 block w-full rounded-md border ${
                              errors.title ? 'border-red-300' : 'border-gray-300'
                            } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                            placeholder="Book Title"
                          />
                          {errors.title && (
                            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                          )}
                        </div>
                        
                        <div>
                          <label htmlFor="author" className="block text-sm font-medium text-gray-700">
                            Author *
                          </label>
                          <input
                            type="text"
                            id="author"
                            {...register('author')}
                            className={`mt-1 block w-full rounded-md border ${
                              errors.author ? 'border-red-300' : 'border-gray-300'
                            } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                            placeholder="Author Name"
                          />
                          {errors.author && (
                            <p className="mt-1 text-sm text-red-600">{errors.author.message}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="isbn" className="block text-sm font-medium text-gray-700">
                            ISBN *
                          </label>
                          <input
                            type="text"
                            id="isbn"
                            {...register('isbn')}
                            className={`mt-1 block w-full rounded-md border ${
                              errors.isbn ? 'border-red-300' : 'border-gray-300'
                            } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                            placeholder="10 or 13 digit ISBN"
                          />
                          {errors.isbn && (
                            <p className="mt-1 text-sm text-red-600">{errors.isbn.message}</p>
                          )}
                        </div>
                        
                        <div>
                          <label htmlFor="edition" className="block text-sm font-medium text-gray-700">
                            Edition (optional)
                          </label>
                          <input
                            type="text"
                            id="edition"
                            {...register('edition')}
                            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="e.g., 3rd, 5th, etc."
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="condition" className="block text-sm font-medium text-gray-700">
                            Condition *
                          </label>
                          <select
                            id="condition"
                            {...register('condition')}
                            className={`mt-1 block w-full rounded-md border ${
                              errors.condition ? 'border-red-300' : 'border-gray-300'
                            } py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm`}
                          >
                            {conditionOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          {errors.condition && (
                            <p className="mt-1 text-sm text-red-600">{errors.condition.message}</p>
                          )}
                        </div>
                        
                        <div>
                          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                            Price ($) *
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <input
                              type="text"
                              id="price"
                              {...register('price')}
                              className={`block w-full rounded-md border ${
                                errors.price ? 'border-red-300' : 'border-gray-300'
                              } pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                              placeholder="0.00"
                            />
                          </div>
                          {errors.price && (
                            <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
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
                            placeholder="Describe the book's condition, any highlights or notes, and why you're selling it..."
                          />
                        </div>
                        {errors.description && (
                          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Book Cover</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                          <div className="space-y-1 text-center">
                            {preview ? (
                              <div className="mt-2">
                                <img
                                  src={preview}
                                  alt="Book cover preview"
                                  className="h-32 w-auto mx-auto"
                                />
                                <button
                                  type="button"
                                  onClick={() => setValue('image', null)}
                                  className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
                                >
                                  Change image
                                </button>
                              </div>
                            ) : (
                              <>
                                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600">
                                  <label
                                    htmlFor="image-upload"
                                    className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                                  >
                                    <span>Upload a file</span>
                                    <input
                                      id="image-upload"
                                      name="image-upload"
                                      type="file"
                                      className="sr-only"
                                      accept="image/*"
                                      {...register('image')}
                                    />
                                  </label>
                                  <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                              </>
                            )}
                          </div>
                        </div>
                        {errors.image && (
                          <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>
                        )}
                      </div>
                      
                      <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                        <Button
                          type="submit"
                          variant="primary"
                          className="w-full justify-center sm:col-start-2"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Submitting...' : 'List Book for Sale'}
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

export default BookForm;
