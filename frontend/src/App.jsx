import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import RootLayout from './layouts/RootLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import GuestRoute from './routes/GuestRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ChangePassword from './pages/ChangePassword';
import Account from './pages/Account';
import ComingSoon from './pages/ComingSoon';

const App = () => (
  <>
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3500,
        style: {
          background: '#ffffff',
          color: '#0f172a',
          borderRadius: '1rem',
          boxShadow: '0 8px 30px rgba(79, 70, 229, 0.18)',
          fontWeight: 500,
        },
        success: { iconTheme: { primary: '#34d399', secondary: '#ffffff' } },
        error: { iconTheme: { primary: '#fb7185', secondary: '#ffffff' } },
      }}
    />

    <Routes>
      <Route element={<RootLayout />}>
        {/* Public */}
        <Route path="/" element={<Landing />} />

        {/* Guest only */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/account" element={<Account />} />
          <Route path="/change-password" element={<ChangePassword />} />
        </Route>

        {/* Future modules (placeholder until integrated) */}
        <Route path="/feed" element={<ComingSoon title="Your feed is coming" description="Posts, likes and the timeline will appear here in the next backend step." />} />
        <Route path="/explore" element={<ComingSoon title="Explore" description="Discover trending content, hashtags and creators soon." />} />
        <Route path="/messaging" element={<ComingSoon title="Messaging" description="Real-time chat is being integrated." />} />

        <Route path="*" element={<ComingSoon title="Page not found" description="The page you're looking for doesn't exist." />} />
      </Route>
    </Routes>
  </>
);

export default App;