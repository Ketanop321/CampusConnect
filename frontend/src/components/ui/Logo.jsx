import React from 'react';

const Logo = ({ className = '', ...props }) => {
  return (
    <div className={`flex items-center ${className}`} {...props}>
      <svg
        className="h-8 w-auto text-indigo-600"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20 0C8.954 0 0 8.954 0 20s8.954 20 20 20 20-8.954 20-20S31.046 0 20 0zm0 36c-8.837 0-16-7.163-16-16S11.163 4 20 4s16 7.163 16 16-7.163 16-16 16z"
          fill="currentColor"
        />
        <path
          d="M20 10c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10-4.477-10-10-10zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"
          fill="currentColor"
        />
        <path
          d="M20 14c-3.313 0-6 2.687-6 6s2.687 6 6 6 6-2.687 6-6-2.687-6-6-6zm0 10c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z"
          fill="currentColor"
        />
        <circle cx="20" cy="20" r="2" fill="currentColor" />
      </svg>
      <span className="ml-2 text-xl font-bold text-gray-900">CampusConnect</span>
    </div>
  );
};

export default Logo;
