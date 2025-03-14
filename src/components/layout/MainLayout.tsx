import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import AuthModal from "../auth/AuthModal";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

// Key for localStorage
const SIDEBAR_VISIBILITY_KEY = "utilix_cinema_sidebar_visible";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { isAuthenticated, user } = useAuthContext();
  const { theme, setTheme } = useTheme();
  
  // Initialize sidebar visibility state from localStorage or default to true
  const [isSidebarVisible, setIsSidebarVisible] = useState(() => {
    const savedState = localStorage.getItem(SIDEBAR_VISIBILITY_KEY);
    // Parse the saved state, defaulting to true if not found or invalid
    return savedState ? savedState === 'true' : true;
  });
  
  const [isSliding, setIsSliding] = useState(false);

  // Update localStorage when sidebar visibility changes
  useEffect(() => {
    localStorage.setItem(SIDEBAR_VISIBILITY_KEY, isSidebarVisible.toString());
  }, [isSidebarVisible]);

  const handleLoginClick = () => {
    setIsAuthModalOpen(true);
  };

  const handleAuthModalClose = () => {
    setIsAuthModalOpen(false);
  };

  const handleLogin = () => {
    console.log("Login successful");
    setIsAuthModalOpen(false);
  };

  const handleSignup = (data: any) => {
    console.log("Signup data:", data);
    setIsAuthModalOpen(false);
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleSidebarClose = () => {
    setIsSliding(true);
    setTimeout(() => {
      setIsSidebarVisible(false);
      setIsSliding(false);
    }, 300);
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {(isSidebarVisible || isSliding) && (
        <Sidebar
          isAuthenticated={isAuthenticated}
          onLoginClick={handleLoginClick}
          onProfileClick={handleProfileClick}
          onSearchSubmit={(query) => navigate(`/search?q=${query}`)}
          username={user?.displayName || "User"}
          avatarUrl={user?.photoURL || ""}
          onClose={handleSidebarClose}
          isSliding={isSliding}
        />
      )}

      {!isSidebarVisible && !isSliding && (
        <Button 
          variant="default" 
          size="icon" 
          onClick={() => setIsSidebarVisible(true)}
          className="fixed top-4 left-4 z-50 rounded-full shadow-md hover:shadow-lg transition-all duration-300 bg-primary hover:bg-primary/90 text-primary-foreground"
          aria-label="Show sidebar"
        >
          <Menu size={18} />
        </Button>
      )}

      <div className="flex-1 flex flex-col">
        <main className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarVisible && !isSliding ? 'pl-64' : 'pl-0'}`}>
          {children}
        </main>
        
        <Footer />
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleAuthModalClose}
        onLogin={handleLogin}
      />
    </div>
  );
};

export default MainLayout; 