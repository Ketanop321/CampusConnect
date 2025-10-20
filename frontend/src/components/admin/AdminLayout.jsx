import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';

const AdminLayout = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="bg-indigo-800 text-white w-64 flex-shrink-0">
        <div className="p-4 border-b border-indigo-700">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>
        <nav className="p-4 space-y-2">
          <Link 
            to="/admin/dashboard" 
            className={`flex items-center p-2 rounded-lg ${isActive('/admin/dashboard') ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
          >
            <span className="ml-2">Dashboard</span>
          </Link>
          <Link 
            to="/admin/events" 
            className={`flex items-center p-2 rounded-lg ${isActive('/admin/events') ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
          >
            <span className="ml-2">Manage Events</span>
          </Link>
          <Link 
            to="/admin/approvals" 
            className={`flex items-center p-2 rounded-lg ${isActive('/admin/approvals') ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
          >
            <span className="ml-2">Pending Approvals</span>
            <span className="ml-auto bg-yellow-500 text-xs text-white px-2 py-1 rounded-full">
              {/* You can add a counter here later */}
            </span>
          </Link>
          <Link 
            to="/admin/users" 
            className={`flex items-center p-2 rounded-lg ${isActive('/admin/users') ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
          >
            <span className="ml-2">User Management</span>
          </Link>
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t border-indigo-700">
          <Button 
            variant="outline" 
            className="w-full text-white border-white hover:bg-white hover:text-indigo-800"
            onClick={() => {
              // Handle logout
              localStorage.removeItem('token');
              window.location.href = '/';
            }}
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {location.pathname.split('/').pop().charAt(0).toUpperCase() + 
               location.pathname.split('/').pop().slice(1) || 'Dashboard'}
            </h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Admin User
              </span>
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                AU
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
