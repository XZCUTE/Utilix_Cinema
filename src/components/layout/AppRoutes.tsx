import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "@/components/home";
import VideoPlayerPage from "@/pages/VideoPlayerPage";
import WatchRoomPage from "@/pages/WatchRoomPage";
import LibraryPage from "@/pages/LibraryPage";
import WatchHistoryPage from "@/pages/WatchHistoryPage";
import ProfilePage from "@/pages/ProfilePage";
import MoviesPage from "@/pages/MoviesPage";
import TVShowsPage from "@/pages/TVShowsPage";
import PopularPage from "@/pages/PopularPage";
import SearchResultsPage from "@/pages/SearchResultsPage";
import ContentDetailsPage from "@/pages/ContentDetailsPage";
import AboutPage from "@/pages/AboutPage";
import TermsPage from "@/pages/TermsPage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import FAQPage from "@/pages/FAQPage";
import ContactPage from "@/pages/ContactPage";
import DonationPage from "@/pages/DonationPage";
import EmailSignIn from "@/components/auth/EmailSignIn";
import { useAuthContext } from "@/context/AuthContext";
import AuthModal from "@/components/auth/AuthModal";

interface AppRoutesProps {
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
}

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuthContext();

  // Show loading state if still determining auth status
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Redirect to home if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = ({ showAuthModal, setShowAuthModal }: AppRoutesProps) => {
  const { isAuthenticated } = useAuthContext();

  return (
    <Routes>
      {/* Protect all main routes except auth-related ones */}
      <Route path="/" element={
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      } />
      <Route path="/movies" element={
        <ProtectedRoute>
          <MoviesPage />
        </ProtectedRoute>
      } />
      <Route path="/tv" element={
        <ProtectedRoute>
          <TVShowsPage />
        </ProtectedRoute>
      } />
      <Route path="/popular" element={
        <ProtectedRoute>
          <PopularPage />
        </ProtectedRoute>
      } />
      <Route path="/search" element={
        <ProtectedRoute>
          <SearchResultsPage />
        </ProtectedRoute>
      } />
      <Route path="/watch/:id/:type" element={
        <ProtectedRoute>
          <VideoPlayerPage />
        </ProtectedRoute>
      } />
      <Route
        path="/watch/:id/:type/:season/:episode"
        element={
          <ProtectedRoute>
            <VideoPlayerPage />
          </ProtectedRoute>
        }
      />
      <Route path="/details/:id/:type" element={
        <ProtectedRoute>
          <ContentDetailsPage />
        </ProtectedRoute>
      } />
      <Route path="/watch-room/:roomId" element={
        <ProtectedRoute>
          <WatchRoomPage />
        </ProtectedRoute>
      } />
      <Route path="/about" element={
        <ProtectedRoute>
          <AboutPage />
        </ProtectedRoute>
      } />
      <Route path="/terms" element={
        <ProtectedRoute>
          <TermsPage />
        </ProtectedRoute>
      } />
      <Route path="/privacy" element={
        <ProtectedRoute>
          <PrivacyPolicyPage />
        </ProtectedRoute>
      } />
      <Route path="/faq" element={
        <ProtectedRoute>
          <FAQPage />
        </ProtectedRoute>
      } />
      <Route path="/contact" element={
        <ProtectedRoute>
          <ContactPage />
        </ProtectedRoute>
      } />
      
      {/* Donation page - available without authentication */}
      <Route path="/donation" element={<DonationPage />} />
      
      {/* Auth-related routes don't need protection */}
      <Route path="/auth/email-signin" element={<EmailSignIn />} />
      
      {/* Protected user account routes */}
      <Route
        path="/library"
        element={
          <ProtectedRoute>
            <LibraryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <WatchHistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
