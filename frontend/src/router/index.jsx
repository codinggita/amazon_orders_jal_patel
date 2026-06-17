import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import GlobalErrorBoundary from '../components/GlobalErrorBoundary';

const Dashboard = lazy(() => import('../pages/Dashboard'));
const NotFound = lazy(() => import('../pages/NotFound'));
const Login = lazy(() => import('../pages/Login'));
const Orders = lazy(() => import('../pages/Orders'));
const OrderDetails = lazy(() => import('../pages/OrderDetails'));
const Shipping = lazy(() => import('../pages/Shipping'));
const Tracking = lazy(() => import('../pages/Tracking'));
const Analytics = lazy(() => import('../pages/Analytics'));
const Users = lazy(() => import('../pages/Users'));
const Admin = lazy(() => import('../pages/Admin'));
const Notifications = lazy(() => import('../pages/Notifications'));
const ActivityLogs = lazy(() => import('../pages/ActivityLogs'));
const SystemHealth = lazy(() => import('../pages/SystemHealth'));
const Settings = lazy(() => import('../pages/Settings'));
const BulkOperations = lazy(() => import('../pages/BulkOperations'));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-4">
      <div className="h-10 w-10 border-4 border-amazon-orange/30 border-t-amazon-orange rounded-full animate-spin" />
      <p className="text-slate-500 text-sm font-medium">Loading...</p>
    </div>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    errorElement: (
      <Suspense fallback={<PageLoader />}>
        <NotFound />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: 'orders',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Orders />
          </Suspense>
        ),
      },
      {
        path: 'orders/:id',
        element: (
          <Suspense fallback={<PageLoader />}>
            <OrderDetails />
          </Suspense>
        ),
      },
      {
        path: 'shipping',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Shipping />
          </Suspense>
        ),
      },
      {
        path: 'shipping/tracking/:id',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Tracking />
          </Suspense>
        ),
      },
      {
        path: 'analytics',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Analytics />
          </Suspense>
        ),
      },
      {
        path: 'users',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Users />
          </Suspense>
        ),
      },
      {
        path: 'admin',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Admin />
          </Suspense>
        ),
      },
      {
        path: 'admin/bulk-operations',
        element: (
          <Suspense fallback={<PageLoader />}>
            <BulkOperations />
          </Suspense>
        ),
      },
      {
        path: 'notifications',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Notifications />
          </Suspense>
        ),
      },
      {
        path: 'logs',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ActivityLogs />
          </Suspense>
        ),
      },
      {
        path: 'health',
        element: (
          <Suspense fallback={<PageLoader />}>
            <SystemHealth />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Settings />
          </Suspense>
        ),
      },
      {
        path: '*',
        element: (
          <Suspense fallback={<PageLoader />}>
            <NotFound />
          </Suspense>
        ),
      },
    ],
  },
]);
