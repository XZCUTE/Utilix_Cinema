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
}

const Sidebar = ({
  isAuthenticated: propIsAuthenticated,
  onLoginClick = () => {},
  onProfileClick = () => {},
  onSearchSubmit = () => {},
  username: propUsername,
  avatarUrl: propAvatarUrl,
}: SidebarProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, user, profile, logout } = useAuthContext();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  // Use props if provided, otherwise use context
  const authStatus =
    propIsAuthenticated !== undefined ? propIsAuthenticated : isAuthenticated;
  const username =
    propUsername || profile?.displayName || user?.displayName || "User";
  const avatarUrl =
    propAvatarUrl ||
    profile?.photoURL ||
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix";

  // Apply theme-specific styles
  const getThemeStyles = () => {
    // Default styles for dark theme
    let sidebarBg = "bg-gray-900";
    let borderColor = "border-gray-800";
    let textColor = "text-gray-300";
    let hoverColor = "hover:bg-gray-800 hover:text-white";
    let activeColor = "bg-gray-800 text-white";
    let inputBg = "bg-gray-800";
    let inputBorder = "border-gray-700";
    let dropdownBg = "bg-gray-900";
    let dropdownItemHover = "hover:bg-gray-800";

    // Theme-specific overrides
    if (theme === "light") {
      sidebarBg = "bg-white";
      borderColor = "border-gray-200";
      textColor = "text-gray-700";
      hoverColor = "hover:bg-gray-100 hover:text-black";
      activeColor = "bg-gray-100 text-black";
      inputBg = "bg-gray-100";
      inputBorder = "border-gray-300";
      dropdownBg = "bg-white";
      dropdownItemHover = "hover:bg-gray-100";
    }

    return {
      sidebarBg,
      borderColor,
      textColor,
      hoverColor,
      activeColor,
      inputBg,
      inputBorder,
      dropdownBg,
      dropdownItemHover,
    };
  };

  const styles = getThemeStyles();

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
      className={`fixed top-0 left-0 h-full z-50 ${styles.sidebarBg} border-r ${styles.borderColor} transition-all duration-300 ${
        isExpanded ? "w-64" : "w-16"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo and Toggle */}
        <div className="flex items-center justify-between p-3 border-b border-gray-800">
          {isExpanded && (
            <Link to="/" className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">Utilix</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`${styles.textColor} ${styles.hoverColor}`}
          >
            {isExpanded ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-4">
          <ul className="space-y-2 px-2">
            <li>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      to="/"
                      className={`flex items-center p-2 rounded-md ${
                        styles.textColor
                      } ${styles.hoverColor} ${
                        isActive("/") ? styles.activeColor : ""
                      }`}
                    >
                      <Home size={20} />
                      {isExpanded && <span className="ml-3">Home</span>}
                    </Link>
                  </TooltipTrigger>
                  {!isExpanded && (
                    <TooltipContent side="right">Home</TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </li>
            <li>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      to="/movies"
                      className={`flex items-center p-2 rounded-md ${
                        styles.textColor
                      } ${styles.hoverColor} ${
                        isActive("/movies") ? styles.activeColor : ""
                      }`}
                    >
                      <Film size={20} />
                      {isExpanded && <span className="ml-3">Movies</span>}
                    </Link>
                  </TooltipTrigger>
                  {!isExpanded && (
                    <TooltipContent side="right">Movies</TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </li>
            <li>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      to="/tv"
                      className={`flex items-center p-2 rounded-md ${
                        styles.textColor
                      } ${styles.hoverColor} ${
                        isActive("/tv") ? styles.activeColor : ""
                      }`}
                    >
                      <Tv size={20} />
                      {isExpanded && <span className="ml-3">TV Shows</span>}
                    </Link>
                  </TooltipTrigger>
                  {!isExpanded && (
                    <TooltipContent side="right">TV Shows</TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </li>
            
            {/* Search */}
            <li>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`flex items-center p-2 rounded-md ${styles.textColor} ${styles.hoverColor} cursor-pointer`}
                      onClick={() => {
                        if (isExpanded) {
                          setShowSearchInput(!showSearchInput);
                        } else {
                          setIsExpanded(true);
                          setTimeout(() => setShowSearchInput(true), 300);
                        }
                      }}
                    >
                      <Search size={20} />
                      {isExpanded && <span className="ml-3">Search</span>}
                    </div>
                  </TooltipTrigger>
                  {!isExpanded && (
                    <TooltipContent side="right">Search</TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
              
              {isExpanded && showSearchInput && (
                <form
                  onSubmit={handleSearchSubmit}
                  className="mt-2 px-2"
                >
                  <div className="relative">
                    <Input
                      type="search"
                      placeholder="Search..."
                      className={`w-full ${styles.inputBg} ${styles.inputBorder} focus-visible:ring-primary`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                    <Button
                      type="submit"
                      size="icon"
                      variant="ghost"
                      className="absolute right-0 top-0 h-full text-gray-400"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              )}
            </li>
          </ul>

          {/* User-specific links */}
          {authStatus && (
            <ul className="space-y-2 px-2 mt-4 pt-4 border-t border-gray-800">
              <li>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        to="/library"
                        className={`flex items-center p-2 rounded-md ${
                          styles.textColor
                        } ${styles.hoverColor} ${
                          isActive("/library") ? styles.activeColor : ""
                        }`}
                      >
                        <Library size={20} />
                        {isExpanded && <span className="ml-3">My Library</span>}
                      </Link>
                    </TooltipTrigger>
                    {!isExpanded && (
                      <TooltipContent side="right">My Library</TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </li>
              <li>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        to="/history"
                        className={`flex items-center p-2 rounded-md ${
                          styles.textColor
                        } ${styles.hoverColor} ${
                          isActive("/history") ? styles.activeColor : ""
                        }`}
                      >
                        <History size={20} />
                        {isExpanded && (
                          <span className="ml-3">Watch History</span>
                        )}
                      </Link>
                    </TooltipTrigger>
                    {!isExpanded && (
                      <TooltipContent side="right">
                        Watch History
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </li>
              <li>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        to="/profile"
                        className={`flex items-center p-2 rounded-md ${
                          styles.textColor
                        } ${styles.hoverColor} ${
                          isActive("/profile") ? styles.activeColor : ""
                        }`}
                      >
                        <User size={20} />
                        {isExpanded && <span className="ml-3">Profile</span>}
                      </Link>
                    </TooltipTrigger>
                    {!isExpanded && (
                      <TooltipContent side="right">Profile</TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </li>
            </ul>
          )}
        </nav>

        {/* Bottom section */}
        <div className="mt-auto p-3 border-t border-gray-800">
          {authStatus ? (
            <div className="flex flex-col gap-2">
              {isExpanded && (
                <div className="flex items-center mb-2">
                  <img
                    src={avatarUrl}
                    alt={username}
                    className="h-8 w-8 rounded-full mr-2"
                  />
                  <span className={`${styles.textColor} text-sm truncate`}>
                    {username}
                  </span>
                </div>
              )}
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size={isExpanded ? "default" : "icon"}
                      onClick={handleLogout}
                      className={`${styles.textColor} ${styles.hoverColor} ${
                        isExpanded ? "justify-start" : ""
                      }`}
                    >
                      <LogOut size={20} />
                      {isExpanded && <span className="ml-2">Logout</span>}
                    </Button>
                  </TooltipTrigger>
                  {!isExpanded && (
                    <TooltipContent side="right">Logout</TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size={isExpanded ? "default" : "icon"}
                    onClick={onLoginClick}
                    className={`${styles.textColor} ${styles.hoverColor} ${
                      isExpanded ? "justify-start w-full" : ""
                    }`}
                  >
                    <LogIn size={20} />
                    {isExpanded && <span className="ml-2">Login</span>}
                  </Button>
                </TooltipTrigger>
                {!isExpanded && (
                  <TooltipContent side="right">Login</TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          )}
          
          {/* Theme selector */}
          <div className={`mt-2 ${isExpanded ? "px-2" : "flex justify-center"}`}>
            <ThemeSelector isCompact={!isExpanded} />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
