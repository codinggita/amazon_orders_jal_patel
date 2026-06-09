import { createBrowserRouter } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import Dashboard from '../pages/Dashboard';
import NotFound from '../pages/NotFound';
import Login from '../pages/Login';
import Orders from '../pages/Orders';
import Shipping from '../pages/Shipping';
import Analytics from '../pages/Analytics';
import Users from '../pages/Users';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'orders',
        element: <Orders />,
      },
      {
        path: 'shipping',
        element: <Shipping />,
      },
      {
        path: 'analytics',
        element: <Analytics />,
      },
      {
        path: 'users',
        element: <Users />,
      },
      {
        path: 'admin',
        element: <div className="p-4">Admin Page (Coming Soon)</div>,
      },
      {
        path: 'notifications',
        element: <div className="p-4">Notifications Page (Coming Soon)</div>,
      },
      {
        path: 'logs',
        element: <div className="p-4">Activity Logs Page (Coming Soon)</div>,
      },
      {
        path: 'health',
        element: <div className="p-4">System Health Page (Coming Soon)</div>,
      },
      {
        path: 'settings',
        element: <div className="p-4">Settings Page (Coming Soon)</div>,
      },
      {
        path: '*',
        element: <NotFound />,
      }
    ],
  },
]);
