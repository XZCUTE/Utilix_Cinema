import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Search,
  User,
  Menu,
  X,
  Film,
  Tv,
  LogIn,
  History,
  Library,
  LogOut,
  Home,
  Settings,
  Coffee,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ThemeSelector from "./ThemeSelector";
import { useAuthContext } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

interface SidebarProps {
  isAuthenticated?: boolean;
  onLoginClick?: () => void;
  onProfileClick?: () => void;
  onSearchSubmit?: (query: string) => void;
  username?: string;
  avatarUrl?: string;
  onClose?: () => void;
  isSliding?: boolean;
}

const Sidebar = ({
  isAuthenticated: propIsAuthenticated,
  onLoginClick = () => {},
  onProfileClick = () => {},
  onSearchSubmit = () => {},
  username: propUsername,
  avatarUrl: propAvatarUrl,
  onClose = () => {},
  isSliding = false,
}: SidebarProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, user, profile, logout } = useAuthContext();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showDonationDialog, setShowDonationDialog] = useState(false);

  // Use props if provided, otherwise use context
  const authStatus =
    propIsAuthenticated !== undefined ? propIsAuthenticated : isAuthenticated;
  const username =
    propUsername || profile?.displayName || user?.displayName || "User";
  const avatarUrl =
    propAvatarUrl ||
    profile?.photoURL ||
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix";

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchSubmit(searchQuery);
      setSearchQuery("");
      setShowSearchInput(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Navigate to home and show auth modal
      navigate("/");
      // Force reload to ensure auth modal appears
      window.location.reload();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Get current path to highlight active link
  const currentPath = window.location.pathname;
  const isActive = (path: string) => {
    if (path === "/") return currentPath === path;
    return currentPath.startsWith(path);
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-50 bg-card border-r border-border w-64 transform transition-all duration-300 ease-in-out ${
        isSliding ? '-translate-x-full' : 'translate-x-0'
      } flex flex-col overflow-hidden`}
    >
      {/* Top section with logo and close button - fixed */}
      <div className="flex items-center justify-between p-3 border-b border-border shrink-0">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-lg font-bold text-foreground">Utilix Cinema</span>
        </Link>
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="h-8 w-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      {/* Scrollable middle section */}
      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        {/* Navigation Links */}
        <nav className="mb-4">
          <ul className="space-y-2 px-2">
            <li>
              <Link
                to="/"
                className={`flex items-center p-2 rounded-md hover:bg-accent ${
                  isActive("/") ? "bg-accent/50" : ""
                }`}
              >
                <Home size={20} />
                <span className="ml-3">Home</span>
              </Link>
            </li>
            <li>
              <Link
                to="/movies"
                className={`flex items-center p-2 rounded-md hover:bg-accent ${
                  isActive("/movies") ? "bg-accent/50" : ""
                }`}
              >
                <Film size={20} />
                <span className="ml-3">Movies</span>
              </Link>
            </li>
            <li>
              <Link
                to="/tv"
                className={`flex items-center p-2 rounded-md hover:bg-accent ${
                  isActive("/tv") ? "bg-accent/50" : ""
                }`}
              >
                <Tv size={20} />
                <span className="ml-3">TV Shows</span>
              </Link>
            </li>
            
            {/* Search */}
            <li>
              <div
                className="flex items-center p-2 rounded-md hover:bg-accent cursor-pointer"
                onClick={() => setShowSearchInput(!showSearchInput)}
              >
                <Search size={20} />
                <span className="ml-3">Search</span>
              </div>
            </li>
            
            {/* Search Input */}
            {showSearchInput && (
              <form
                onSubmit={handleSearchSubmit}
                className="mt-2 px-2"
              >
                <div className="relative">
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="w-full bg-background border-border focus-visible:ring-primary"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  <Button
                    type="submit"
                    size="icon"
                    variant="ghost"
                    className="absolute right-0 top-0 h-full text-muted-foreground"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            )}

            {/* User Options - only show if authenticated */}
            {authStatus && (
              <>
                <li>
                  <Link
                    to="/library"
                    className={`flex items-center p-2 rounded-md hover:bg-accent ${
                      isActive("/library") ? "bg-accent/50" : ""
                    }`}
                  >
                    <Library size={20} />
                    <span className="ml-3">Library</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/history"
                    className={`flex items-center p-2 rounded-md hover:bg-accent ${
                      isActive("/history") ? "bg-accent/50" : ""
                    }`}
                  >
                    <History size={20} />
                    <span className="ml-3">History</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/profile"
                    className={`flex items-center p-2 rounded-md hover:bg-accent ${
                      isActive("/profile") ? "bg-accent/50" : ""
                    }`}
                  >
                    <User size={20} />
                    <span className="ml-3">Profile</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        {/* Donation Section */}
        <div className="px-2 mb-2">
          <Dialog open={showDonationDialog} onOpenChange={setShowDonationDialog}>
            <DialogTrigger asChild>
              <div className="w-full">
                <Button
                  variant="outline"
                  size="default"
                  className="w-full justify-start text-primary border-primary/20 hover:bg-primary/10 hover:text-primary"
                >
                  <Coffee size={20} className="text-primary" />
                  <span className="ml-2 flex items-center">
                    Support
                    <Heart className="h-3 w-3 ml-1 fill-primary text-primary" />
                  </span>
                </Button>
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-center flex items-center justify-center gap-2">
                  <Coffee className="h-5 w-5 text-primary" />
                  Support My Work – Buy Me a Coffee ☕💖
                </DialogTitle>
                <DialogDescription className="text-center pt-2 pb-4">
                  Your support means the world to me! If you enjoy what I create and find 
                  value in my work, consider buying me a coffee or making a donation. 
                  Every contribution helps me continue doing what I love, improve my projects, 
                  and bring you even more great content.
                  <br /><br />
                  Your generosity keeps this journey going, and I truly appreciate every bit of support. 
                  Thank you for being amazing! 💕
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="rounded-lg border border-border p-4">
                  <div className="flex items-center mb-3">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/1200px-PayPal.svg.png"
                      alt="PayPal"
                      className="h-6 mr-2"
                    />
                    <h3 className="text-lg font-medium">PayPal</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Send your donation to:</p>
                  <div className="bg-accent/50 p-2 rounded text-sm font-medium flex justify-between">
                    <span>markstarosa838@gmail.com</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-auto p-1 text-xs"
                      onClick={() => {
                        navigator.clipboard.writeText("markstarosa838@gmail.com");
                        alert("PayPal email copied to clipboard!");
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
                
                <div className="rounded-lg border border-border p-4">
                  <div className="flex items-center mb-3">
                    <div className="flex items-center justify-center bg-blue-500 text-white h-6 w-6 rounded mr-2 font-bold text-xs">
                      G
                    </div>
                    <h3 className="text-lg font-medium">GCash</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Send your donation to:</p>
                  <div className="bg-accent/50 p-2 rounded text-sm font-medium flex justify-between">
                    <span>09912159697</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-auto p-1 text-xs"
                      onClick={() => {
                        navigator.clipboard.writeText("09912159697");
                        alert("GCash number copied to clipboard!");
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="pt-2">
                  <Link to="/donation" className="w-full">
                    <Button variant="default" className="w-full">
                      View Donation Page
                    </Button>
                  </Link>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Bottom Section - Fixed at bottom */}
      <div className="border-t border-border shrink-0">
        {/* User Profile Section */}
        {authStatus && (
          <div className="p-3 border-b border-border flex items-center">
            <img
              src={avatarUrl}
              alt={username}
              className="h-8 w-8 rounded-full mr-2"
            />
            <span className="text-sm truncate">{username}</span>
          </div>
        )}
          
        {/* Login/Logout Button */}
        <div className="p-2">
          {authStatus ? (
            <Button
              variant="ghost"
              size="default"
              onClick={handleLogout}
              className="w-full justify-start"
            >
              <LogOut size={20} />
              <span className="ml-2">Logout</span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="default"
              onClick={onLoginClick}
              className="w-full justify-start"
            >
              <LogIn size={20} />
              <span className="ml-2">Login</span>
            </Button>
          )}
        </div>
      
        {/* Theme Selector */}
        <div className="p-2">
          <ThemeSelector isCompact={false} />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 