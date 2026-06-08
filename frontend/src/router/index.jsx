import { createBrowserRouter } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import Dashboard from '../pages/Dashboard';
import NotFound from '../pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardLayout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'orders',
        element: <div className="p-4">Orders Page (Coming Soon)</div>,
      },
      {
        path: 'shipping',
        element: <div className="p-4">Shipping Page (Coming Soon)</div>,
      },
      {
        path: 'analytics',
        element: <div className="p-4">Analytics Page (Coming Soon)</div>,
      },
      {
        path: 'users',
        element: <div className="p-4">Users Page (Coming Soon)</div>,
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
