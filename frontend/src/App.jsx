import { useState, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
 
import './App.css'

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import LostAndFoundPage from './pages/lost-found/LostAndFoundPage';
import LostFoundDetailPage from './pages/lost-found/LostFoundDetailPage';
import BookBankPage from './pages/book-bank/BookBankPage';
import ProfilePage from './pages/profile/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import RoommatePage from './pages/roommate/RoommatePage';
import RoommateDetailPage from './pages/roommate/RoommateDetailPage';
import RoommateForm from './pages/roommate/RoommateForm';
import NoticeboardPage from './pages/noticeboard/NoticeboardPage';
import NoticeboardDetailPage from './pages/noticeboard/NoticeboardDetailPage';
import EventForm from './pages/noticeboard/EventForm';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import LoadingSpinner from './components/ui/LoadingSpinner';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        }
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<HomePage />} />
            {/* Lost & Found Routes */}
            <Route path="lost-found">
              <Route index element={<LostAndFoundPage />} />
              <Route path=":id" element={<LostFoundDetailPage />} />
            </Route>
            <Route path="book-bank" element={<BookBankPage />} />
            <Route path="profile" element={<ProfilePage />} />
            
            {/* Roommate Routes */}
            <Route path="roommate">
              <Route index element={<RoommatePage />} />
              <Route path="new" element={<RoommateForm />} />
              <Route path=":id" element={<RoommateDetailPage />} />
              <Route path=":id/edit" element={<RoommateForm isEdit={true} />} />
            </Route>
            
            {/* Noticeboard Routes */}
            <Route path="noticeboard">
              <Route index element={<NoticeboardPage />} />
              <Route path="new" element={<EventForm />} />
              <Route path=":id" element={<NoticeboardDetailPage />} />
              <Route path=":id/edit" element={<EventForm isEdit={true} />} />
            </Route>
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: '#1f2937',
              color: '#fff',
            },
          }}
        />
      </Suspense>
    </AuthProvider>
  );
}

export default App;
