import React, { useState, useEffect, useContext } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';

// Configure axios
import './utils/axiosConfig';

// Components
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LeaderDashboard from './pages/LeaderDashboard';
import AdminDashboard from './pages/AdminDashboard';
import HouseholdsList from './pages/HouseholdsList';
import HouseholdDetail from './pages/HouseholdDetail';
import HouseholdCreate from './pages/HouseholdCreate';
import Alerts from './pages/Alerts';
import CreateAlert from './pages/CreateAlert';
import Ratings from './pages/Ratings';
import Profile from './pages/Profile';
import TaskList from './pages/TaskList';
import TaskCreate from './pages/TaskCreate';
import TaskDetail from './pages/TaskDetail';

// Context and Services
import AuthContext, { AuthProvider } from './utils/AuthContext';

function App() {
  return (
    <AuthProvider>
      <div className="app-container d-flex flex-column min-vh-100">
        <Header />
        <main className="flex-grow-1 py-4">
          <Container>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <DashboardRedirect />
              } />
              <Route path="/leader/dashboard" element={
                <ProtectedRoute roles={['leader', 'admin']}>
                  <LeaderDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/dashboard" element={
                <ProtectedRoute roles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/households" element={
                <ProtectedRoute roles={['leader', 'admin']}>
                  <HouseholdsList />
                </ProtectedRoute>
              } />
              <Route path="/households/new" element={
                <ProtectedRoute roles={['leader', 'admin']}>
                  <HouseholdCreate />
                </ProtectedRoute>
              } />
              <Route path="/households/:id" element={
                <ProtectedRoute>
                  <HouseholdDetail />
                </ProtectedRoute>
              } />
              <Route path="/alerts" element={
                <ProtectedRoute>
                  <Alerts />
                </ProtectedRoute>
              } />
              <Route path="/alerts/create" element={
                <ProtectedRoute roles={['leader', 'admin']}>
                  <CreateAlert />
                </ProtectedRoute>
              } />
              <Route path="/ratings" element={
                <ProtectedRoute>
                  <Ratings />
                </ProtectedRoute>
              } />

              {/* Task Management Routes */}
              <Route path="/tasks" element={
                <ProtectedRoute>
                  <TaskList />
                </ProtectedRoute>
              } />
              <Route path="/tasks/create" element={
                <ProtectedRoute roles={['leader', 'admin']}>
                  <TaskCreate />
                </ProtectedRoute>
              } />
              <Route path="/tasks/:id" element={
                <ProtectedRoute>
                  <TaskDetail />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Container>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

// Protected Route Component
const ProtectedRoute = ({ children, roles }) => {
  const { user, isAuthenticated, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }

    if (!loading && isAuthenticated && roles && !roles.includes(user.role)) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, navigate, roles, user]);

  if (loading) {
    return <div className="text-center py-5">Loading...</div>;
  }

  return isAuthenticated ? children : null;
};

// Dashboard Redirect Component - Redirects leaders to leader dashboard and regular users to normal dashboard
const DashboardRedirect = () => {
  const { user, isAuthenticated, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }

    if (!loading && isAuthenticated && user) {
      // Redirect users based on their role
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'leader') {
        navigate('/leader/dashboard');
      }
    }
  }, [isAuthenticated, loading, navigate, user]);

  if (loading) {
    return <div className="text-center py-5">Loading...</div>;
  }

  // For household members, show the regular dashboard
  return isAuthenticated && user && user.role === 'household' ? <Dashboard /> : null;
};

export default App;
