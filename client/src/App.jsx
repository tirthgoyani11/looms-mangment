import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Machines from './pages/Machines';
import Workers from './pages/Workers';
import Takas from './pages/Takas';
import Qualities from './pages/Qualities';
import Productions from './pages/Productions';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Profile from './pages/Profile';

function App() {
  const { checkAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
        />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/machines"
          element={
            <ProtectedRoute>
              <Layout>
                <Machines />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/workers"
          element={
            <ProtectedRoute>
              <Layout>
                <Workers />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/takas"
          element={
            <ProtectedRoute>
              <Layout>
                <Takas />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/qualities"
          element={
            <ProtectedRoute>
              <Layout>
                <Qualities />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/productions"
          element={
            <ProtectedRoute>
              <Layout>
                <Productions />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Layout>
                <Reports />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Layout>
                <Users />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
