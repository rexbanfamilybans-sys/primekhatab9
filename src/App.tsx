/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { AnimeProvider } from './context/AnimeContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { CountryGuard } from './components/CountryGuard';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { AnimeDetails } from './pages/AnimeDetails';
import { Premium } from './pages/Premium';
import { Profile } from './pages/Profile';
import { AdminDashboard } from './admin/AdminDashboard';
import { AdminAnime } from './admin/AdminAnime';
import { AdminPlans } from './admin/AdminPlans';
import { AdminRequests } from './admin/AdminRequests';
import { AdminUsers } from './admin/AdminUsers';
import { AdminSettings } from './admin/AdminSettings';

export default function App() {
  return (
    <AuthProvider>
      <AnimeProvider>
        <ThemeProvider>
          <Router>
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: '#18181b',
                color: '#fff',
                border: '1px solid #27272a',
                borderRadius: '12px',
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={
              <CountryGuard>
                <Layout>
                  <Dashboard />
                </Layout>
              </CountryGuard>
            } />

            <Route path="/anime/:id" element={
              <ProtectedRoute>
                <CountryGuard>
                  <Layout>
                    <AnimeDetails />
                  </Layout>
                </CountryGuard>
              </ProtectedRoute>
            } />

            <Route path="/premium" element={
              <ProtectedRoute>
                <CountryGuard>
                  <Layout>
                    <Premium />
                  </Layout>
                </CountryGuard>
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute>
                <CountryGuard>
                  <Layout>
                    <Profile />
                  </Layout>
                </CountryGuard>
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/anime" element={
              <ProtectedRoute requireAdmin>
                <Layout>
                  <AdminAnime />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/admin/plans" element={
              <ProtectedRoute requireAdmin>
                <Layout>
                  <AdminPlans />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/admin/requests" element={
              <ProtectedRoute requireAdmin>
                <Layout>
                  <AdminRequests />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/admin/users" element={
              <ProtectedRoute requireAdmin>
                <Layout>
                  <AdminUsers />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/admin/settings" element={
              <ProtectedRoute requireAdmin>
                <Layout>
                  <AdminSettings />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        </ThemeProvider>
      </AnimeProvider>
    </AuthProvider>
  );
}
