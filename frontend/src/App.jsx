import { useState, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
 
import './App.css'

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './components/admin/AdminLayout';
import AdminRoute from './components/auth/AdminRoute';

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
// Admin Pages
import DashboardPage from './pages/admin/DashboardPage';
import EventsListPage from './pages/admin/EventsListPage';
import AdminEventDetailPage from './pages/admin/AdminEventDetailPage';
import AdminEventForm from './pages/admin/AdminEventForm';
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
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
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
          
          {/* Admin Area */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="events">
              <Route index element={<EventsListPage />} />
              <Route path="new" element={<AdminEventForm />} />
              <Route path=":id" element={<AdminEventDetailPage />} />
              <Route path=":id/edit" element={<AdminEventForm isEdit={true} />} />
            </Route>
          </Route>
          
          {/* App Layout with Single Navbar/Footer */}
          <Route path="/*" element={
            <ProtectedRoute>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow pt-16">
                  <Suspense
                    fallback={
                      <div className="flex h-screen items-center justify-center">
                        <LoadingSpinner size="lg" />
                      </div>
                    }
                  >
                    <Routes>
                      {/* Home Page */}
                      <Route index element={<HomePage />} />
                      
                      {/* App Pages */}
                      <Route path="profile" element={<ProfilePage />} />
                      
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
                        <Route
                          path="new"
                          element={
                            <AdminRoute>
                              <EventForm />
                            </AdminRoute>
                          }
                        />
                        <Route path=":id" element={<NoticeboardDetailPage />} />
                        <Route
                          path=":id/edit"
                          element={
                            <AdminRoute>
                              <EventForm isEdit={true} />
                            </AdminRoute>
                          }
                        />
                      </Route>
                      
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </Suspense>
                </main>
                <Footer />
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#1f2937',
          },
        }}
      />
    </>
  );
}

export default App;
