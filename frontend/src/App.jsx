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
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import FollowersList from './pages/FollowersList';
import FollowingList from './pages/FollowingList';
import Search from './pages/Search';
import Suggestions from './pages/Suggestions';
import Feed from './pages/Feed';
import PostDetail from './pages/PostDetail';
import Compose from './pages/Compose';
import Explore from './pages/Explore';
import HashtagFeed from './pages/HashtagFeed';
import SavedPosts from './pages/SavedPosts';
import Reels from './pages/Reels';
import SharedReels from './pages/SharedReels';
import Notifications from './pages/Notifications';
import PrivacySettings from './pages/PrivacySettings';
import SecuritySettings from './pages/SecuritySettings';

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
      {/* Public landing (self-contained: own navbar + footer) */}
      <Route path="/" element={<Landing />} />

      <Route element={<RootLayout />}>
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
          <Route path="/u/:username/edit" element={<EditProfile />} />
          <Route path="/search" element={<Search />} />
          <Route path="/suggestions" element={<Suggestions />} />
        </Route>

        {/* Public profile (no auth needed, but viewer state added if authed) */}
        <Route path="/u/:username" element={<Profile />} />
        <Route path="/u/:username/followers" element={<FollowersList />} />
        <Route path="/u/:username/following" element={<FollowingList />} />

        {/* Posts (Step 4) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/feed" element={<Feed />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/compose" element={<Compose />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/tag/:hashtag" element={<HashtagFeed />} />
          <Route path="/saved" element={<SavedPosts />} />
        </Route>

        {/* Notifications (Step 8) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/notifications" element={<Notifications />} />
        </Route>

        {/* Privacy & Security (Step 8) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/privacy" element={<PrivacySettings />} />
          <Route path="/security" element={<SecuritySettings />} />
        </Route>

        {/* Reels (Step 7) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/reels" element={<Reels />} />
          <Route path="/reels/shared" element={<SharedReels />} />
        </Route>

        {/* Future modules (placeholder until integrated) */}
        <Route path="/messaging" element={<ComingSoon title="Messaging" description="Real-time chat is being integrated." />} />

        <Route path="*" element={<ComingSoon title="Page not found" description="The page you're looking for doesn't exist." />} />
      </Route>
    </Routes>
  </>
);

export default App;