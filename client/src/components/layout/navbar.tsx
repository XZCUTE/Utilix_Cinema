import { Link, useLocation } from "wouter";
import { Search, Film, Home, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Navbar() {
  const [location, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 text-primary">
              <Film className="h-6 w-6" />
              <span className="font-bold text-lg">Utilix Cinema</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
              <Link href="/trending" className="flex items-center gap-2 hover:text-primary transition-colors">
                <TrendingUp className="h-4 w-4" />
                <span>Trending</span>
              </Link>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <Input
              type="search"
              placeholder="Search movies & shows..."
              className="w-[200px] md:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="p-2 hover:text-primary transition-colors">
              <Search className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
