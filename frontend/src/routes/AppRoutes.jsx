import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../layouts/AppLayout';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// Listener Pages
import HomePage from '../pages/HomePage';
import RecommendationsPage from '../pages/RecommendationsPage';
import ExplorePage from '../pages/ExplorePage';
import PlaylistsPage from '../pages/PlaylistsPage';
import FavoritesPage from '../pages/FavoritesPage';
import HistoryPage from '../pages/HistoryPage';
import ProfilePage from '../pages/ProfilePage';
import AgeDetectorPage from '../pages/AgeDetectorPage';

// Admin Pages
import AdminOverviewPage from '../pages/admin/AdminOverviewPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminSongsPage from '../pages/admin/AdminSongsPage';
import AdminTaxonomyPage from '../pages/admin/AdminTaxonomyPage';
import AdminModelMetricsPage from '../pages/admin/AdminModelMetricsPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090a10] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090a10] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected App Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="recommendations" element={<RecommendationsPage />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="playlists" element={<PlaylistsPage />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="age-detector" element={<AgeDetectorPage />} />

        {/* Admin Routes */}
        <Route
          path="admin"
          element={
            <AdminRoute>
              <AdminOverviewPage />
            </AdminRoute>
          }
        />
        <Route
          path="admin/users"
          element={
            <AdminRoute>
              <AdminUsersPage />
            </AdminRoute>
          }
        />
        <Route
          path="admin/songs"
          element={
            <AdminRoute>
              <AdminSongsPage />
            </AdminRoute>
          }
        />
        <Route
          path="admin/taxonomy"
          element={
            <AdminRoute>
              <AdminTaxonomyPage />
            </AdminRoute>
          }
        />
        <Route
          path="admin/analytics"
          element={
            <AdminRoute>
              <AdminModelMetricsPage />
            </AdminRoute>
          }
        />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
