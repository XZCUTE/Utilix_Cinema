import { Suspense, useState, useEffect } from "react";
import { useRoutes } from "react-router-dom";
import routes from "tempo-routes";
import AppRoutes from "./components/layout/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ContentProvider } from "./context/ContentContext";
import { LibraryProvider } from "./context/LibraryContext";
import { WatchHistoryProvider } from "./context/WatchHistoryContext";
import AuthModal from "./components/auth/AuthModal";
import { useAuthContext } from "./context/AuthContext";

function AppContent() {
  const [showAuthModal, setShowAuthModal] = useState(true);
  const { isAuthenticated, loading } = useAuthContext();

  useEffect(() => {
    if (isAuthenticated) {
      setShowAuthModal(false);
    } else if (!loading) {
      setShowAuthModal(true);
    }
  }, [isAuthenticated, loading]);

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        {(isAuthenticated || loading) && (
          <AppRoutes
            showAuthModal={showAuthModal}
            setShowAuthModal={setShowAuthModal}
          />
        )}
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}

        {showAuthModal && !isAuthenticated && !loading && (
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => {
              if (isAuthenticated) {
                setShowAuthModal(false);
              }
            }}
            onLogin={handleAuthSuccess}
          />
        )}
      </>
    </Suspense>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ContentProvider>
          <LibraryProvider>
            <WatchHistoryProvider>
              <AppContent />
            </WatchHistoryProvider>
          </LibraryProvider>
        </ContentProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
