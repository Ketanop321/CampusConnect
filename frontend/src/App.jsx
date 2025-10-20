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
import BookDetailPage from './pages/book-bank/BookDetailPage';
import BookEditPage from './pages/book-bank/BookEditPage';
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
import Navbar from './components/Navbar';
import Footer from './components/Footer';

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
    <>
      <AuthProvider>
        <Routes>
          {/* Public Routes - No Navbar/Footer */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* App Layout with Navbar/Footer */}
          <Route path="/*" element={
            <div className="flex flex-col min-h-screen">
              <main className="flex-grow">
                <Suspense
                  fallback={
                    <div className="flex h-screen items-center justify-center">
                      <LoadingSpinner size="lg" />
                    </div>
                  }
                >
                  <Routes>
                    {/* Home Page with its own navbar */}
                    <Route 
                      index 
                      element={
                        <ProtectedRoute>
                          <>
                            <Navbar />
                            <HomePage />
                            <Footer />
                          </>
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* App Pages with MainLayout */}
                    <Route
                      path="/*"
                      element={
                        <ProtectedRoute>
                          <MainLayout />
                        </ProtectedRoute>
                      }
                    >
                      {/* Lost & Found Routes */}
                      <Route path="lost-found">
                        <Route index element={<LostAndFoundPage />} />
                        <Route path=":id" element={<LostFoundDetailPage />} />
                      </Route>
                      {/* Book Bank Routes */}
                      <Route path="book-bank">
                        <Route index element={<BookBankPage />} />
                        <Route path=":id" element={<BookDetailPage />} />
                        <Route path=":id/edit" element={<BookEditPage />} />
                      </Route>
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
                </Suspense>
              </main>
            </div>
          } />
        </Routes>
      </AuthProvider>
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
    </>
  );
}

export default App;
