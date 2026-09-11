import { createBrowserRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import AdminDashboard from '../pages/AdminDashboard';
import PMDashboard from '../pages/PMDashboard';
import DeveloperDashboard from '../pages/DeveloperDashboard';
import ProjectDetailPage from '../pages/ProjectDetailPage';
import { ProtectedRoute } from './ProtectedRoute';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/admin', element: <ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute> },
  { path: '/pm', element: <ProtectedRoute allowedRoles={['PM']}><PMDashboard /></ProtectedRoute> },
  { path: '/developer', element: <ProtectedRoute allowedRoles={['DEVELOPER']}><DeveloperDashboard /></ProtectedRoute> },
  // any of the 3 roles can view a project page, ownership check happens server side anyway
  { path: '/projects/:id', element: <ProtectedRoute allowedRoles={['ADMIN', 'PM', 'DEVELOPER']}><ProjectDetailPage /></ProtectedRoute> },
  { path: '*', element: <LoginPage /> }, // lazy catch-all, not building a proper 404 page today
]);
