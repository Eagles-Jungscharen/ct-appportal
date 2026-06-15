import { createBrowserRouter } from 'react-router-dom';
import { AdminRoute } from '../auth/AdminRoute';
import { HomeRoute } from '../auth/HomeRoute';
import { OidcCallback } from '../auth/OidcCallback';
import { PageShell } from '../components/PageShell';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { Unauthorized } from '../pages/Unauthorized';

export const router = createBrowserRouter([
  {
    path: '/auth/callback',
    element: <OidcCallback />,
  },
  {
    path: '/unauthorized',
    element: <Unauthorized />,
  },
  {
    path: '/',
    element: <HomeRoute />,
  },
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <PageShell>
          <AdminDashboard />
        </PageShell>
      </AdminRoute>
    ),
  },
  {
    path: '/admin/*',
    element: (
      <AdminRoute>
        <PageShell>
          <AdminDashboard />
        </PageShell>
      </AdminRoute>
    ),
  },
]);
