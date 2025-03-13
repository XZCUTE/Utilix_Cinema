import React from "react";
import { useTheme } from "@/context/ThemeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const themeColors = {
  "dark": "bg-gray-900",
  "light": "bg-gray-100",
  "midnight-blue": "bg-blue-800",
  "lemon-fresh": "bg-yellow-400",
  "coral-delight": "bg-red-400",
  "forest-atmosphere": "bg-green-700",
  "lavender-bliss": "bg-purple-700",
  "sunset-glow": "bg-yellow-600",
  "ocean-breeze": "bg-teal-600",
  "modern-mint": "bg-green-400",
  "royal-elegance": "bg-purple-900",
  "autumn-harvest": "bg-amber-800",
  "tech-noir": "bg-blue-700",
  "serene-sky": "bg-blue-400",
  // New themes from the provided color schemes
  "pink-teal-cream": "bg-[#FF78AC]",
  "orange-yellow": "bg-[#FF921C]",
  "fuchsia-dark": "bg-[#D8125B]",
  "green-red-white": "bg-[#205A28]",
  "cream-black": "bg-[#FFFDF2]",
  "black-white": "bg-black",
  "dark-pink": "bg-[#970747]",
  "blue-mint": "bg-[#106EBE]",
  "red-black": "bg-[#B4121B]",
  "dark-green-ivory": "bg-[#009B4D]",
  "bright-green-pink": "bg-[#31EC56]",
  "yellow-green": "bg-[#BAFF39]",
  "blue-shades": "bg-[#00ABE4]",
  "lime-white": "bg-[#00DD00]",
  "beige-grey": "bg-[#DDD0C8]",
  "pastel-purple": "bg-[#C5ADC5]",
  "navy-electric": "bg-[#01257D]",
  "stripe-gradient": "bg-gradient-to-r from-[#F8F8F9] to-[#111439]",
  "blue-lagoon": "bg-[#96C2DB]",
  "horror-red": "bg-[#E7473C]",
  "slumber": "bg-[#0A1828]",
  "banky": "bg-[#FFCE32]",
  "sothebys": "bg-[#002349]",
  "liberty": "bg-[#4F0341]",
  "imprint": "bg-[#4A8BDF]",
  "circus": "bg-[#FFAB00]",
  "mila": "bg-[#FF5841]",
  "kelsey": "bg-[#FFD43A]",
  "inside-head": "bg-[#8E0D3C]",
  "engineered": "bg-[#EAE7DD]"
};

interface ThemeSelectorProps {
  isCompact?: boolean;
}

const ThemeSelector = ({ isCompact = false }: ThemeSelectorProps) => {
  const { theme, setTheme, availableThemes } = useTheme();

  const themeButton = (
    <Button
      variant="ghost"
      size={isCompact ? "icon" : "default"}
      className={`${isCompact ? "" : "w-full justify-start"} hover:bg-accent`}
    >
      <Palette className="h-5 w-5" />
      {!isCompact && <span className="ml-2">Theme</span>}
    </Button>
  );

  return (
    <DropdownMenu>
      {isCompact ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                {themeButton}
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Change Theme</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <DropdownMenuTrigger asChild>
          {themeButton}
        </DropdownMenuTrigger>
      )}
      <DropdownMenuContent
        align="end"
        className="w-56 bg-card border-border"
      >
        <DropdownMenuLabel className="text-foreground">Theme</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        <div className="max-h-[300px] overflow-y-auto py-1">
          {availableThemes.map((themeOption) => (
            <DropdownMenuItem
              key={themeOption}
              className={`flex items-center gap-2 cursor-pointer ${theme === themeOption ? "bg-accent" : "hover:bg-accent"}`}
              onClick={() => setTheme(themeOption)}
            >
              <div
                className={`w-4 h-4 rounded-full ${themeColors[themeOption]}`}
              />
              <span className="capitalize text-foreground">
                {themeOption.replace(/-/g, " ")}
              </span>
              {theme === themeOption && (
                <span className="ml-auto text-xs text-primary">Active</span>
              )}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSelector;
