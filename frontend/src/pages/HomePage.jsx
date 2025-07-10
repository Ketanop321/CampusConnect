import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  {
    name: 'Lost & Found',
    description: 'Report lost items or help others find their belongings on campus.',
    icon: '🔍',
    path: '/lost-found',
  },
  {
    name: 'Book Bank',
    description: 'Borrow, lend, or exchange textbooks with fellow students.',
    icon: '📚',
    path: '/book-bank',
  },
  {
    name: 'Campus Connect',
    description: 'Connect with other students, join study groups, and more.',
    icon: '👥',
    path: '/connect',
  },
];

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-indigo-800">
        <div className="absolute inset-0">
          <img
            className="h-full w-full object-cover opacity-30"
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
            alt="Campus life"
          />
          <div className="absolute inset-0 bg-indigo-800 mix-blend-multiply" aria-hidden="true" />
        </div>
        <div className="relative mx-auto max-w-7xl py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Welcome to CampusConnect
          </h1>
          <p className="mt-6 max-w-3xl text-xl text-indigo-100">
            Your one-stop platform for campus life. Connect with fellow students, find lost items,
            exchange textbooks, and make the most of your university experience.
          </p>
          <div className="mt-10 flex gap-x-6">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/register"
                  className="rounded-md bg-white px-4 py-3 text-base font-medium text-indigo-700 shadow-sm hover:bg-indigo-50 sm:px-8"
                >
                  Get started
                </Link>
                <Link
                  to="/login"
                  className="rounded-md bg-indigo-500 bg-opacity-60 px-4 py-3 text-base font-medium text-white hover:bg-opacity-70 sm:px-8"
                >
                  Sign in
                </Link>
              </>
            ) : (
              <Link
                to="/lost-found"
                className="rounded-md bg-white px-4 py-3 text-base font-medium text-indigo-700 shadow-sm hover:bg-indigo-50 sm:px-8"
              >
                Explore Features
              </Link>
            )}
          </div>
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
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Link
                  key={feature.name}
                  to={feature.path}
                  className="group relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:border-indigo-500 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-indigo-500 text-white text-xl">
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
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-700">
        <div className="mx-auto max-w-2xl py-16 px-4 text-center sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block">Join CampusConnect today.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-indigo-200">
            Connect with your campus community and make the most of your university experience.
          </p>
          <Link
            to={isAuthenticated ? '/lost-found' : '/register'}
            className="mt-8 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-white px-5 py-3 text-base font-medium text-indigo-600 hover:bg-indigo-50 sm:w-auto"
          >
            {isAuthenticated ? 'Explore Features' : 'Sign up for free'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
