import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { handleGoogleRedirect } from './lib/googleAuth';
import NotificationToast from './components/NotificationToast';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import SearchPage from './pages/SearchPage';
import PropertyDetails from './pages/PropertyDetails';
import BrokerPublic from './pages/BrokerPublic';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentOverview from './pages/student/Overview';
import Favorites from './pages/student/Favorites';
import Bookings from './pages/student/Bookings';
import Notifications from './pages/student/Notifications';
import Profile from './pages/student/Profile';
import BrokerDashboard from './pages/broker/BrokerDashboard';
import BrokerOverview from './pages/broker/BrokerOverview';
import BrokerProperties from './pages/broker/BrokerProperties';
import BrokerVisits from './pages/broker/BrokerVisits';
import BrokerQR from './pages/broker/BrokerQR';
import AddProperty from './pages/broker/AddProperty';
import BrokerSettings from './pages/broker/BrokerSettings';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProperties from './pages/admin/AdminProperties';
import AdminUniversities from './pages/admin/AdminUniversities';
import AdminCities from './pages/admin/AdminCities';
import AdminAnalytics from './pages/admin/AdminAnalytics';

handleGoogleRedirect();

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <NotificationToast />
          <Routes>
            <Route element={<Layout />}>
            <Route index element={<Landing />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="properties/:id" element={<PropertyDetails />} />
            <Route path="login" element={<Login />} />

            <Route
              path="dashboard"
              element={
                <ProtectedRoute roles={['student', 'owner']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<StudentOverview />} />
              <Route path="favorites" element={<Favorites />} />
              <Route path="bookings" element={<Bookings />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            <Route
              path="broker"
              element={
                <ProtectedRoute roles={['broker', 'owner']}>
                  <BrokerDashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<BrokerOverview />} />
              <Route path="properties" element={<BrokerProperties />} />
              <Route path="visits" element={<BrokerVisits />} />
              <Route path="qr" element={<BrokerQR />} />
              <Route path="add" element={<AddProperty />} />
              <Route path="settings" element={<BrokerSettings />} />
            </Route>

            {/* Public broker QR / profile page */}
            <Route path="b/:slug" element={<BrokerPublic />} />

            <Route
              path="admin"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminOverview />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="properties" element={<AdminProperties />} />
              <Route path="universities" element={<AdminUniversities />} />
              <Route path="cities" element={<AdminCities />} />
              <Route path="analytics" element={<AdminAnalytics />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </NotificationProvider>
  </AuthProvider>
);
}
