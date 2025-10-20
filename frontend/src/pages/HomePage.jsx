import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const features = [
  {
    name: 'Lost & Found',
    description: 'Report lost items or help others find their belongings on campus.',
    icon: '🔍',
    path: '/lost-found',
    color: 'from-purple-500 to-indigo-600',
    hoverColor: 'hover:from-purple-600 hover:to-indigo-700'
  },
  {
    name: 'Book Bank',
    description: 'Borrow, lend, or exchange textbooks with fellow students.',
    icon: '📚',
    path: '/book-bank',
    color: 'from-amber-500 to-orange-500',
    hoverColor: 'hover:from-amber-600 hover:to-orange-600'
  },
  {
    name: 'Campus Connect',
    description: 'Connect with other students, join study groups, and more.',
    icon: '👥',
    path: '/connect',
    color: 'from-emerald-500 to-teal-600',
    hoverColor: 'hover:from-emerald-600 hover:to-teal-700'
  },
  {
    name: 'Notice Board',
    description: 'Stay updated with the latest campus news and events.',
    icon: '📌',
    path: '/noticeboard',
    color: 'from-rose-500 to-pink-600',
    hoverColor: 'hover:from-rose-600 hover:to-pink-700'
  },
];

const testimonials = [
  {
    quote: "CampusConnect made it so easy to find my lost wallet. The community is amazing!",
    author: "Alex Johnson",
    role: "Computer Science Student"
  },
  {
    quote: "The Book Bank feature saved me hundreds on textbooks this semester. Highly recommended!",
    author: "Sarah Miller",
    role: "Engineering Student"
  },
  {
    quote: "I've met so many great study partners through CampusConnect. It's transformed my college experience.",
    author: "David Kim",
    role: "Business Major"
  }
];

const stats = [
  { label: 'Active Users', value: '10,000+' },
  { label: 'Items Reunited', value: '5,000+' },
  { label: 'Books Shared', value: '8,000+' },
  { label: 'Happy Students', value: '15,000+' },
];

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    // Add subscription logic here
    setIsSubscribed(true);
    setEmail('');
    setTimeout(() => setIsSubscribed(false), 3000);
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-900 to-indigo-700 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
              <span className="block">Welcome to</span>
              <span className="block text-indigo-200">CampusConnect</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-indigo-100 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Your one-stop platform for campus life. Connect with fellow students, find lost items,
              exchange textbooks, and make the most of your university experience.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              {!isAuthenticated ? (
                <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/register"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 md:py-4 md:text-lg md:px-10 transition-all duration-300 shadow-lg"
                    >
                      Get Started
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/login"
                      className="mt-3 w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-500 bg-opacity-60 hover:bg-opacity-70 md:py-4 md:text-lg md:px-10 md:mt-0 transition-all duration-300"
                    >
                      Sign In
                    </Link>
                  </motion.div>
                </>
              ) : (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/lost-found"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 md:py-4 md:text-lg md:px-10 transition-all duration-300 shadow-lg"
                  >
                    Explore Features
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80')] bg-cover bg-center opacity-50"></div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-lg font-semibold text-indigo-600">Features</h2>
            <p className="mt-2 text-3xl font-bold leading-8 tracking-tight text-gray-900 sm:text-4xl">
              Everything you need for campus life
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              CampusConnect brings together all the essential services for students in one place.
            </p>
          </div>

          <div className="mt-16">
            <motion.div 
              initial="hidden" 
              whileInView="show" 
              viewport={{ once: true }}
              variants={container}
              className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
            >
              {features.map((feature, index) => (
                <motion.div 
                  key={feature.name}
                  variants={item}
                  className="group relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:border-indigo-500 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-br {feature.color} text-white text-xl">
                    {feature.icon}
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900 group-hover:text-indigo-600">
                    {feature.name}
                  </h3>
                  <p className="mt-2 text-base text-gray-500">{feature.description}</p>
                  <span className="absolute right-4 top-4 text-gray-300 group-hover:text-indigo-500">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <p className="text-4xl font-extrabold text-indigo-600">{stat.value}</p>
                <p className="mt-2 text-sm font-medium text-gray-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              What students are saying
            </h2>
          </div>
          
          <div className="mt-12">
            <div className="relative max-w-3xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index === currentTestimonial ? 50 : -50 }}
                  animate={{ 
                    opacity: index === currentTestimonial ? 1 : 0,
                    x: index === currentTestimonial ? 0 : (index < currentTestimonial ? -50 : 50),
                    display: index === currentTestimonial ? 'block' : 'none'
                  }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <blockquote>
                    <p className="text-xl font-medium text-gray-900">"{testimonial.quote}"</p>
                    <footer className="mt-4">
                      <p className="text-base font-semibold text-indigo-600">{testimonial.author}</p>
                      <p className="text-base text-gray-500">{testimonial.role}</p>
                    </footer>
                  </blockquote>
                </motion.div>
              ))}
              
              <div className="mt-8 flex justify-center space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`h-3 w-3 rounded-full transition-colors ${index === currentTestimonial ? 'bg-indigo-600' : 'bg-gray-300'}`}
                    aria-label={`View testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-indigo-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center">
          <div className="lg:w-0 lg:flex-1">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Stay updated with campus life
            </h2>
            <p className="mt-3 max-w-3xl text-lg leading-6 text-indigo-200">
              Subscribe to our newsletter for the latest updates, events, and announcements.
            </p>
          </div>
          <div className="mt-8 lg:mt-0 lg:ml-8">
            {isSubscribed ? (
              <div className="p-4 rounded-md bg-green-50">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      Thanks for subscribing!
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <form className="sm:flex" onSubmit={handleSubscribe}>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-3 border border-transparent placeholder-gray-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 focus:ring-white focus:border-white sm:max-w-xs rounded-md"
                  placeholder="Enter your email"
                />
                <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 focus:ring-white transition-colors duration-200"
                  >
                    Notify me
                  </button>
                </div>
              </form>
            )}
            <p className="mt-3 text-sm text-indigo-200">
              We care about your data. Read our{' '}
              <a href="#" className="text-white font-medium underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
