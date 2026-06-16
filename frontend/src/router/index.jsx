import { createBrowserRouter } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import Dashboard from '../pages/Dashboard';
import NotFound from '../pages/NotFound';
import Login from '../pages/Login';
import Orders from '../pages/Orders';
import OrderDetails from '../pages/OrderDetails';
import Shipping from '../pages/Shipping';
import Tracking from '../pages/Tracking';
import Analytics from '../pages/Analytics';
import Users from '../pages/Users';
import Admin from '../pages/Admin';
import Notifications from '../pages/Notifications';
import ActivityLogs from '../pages/ActivityLogs';
import SystemHealth from '../pages/SystemHealth';
import Settings from '../pages/Settings';
import BulkOperations from '../pages/BulkOperations';

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
        path: 'orders/:id',
        element: <OrderDetails />,
      },
      {
        path: 'shipping',
        element: <Shipping />,
      },
      {
        path: 'shipping/tracking/:id',
        element: <Tracking />,
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
        element: <Admin />,
      },
      {
        path: 'admin/bulk-operations',
        element: <BulkOperations />,
      },
      {
        path: 'notifications',
        element: <Notifications />,
      },
      {
        path: 'logs',
        element: <ActivityLogs />,
      },
      {
        path: 'health',
        element: <SystemHealth />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: '*',
        element: <NotFound />,
      }
    ],
  },
]);
