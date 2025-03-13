import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import AuthModal from "../auth/AuthModal";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { isAuthenticated, user } = useAuthContext();
  const { theme, setTheme } = useTheme();

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

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar
        isAuthenticated={isAuthenticated}
        onLoginClick={handleLoginClick}
        onProfileClick={handleProfileClick}
        onSearchSubmit={(query) => navigate(`/search?q=${query}`)}
        username={user?.displayName || "User"}
        avatarUrl={user?.photoURL || ""}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 pl-16">
          {children}
        </main>
        
        {/* Footer */}
        <Footer />
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleAuthModalClose}
        onLogin={handleLogin}
      />
    </div>
  );
};

export default MainLayout; 