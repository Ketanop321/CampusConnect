    import { Fragment, useState, useEffect } from 'react';
    import { Dialog, Transition } from '@headlessui/react';
    import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
    import { useForm } from 'react-hook-form';
    import { yupResolver } from '@hookform/resolvers/yup';
    import * as yup from 'yup';
    import { useAuth } from '../../context/AuthContext';

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
    image: yup.mixed().test('fileSize', 'File is too large (max 5MB)', (value) => {
        if (!value || !value[0]) return true;
        return value[0].size <= 5 * 1024 * 1024;
    }),
    contact_email: yup.string().email('Please enter a valid email'),
    contact_phone: yup.string(),
    });

    const BookForm = ({ isOpen, onClose, onSubmit, initialData, isSubmitting: propIsSubmitting }) => {
    const { user } = useAuth();
    const [preview, setPreview] = useState(initialData?.image || null);
    const [imageFile, setImageFile] = useState(null);
    
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        setValue,
        resetField,
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
        condition: 'good',
        contact_email: user?.email || '',
        contact_phone: user?.phone || '',
        ...initialData,
        },
    });

    const image = watch('image');
    const isEditMode = !!initialData;

    // Set up form with initial data
    useEffect(() => {
        if (initialData) {
        const { image, ...rest } = initialData;
        Object.entries(rest).forEach(([key, value]) => {
            setValue(key, value);
        });
        if (image) {
            setPreview(image);
        }
        }
    }, [initialData, setValue]);

    // Handle image preview
    useEffect(() => {
        if (!image || !image[0]) {
        if (!initialData?.image) setPreview(null);
        return;
        }

        const file = image[0];
        setImageFile(file);
        
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);

        // Free memory when component unmounts
        return () => URL.revokeObjectURL(objectUrl);
    }, [image, initialData]);

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (file) {
        setImageFile(file);
        setValue('image', event.target.files, { shouldValidate: true });
        }
    };

    const handleRemoveImage = () => {
        setPreview(null);
        setImageFile(null);
        resetField('image');
    };

    const handleFormSubmit = (data) => {
        const formData = new FormData();
        
        // Append all form data
        Object.entries(data).forEach(([key, value]) => {
        if (key === 'image' && value[0] instanceof File) {
            formData.append('image', value[0]);
        } else if (value !== null && value !== undefined) {
            formData.append(key, value);
        }
        });

        onSubmit(formData);
    };

    return (
        <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={onClose}>
            <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                    <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
                    <button
                        type="button"
                        className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                        onClick={onClose}
                        disabled={propIsSubmitting}
                    >
                        <span className="sr-only">Close</span>
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                    </div>
                    
                    <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                        <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                        {isEditMode ? 'Edit Book' : 'Sell a Book'}
                        </Dialog.Title>
                        
                        <div className="mt-5">
                        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4" id="book-form">
                            {/* Image Upload */}
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                {preview ? (
                                <div className="relative">
                                    <img
                                    src={preview}
                                    alt="Book cover preview"
                                    className="mx-auto h-48 w-auto object-cover rounded"
                                    />
                                    <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none"
                                    >
                                    <XMarkIcon className="h-4 w-4" />
                                    </button>
                                </div>
                                ) : (
                                <>
                                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
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
                                        onChange={handleFileChange}
                                        disabled={propIsSubmitting}
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

                            {/* Book Details */}
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
                                disabled={propIsSubmitting}
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
                                disabled={propIsSubmitting}
                                />
                                {errors.author && (
                                <p className="mt-1 text-sm text-red-600">{errors.author.message}</p>
                                )}
                            </div>

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
                                disabled={isEditMode || propIsSubmitting}
                                />
                                {errors.isbn && (
                                <p className="mt-1 text-sm text-red-600">{errors.isbn.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="edition" className="block text-sm font-medium text-gray-700">
                                Edition (Optional)
                                </label>
                                <input
                                type="text"
                                id="edition"
                                {...register('edition')}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder="e.g. 5th Edition"
                                disabled={propIsSubmitting}
                                />
                            </div>

                            <div>
                                <label htmlFor="condition" className="block text-sm font-medium text-gray-700">
                                Condition *
                                </label>
                                <select
                                id="condition"
                                {...register('condition')}
                                className={`mt-1 block w-full rounded-md border ${
                                    errors.condition ? 'border-red-300' : 'border-gray-300'
                                } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                                disabled={propIsSubmitting}
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
                                Price (₹) *
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">₹</span>
                                </div>
                                <input
                                    type="number"
                                    id="price"
                                    {...register('price')}
                                    className={`block w-full pl-7 pr-12 rounded-md ${
                                    errors.price ? 'border-red-300' : 'border-gray-300'
                                    } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    disabled={propIsSubmitting}
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
                            <textarea
                                id="description"
                                rows={4}
                                {...register('description')}
                                className={`mt-1 block w-full rounded-md border ${
                                errors.description ? 'border-red-300' : 'border-gray-300'
                                } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                                placeholder="Enter a detailed description of the book..."
                                disabled={propIsSubmitting}
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                            )}
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700">
                                Contact Email *
                                </label>
                                <input
                                type="email"
                                id="contact_email"
                                {...register('contact_email')}
                                className={`mt-1 block w-full rounded-md border ${
                                    errors.contact_email ? 'border-red-300' : 'border-gray-300'
                                } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                                placeholder="your@email.com"
                                disabled={propIsSubmitting}
                                />
                                {errors.contact_email && (
                                <p className="mt-1 text-sm text-red-600">{errors.contact_email.message}</p>
                                )}
                            </div>
                            
                            <div>
                                <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700">
                                Contact Phone (Optional)
                                </label>
                                <input
                                type="tel"
                                id="contact_phone"
                                {...register('contact_phone')}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder="+91 98765 43210"
                                disabled={propIsSubmitting}
                                />
                            </div>
                            </div>
                            
                            <div className="mt-6 flex items-center justify-end space-x-3">
                            <button
                                type="button"
                                className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                                onClick={onClose}
                                disabled={propIsSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                                disabled={propIsSubmitting}
                            >
                                {propIsSubmitting ? (
                                <div className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {isEditMode ? 'Updating...' : 'Listing...'}
                                </div>
                                ) : isEditMode ? (
                                'Update Book'
                                ) : (
                                'List Book for Sale'
                                )}
                            </button>
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
        </Transition.Root>
    );
    };

    export default BookForm;
