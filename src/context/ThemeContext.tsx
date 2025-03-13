import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuthContext } from "./AuthContext";
import { setUserTheme, getUserTheme } from "@/lib/firebase";

type ThemeType =
  | "dark"
  | "light"
  | "midnight-blue"
  | "lemon-fresh"
  | "coral-delight"
  | "forest-atmosphere"
  | "lavender-bliss"
  | "sunset-glow"
  | "ocean-breeze"
  | "modern-mint"
  | "royal-elegance"
  | "autumn-harvest"
  | "tech-noir"
  | "serene-sky"
  | "pink-teal-cream"
  | "orange-yellow"
  | "fuchsia-dark"
  | "green-red-white"
  | "cream-black"
  | "black-white"
  | "dark-pink"
  | "blue-mint"
  | "red-black"
  | "dark-green-ivory"
  | "bright-green-pink"
  | "yellow-green"
  | "blue-shades"
  | "lime-white"
  | "beige-grey"
  | "pastel-purple"
  | "navy-electric"
  | "stripe-gradient"
  | "blue-lagoon"
  | "horror-red"
  | "slumber"
  | "banky"
  | "sothebys"
  | "liberty"
  | "imprint"
  | "circus"
  | "mila"
  | "kelsey"
  | "inside-head"
  | "engineered";

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  availableThemes: ThemeType[];
}

const availableThemes: ThemeType[] = [
  "dark",
  "light",
  "midnight-blue",
  "lemon-fresh",
  "coral-delight",
  "forest-atmosphere",
  "lavender-bliss",
  "sunset-glow",
  "ocean-breeze",
  "modern-mint",
  "royal-elegance",
  "autumn-harvest",
  "tech-noir",
  "serene-sky",
  "pink-teal-cream",
  "orange-yellow",
  "fuchsia-dark",
  "green-red-white",
  "cream-black",
  "black-white",
  "dark-pink",
  "blue-mint",
  "red-black",
  "dark-green-ivory",
  "bright-green-pink",
  "yellow-green",
  "blue-shades",
  "lime-white",
  "beige-grey",
  "pastel-purple",
  "navy-electric",
  "stripe-gradient",
  "blue-lagoon",
  "horror-red",
  "slumber",
  "banky",
  "sothebys",
  "liberty",
  "imprint",
  "circus",
  "mila",
  "kelsey",
  "inside-head",
  "engineered"
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme CSS variables based on Webflow color combinations
const themeVariables: Record<ThemeType, Record<string, string>> = {
  // Classic dark theme - Enhanced with deeper blacks and better contrast
  "dark": {
    "--background": "222.2 84% 3.9%",
    "--foreground": "210 40% 98%",
    "--card": "222.2 84% 5.5%",
    "--card-foreground": "210 40% 98%",
    "--popover": "222.2 84% 3.9%",
    "--popover-foreground": "210 40% 98%",
    "--primary": "217.2 91.2% 59.8%",
    "--primary-foreground": "222.2 47.4% 11.2%",
    "--secondary": "217.2 32.6% 17.5%",
    "--secondary-foreground": "210 40% 98%",
    "--muted": "217.2 32.6% 17.5%",
    "--muted-foreground": "215 20.2% 75.1%",
    "--accent": "217.2 32.6% 17.5%",
    "--accent-foreground": "210 40% 98%",
    "--destructive": "0 62.8% 40.6%",
    "--destructive-foreground": "210 40% 98%",
    "--border": "217.2 32.6% 17.5%",
    "--input": "217.2 32.6% 17.5%",
    "--ring": "212.7 26.8% 83.9%"
  },
  // Classic light theme - Improved with softer whites and better contrast
  "light": {
    "--background": "0 0% 99%",
    "--foreground": "222.2 84% 4.9%",
    "--card": "0 0% 100%",
    "--card-foreground": "222.2 84% 4.9%",
    "--popover": "0 0% 100%",
    "--popover-foreground": "222.2 84% 4.9%",
    "--primary": "221.2 83.2% 53.3%",
    "--primary-foreground": "210 40% 98%",
    "--secondary": "210 40% 96.1%",
    "--secondary-foreground": "222.2 47.4% 11.2%",
    "--muted": "210 40% 96.1%",
    "--muted-foreground": "215.4 16.3% 46.9%",
    "--accent": "210 40% 94.1%",
    "--accent-foreground": "222.2 47.4% 11.2%",
    "--destructive": "0 84.2% 60.2%",
    "--destructive-foreground": "210 40% 98%",
    "--border": "214.3 31.8% 91.4%",
    "--input": "214.3 31.8% 91.4%",
    "--ring": "221.2 83.2% 53.3%"
  },
  // Blue & pastel pink - Enriched with deeper blues
  "midnight-blue": {
    "--background": "225 65% 18%",
    "--foreground": "0 25% 98%",
    "--primary": "225 70% 50%",
    "--primary-foreground": "0 25% 98%",
    "--card": "225 65% 13%",
    "--card-foreground": "0 25% 98%",
    "--border": "225 40% 30%",
    "--input": "225 50% 30%",
    "--accent": "0 70% 87%",
    "--accent-foreground": "225 65% 25%",
    "--secondary": "225 30% 30%",
    "--secondary-foreground": "0 25% 98%",
    "--muted": "225 30% 30%",
    "--muted-foreground": "0 25% 80%",
    "--popover": "225 65% 13%",
    "--popover-foreground": "0 25% 98%",
    "--destructive": "0 70% 50%",
    "--destructive-foreground": "0 25% 98%",
    "--ring": "225 70% 50%"
  },
  // Dark charcoal & bright yellow - Enhanced vibrancy
  "lemon-fresh": {
    "--background": "0 0% 8%",
    "--foreground": "50 100% 87%",
    "--primary": "50 100% 65%",
    "--primary-foreground": "0 0% 0%",
    "--card": "0 0% 10%",
    "--card-foreground": "50 100% 87%",
    "--border": "0 0% 20%",
    "--input": "0 0% 25%",
    "--accent": "50 100% 54%",
    "--accent-foreground": "0 0% 8%",
    "--secondary": "0 0% 15%",
    "--secondary-foreground": "50 100% 87%",
    "--muted": "0 0% 15%",
    "--muted-foreground": "50 100% 75%",
    "--popover": "0 0% 10%",
    "--popover-foreground": "50 100% 87%",
    "--destructive": "0 70% 50%",
    "--destructive-foreground": "50 100% 87%",
    "--ring": "50 100% 65%"
  },
  // Light red & yellow - Amplified warmth
  "coral-delight": {
    "--background": "0 55% 53%",
    "--foreground": "50 100% 97%",
    "--primary": "50 85% 60%",
    "--primary-foreground": "0 0% 8%",
    "--card": "0 55% 48%",
    "--card-foreground": "50 100% 97%",
    "--border": "0 55% 45%",
    "--input": "0 45% 60%",
    "--accent": "50 85% 80%",
    "--accent-foreground": "0 55% 35%",
    "--secondary": "0 45% 40%",
    "--secondary-foreground": "50 100% 97%",
    "--muted": "0 45% 40%",
    "--muted-foreground": "50 100% 90%",
    "--popover": "0 55% 48%",
    "--popover-foreground": "50 100% 97%",
    "--destructive": "0 85% 40%",
    "--destructive-foreground": "50 100% 97%",
    "--ring": "50 85% 60%"
  },
  // Dark chestnut brown, burnt sienna, & soft cream - Refined elegance
  "autumn-harvest": {
    "--background": "10 50% 18%",
    "--foreground": "35 45% 97%",
    "--primary": "15 60% 40%", 
    "--primary-foreground": "35 45% 97%",
    "--card": "10 50% 13%",
    "--card-foreground": "35 45% 97%",
    "--border": "10 50% 28%",
    "--input": "10 40% 25%",
    "--accent": "35 45% 85%",
    "--accent-foreground": "10 50% 20%",
    "--secondary": "15 40% 30%",
    "--secondary-foreground": "35 45% 97%",
    "--muted": "15 40% 30%",
    "--muted-foreground": "35 45% 80%",
    "--popover": "10 50% 13%",
    "--popover-foreground": "35 45% 97%",
    "--destructive": "0 70% 45%",
    "--destructive-foreground": "35 45% 97%",
    "--ring": "15 60% 40%"
  },
  // Olive green and peach - Enhanced natural tones
  "forest-atmosphere": {
    "--background": "80 40% 28%",
    "--foreground": "30 55% 92%",
    "--primary": "80 45% 42%",
    "--primary-foreground": "30 55% 97%",
    "--card": "80 40% 22%",
    "--card-foreground": "30 55% 92%",
    "--border": "80 40% 32%",
    "--input": "80 30% 37%",
    "--accent": "30 55% 78%",
    "--accent-foreground": "80 40% 25%",
    "--secondary": "80 30% 35%",
    "--secondary-foreground": "30 55% 92%",
    "--muted": "80 30% 35%",
    "--muted-foreground": "30 55% 80%",
    "--popover": "80 40% 22%",
    "--popover-foreground": "30 55% 92%",
    "--destructive": "0 70% 45%",
    "--destructive-foreground": "30 55% 92%",
    "--ring": "80 45% 42%"
  },
  // Deep purple and goldenrod - Royal richness
  "royal-elegance": {
    "--background": "280 65% 22%",
    "--foreground": "45 95% 78%",
    "--primary": "280 75% 52%",
    "--primary-foreground": "45 95% 88%",
    "--card": "280 65% 17%",
    "--card-foreground": "45 95% 78%",
    "--border": "280 45% 32%",
    "--input": "280 45% 28%",
    "--accent": "45 95% 68%",
    "--accent-foreground": "280 65% 28%",
    "--secondary": "280 45% 35%",
    "--secondary-foreground": "45 95% 78%",
    "--muted": "280 45% 35%",
    "--muted-foreground": "45 95% 65%",
    "--popover": "280 65% 17%",
    "--popover-foreground": "45 95% 78%",
    "--destructive": "0 75% 48%",
    "--destructive-foreground": "45 95% 78%",
    "--ring": "280 75% 52%"
  },
  // Mint green and light pink - Refreshed pastel
  "modern-mint": {
    "--background": "160 65% 33%",
    "--foreground": "330 35% 92%",
    "--primary": "160 85% 68%",
    "--primary-foreground": "0 0% 8%",
    "--card": "160 65% 27%",
    "--card-foreground": "330 35% 92%",
    "--border": "160 45% 38%",
    "--input": "160 45% 42%",
    "--accent": "330 35% 78%",
    "--accent-foreground": "160 65% 25%",
    "--secondary": "160 45% 38%",
    "--secondary-foreground": "330 35% 92%",
    "--muted": "160 45% 38%",
    "--muted-foreground": "330 35% 80%",
    "--popover": "160 65% 27%",
    "--popover-foreground": "330 35% 92%",
    "--destructive": "0 70% 45%",
    "--destructive-foreground": "330 35% 92%",
    "--ring": "160 85% 68%"
  },
  // Royal blue, lemon yellow, and gray - Tech enhancement
  "tech-noir": {
    "--background": "225 75% 33%",
    "--foreground": "50 100% 97%",
    "--primary": "225 85% 57%",
    "--primary-foreground": "0 0% 100%",
    "--card": "225 75% 28%",
    "--card-foreground": "50 100% 97%",
    "--border": "225 45% 43%",
    "--input": "225 45% 45%",
    "--accent": "50 100% 72%",
    "--accent-foreground": "0 0% 15%",
    "--secondary": "225 45% 43%",
    "--secondary-foreground": "50 100% 97%",
    "--muted": "225 45% 43%",
    "--muted-foreground": "50 100% 85%",
    "--popover": "225 75% 28%",
    "--popover-foreground": "50 100% 97%",
    "--destructive": "0 75% 48%",
    "--destructive-foreground": "50 100% 97%",
    "--ring": "225 85% 57%"
  },
  // Teal and gray - Ocean depth
  "ocean-breeze": {
    "--background": "180 75% 22%",
    "--foreground": "0 0% 97%",
    "--primary": "180 80% 48%",
    "--primary-foreground": "0 0% 100%",
    "--card": "180 75% 17%",
    "--card-foreground": "0 0% 97%",
    "--border": "180 45% 33%",
    "--input": "180 45% 38%",
    "--accent": "0 0% 80%",
    "--accent-foreground": "180 75% 25%",
    "--secondary": "180 45% 30%",
    "--secondary-foreground": "0 0% 97%",
    "--muted": "180 45% 30%",
    "--muted-foreground": "0 0% 80%",
    "--popover": "180 75% 17%",
    "--popover-foreground": "0 0% 97%",
    "--destructive": "0 75% 48%",
    "--destructive-foreground": "0 0% 97%",
    "--ring": "180 80% 48%"
  },
  // Plum and taupe - Lavender luxury
  "lavender-bliss": {
    "--background": "300 45% 28%",
    "--foreground": "30 20% 92%",
    "--primary": "300 55% 52%",
    "--primary-foreground": "0 0% 100%",
    "--card": "300 45% 22%",
    "--card-foreground": "30 20% 92%",
    "--border": "300 35% 38%",
    "--input": "300 35% 42%",
    "--accent": "30 20% 75%",
    "--accent-foreground": "300 45% 32%",
    "--secondary": "300 35% 38%",
    "--secondary-foreground": "30 20% 92%",
    "--muted": "300 35% 38%",
    "--muted-foreground": "30 20% 80%",
    "--popover": "300 45% 22%",
    "--popover-foreground": "30 20% 92%",
    "--destructive": "0 75% 48%",
    "--destructive-foreground": "30 20% 92%",
    "--ring": "300 55% 52%"
  },
  // Mustard yellow and navy blue - Golden sunset
  "sunset-glow": {
    "--background": "45 85% 33%",
    "--foreground": "220 75% 97%",
    "--primary": "45 90% 55%",
    "--primary-foreground": "220 75% 18%",
    "--card": "45 85% 28%",
    "--card-foreground": "220 75% 97%",
    "--border": "45 65% 43%",
    "--input": "45 65% 48%",
    "--accent": "220 75% 38%",
    "--accent-foreground": "45 85% 87%",
    "--secondary": "45 65% 43%",
    "--secondary-foreground": "220 75% 97%",
    "--muted": "45 65% 43%",
    "--muted-foreground": "220 75% 85%",
    "--popover": "45 85% 28%",
    "--popover-foreground": "220 75% 97%",
    "--destructive": "0 75% 48%",
    "--destructive-foreground": "220 75% 97%",
    "--ring": "45 90% 55%"
  },
  // Dark charcoal, deep rust, & sky blue - Serene atmosphere
  "serene-sky": {
    "--background": "210 10% 18%",
    "--foreground": "200 35% 88%",
    "--primary": "0 45% 37%",
    "--primary-foreground": "200 35% 97%",
    "--card": "210 10% 13%",
    "--card-foreground": "200 35% 88%",
    "--border": "210 10% 28%",
    "--input": "210 10% 33%",
    "--accent": "200 45% 68%",
    "--accent-foreground": "0 45% 33%",
    "--secondary": "210 10% 28%",
    "--secondary-foreground": "200 35% 88%",
    "--muted": "210 10% 28%",
    "--muted-foreground": "200 35% 75%",
    "--popover": "210 10% 13%",
    "--popover-foreground": "200 35% 88%",
    "--destructive": "0 75% 48%",
    "--destructive-foreground": "200 35% 88%",
    "--ring": "0 45% 37%"
  },
  // New themes
  "pink-teal-cream": {
    "--background": "330 100% 85%",
    "--foreground": "180 65% 25%",
    "--primary": "330 100% 75%",
    "--primary-foreground": "180 65% 25%",
    "--card": "330 100% 90%",
    "--card-foreground": "180 65% 25%",
    "--border": "330 100% 80%",
    "--input": "330 100% 80%",
    "--accent": "180 65% 75%",
    "--accent-foreground": "330 100% 85%",
    "--secondary": "180 65% 35%",
    "--secondary-foreground": "330 100% 95%",
    "--muted": "180 65% 35%",
    "--muted-foreground": "330 100% 75%",
    "--popover": "330 100% 90%",
    "--popover-foreground": "180 65% 25%",
    "--destructive": "0 75% 48%",
    "--destructive-foreground": "330 100% 95%",
    "--ring": "330 100% 75%"
  },
  "orange-yellow": {
    "--background": "35 100% 55%",
    "--foreground": "45 100% 65%",
    "--primary": "35 100% 55%",
    "--primary-foreground": "45 100% 65%",
    "--card": "35 100% 50%",
    "--card-foreground": "45 100% 65%",
    "--border": "35 100% 45%",
    "--input": "35 100% 45%",
    "--accent": "45 100% 55%",
    "--accent-foreground": "35 100% 55%",
    "--secondary": "45 100% 45%",
    "--secondary-foreground": "35 100% 65%",
    "--muted": "45 100% 45%",
    "--muted-foreground": "35 100% 55%",
    "--popover": "35 100% 50%",
    "--popover-foreground": "45 100% 65%",
    "--destructive": "0 75% 48%",
    "--destructive-foreground": "45 100% 65%",
    "--ring": "35 100% 55%"
  },
  "fuchsia-dark": {
    "--background": "330 85% 45%",
    "--foreground": "0 0% 100%",
    "--primary": "330 85% 45%",
    "--primary-foreground": "0 0% 100%",
    "--card": "330 85% 40%",
    "--card-foreground": "0 0% 100%",
    "--border": "330 85% 35%",
    "--input": "330 85% 35%",
    "--accent": "330 85% 55%",
    "--accent-foreground": "0 0% 100%",
    "--secondary": "330 85% 35%",
    "--secondary-foreground": "0 0% 100%",
    "--muted": "330 85% 35%",
    "--muted-foreground": "330 85% 75%",
    "--popover": "330 85% 40%",
    "--popover-foreground": "0 0% 100%",
    "--destructive": "0 75% 48%",
    "--destructive-foreground": "0 0% 100%",
    "--ring": "330 85% 45%"
  },
  "green-red-white": {
    "--background": "120 65% 22%",
    "--foreground": "0 0% 100%",
    "--primary": "120 65% 22%",
    "--primary-foreground": "0 0% 100%",
    "--card": "120 65% 17%",
    "--card-foreground": "0 0% 100%",
    "--border": "120 65% 12%",
    "--input": "120 65% 12%",
    "--accent": "0 65% 45%",
    "--accent-foreground": "0 0% 100%",
    "--secondary": "0 65% 35%",
    "--secondary-foreground": "0 0% 100%",
    "--muted": "0 65% 35%",
    "--muted-foreground": "120 65% 75%",
    "--popover": "120 65% 17%",
    "--popover-foreground": "0 0% 100%",
    "--destructive": "0 75% 48%",
    "--destructive-foreground": "0 0% 100%",
    "--ring": "120 65% 22%"
  },
  "cream-black": {
    "--background": "45 100% 97%",
    "--foreground": "0 0% 0%",
    "--primary": "45 100% 97%",
    "--primary-foreground": "0 0% 0%",
    "--card": "45 100% 92%",
    "--card-foreground": "0 0% 0%",
    "--border": "45 100% 87%",
    "--input": "45 100% 87%",
    "--accent": "0 0% 0%",
    "--accent-foreground": "45 100% 97%",
    "--secondary": "0 0% 0%",
    "--secondary-foreground": "45 100% 97%",
    "--muted": "0 0% 0%",
    "--muted-foreground": "45 100% 77%",
    "--popover": "45 100% 92%",
    "--popover-foreground": "0 0% 0%",
    "--destructive": "0 75% 48%",
    "--destructive-foreground": "45 100% 97%",
    "--ring": "45 100% 97%"
  },
  "black-white": {
    "--background": "0 0% 0%",
    "--foreground": "0 0% 100%",
    "--primary": "0 0% 0%",
    "--primary-foreground": "0 0% 100%",
    "--card": "0 0% 0%",
    "--card-foreground": "0 0% 100%",
    "--border": "0 0% 20%",
    "--input": "0 0% 20%",
    "--accent": "0 0% 100%",
    "--accent-foreground": "0 0% 0%",
    "--secondary": "0 0% 20%",
    "--secondary-foreground": "0 0% 100%",
    "--muted": "0 0% 20%",
    "--muted-foreground": "0 0% 80%",
    "--popover": "0 0% 0%",
    "--popover-foreground": "0 0% 100%",
    "--destructive": "0 75% 48%",
    "--destructive-foreground": "0 0% 100%",
    "--ring": "0 0% 0%"
  },
  "dark-pink": {
    "--background": "330 100% 30%",
    "--foreground": "0 0% 100%",
    "--primary": "330 100% 30%",
    "--primary-foreground": "0 0% 100%",
    "--card": "330 100% 25%",
    "--card-foreground": "0 0% 100%",
    "--border": "330 100% 20%",
    "--input": "330 100% 20%",
    "--accent": "330 100% 40%",
    "--accent-foreground": "0 0% 100%",
    "--secondary": "330 100% 20%",
    "--secondary-foreground": "0 0% 100%",
    "--muted": "330 100% 20%",
    "--muted-foreground": "330 100% 70%",
    "--popover": "330 100% 25%",
    "--popover-foreground": "0 0% 100%",
    "--destructive": "0 75% 48%",
    "--destructive-foreground": "0 0% 100%",
    "--ring": "330 100% 30%"
  },
  "blue-mint": {
    "--background": "210 100% 37%",
    "--foreground": "0 0% 100%",
    "--primary": "210 100% 37%",
    "--primary-foreground": "0 0% 100%",
    "--card": "210 100% 32%",
    "--card-foreground": "0 0% 100%",
    "--border": "210 100% 27%",
    "--input": "210 100% 27%",
    "--accent": "160 100% 50%",
    "--accent-foreground": "210 100% 37%",
    "--secondary": "160 100% 40%",
    "--secondary-foreground": "0 0% 100%",
    "--muted": "160 100% 40%",
    "--muted-foreground": "210 100% 70%",
    "--popover": "210 100% 32%",
    "--popover-foreground": "0 0% 100%",
    "--destructive": "0 75% 48%",
    "--destructive-foreground": "0 0% 100%",
    "--ring": "210 100% 37%"
  },
  "red-black": {
    "--background": "0 85% 37%",
    "--foreground": "0 0% 100%",
    "--primary": "0 85% 37%",
    "--primary-foreground": "0 0% 100%",
    "--card": "0 85% 32%",
    "--card-foreground": "0 0% 100%",
    "--border": "0 85% 27%",
    "--input": "0 85% 27%",
    "--accent": "0 0% 0%",
    "--accent-foreground": "0 0% 100%",
    "--secondary": "0 0% 0%",
    "--secondary-foreground": "0 0% 100%",
    "--muted": "0 0% 0%",
    "--muted-foreground": "0 85% 70%",
    "--popover": "0 85% 32%",
    "--popover-foreground": "0 0% 100%",
    "--destructive": "0 75% 48%",
    "--destructive-foreground": "0 0% 100%",
    "--ring": "0 85% 37%"
  },
  "dark-green-ivory": {
    "--background": "150 100% 30%",
    "--foreground": "45 100% 95%",
    "--primary": "150 100% 30%",
    "--primary-foreground": "45 100% 95%",
    "--card": "150 100% 25%",
    "--card-foreground": "45 100% 95%",
    "--border": "150 100% 20%",
    "--input": "150 100% 20%",
    "--accent": "45 100% 85%",
    "--accent-foreground": "150 100% 30%",
    "--secondary": "45 100% 75%",
    "--secondary-foreground": "150 100% 30%",
    "--muted": "45 100% 75%",
    "--muted-foreground": "150 100% 70%",
    "--popover": "150 100% 25%",
    "--popover-foreground": "45 100% 95%",
    "--destructive": "0 75% 48%",
    "--destructive-foreground": "45 100% 95%",
    "--ring": "150 100% 30%"
  },
  "bright-green-pink": {
    "--background": "120 100% 58%",
    "--foreground": "330 100% 50%",
    "--primary": "120 100% 58%",
    "--primary-foreground": "330 100% 50%",
    "--card": "120 100% 53%",
    "--card-foreground": "330 100% 50%",
    "--border": "120 100% 48%",
    "--input": "120 100% 48%",
    "--accent": "330 100% 50%",
    "--accent-foreground": "120 100% 58%",
    "--secondary": "330 100% 40%",
    "--secondary-foreground": "120 100% 58%",
    "--muted": "330 100% 40%",
    "--muted-foreground": "120 100% 70%",
    "--popover": "120 100% 53%",
    "--popover-foreground": "330 100% 50%",
    "--destructive": "0 75% 48%",
    "--destructive-foreground": "120 100% 58%",
    "--ring": "120 100% 58%"
  },
  "yellow-green": {
    "--background": "90 100% 65%",
    "--foreground": "0 0% 43%",
    "--primary": "90 100% 65%",
    "--primary-foreground": "0 0% 43%",
    "--card": "90 100% 60%",
    "--card-foreground": "0 0% 43%",
    "--border": "90 100% 55%",
    "--input": "90 100% 55%",
    "--accent": "0 0% 43%",
    "--accent-foreground": "90 100% 65%",
    "--secondary": "0 0% 33%",
    "--secondary-foreground": "90 100% 65%",
    "--muted": "0 0% 33%",
    "--muted-foreground": "90 100% 70%",
    "--popover": "90 100% 60%",
    "--popover-foreground": "0 0% 43%",
    "--destructive": "0 75% 48%",
    "--destructive-foreground": "90 100% 65%",
    "--ring": "90 100% 65%"
  },
  "blue-shades": {
    "--background": "200 100% 45%",
    "--foreground": "0 0% 100%",
    "--primary": "200 100% 45%",
    "--primary-foreground": "0 0% 100%",
    "--card": "200 100% 40%",
    "--card-foreground": "0 0% 100%",
    "--border": "200 100% 35%",
    "--input": "200 100% 35%",
    "--accent": "200 100% 55%",
    "--accent-foreground": "0 0% 100%",
    "--secondary": "200 100% 35%",
    "--secondary-foreground": "0 0% 100%",
    "--muted": "200 100% 35%",
    "--muted-foreground": "200 100% 70%",
    "--popover": "200 100% 40%",
    "--popover-foreground": "0 0% 100%",
    "--destructive": "0 75% 48%",
    "--destructive-foreground": "0 0% 100%",
    "--ring": "200 100% 45%"
  },
  "lime-white": {
    "--background": "120 100% 43%",
    "--foreground": "0 0% 100%",
    "--primary": "120 100% 43%",
    "--primary-foreground": "0 0% 100%",
    "--card": "120 100% 38%",
    "--card-foreground": "0 0% 100%",
    "--border": "120 100% 33%",
    "--input": "120 100% 33%",
    "--accent": "120 100% 53%",
    "--accent-foreground": "0 0% 100%",
    "--secondary": "120 100% 33%",
    "--secondary-foreground": "0 0% 100%",
    "--muted": "120 100% 33%",
    "--muted-foreground": "120 100% 70%",
    "--popover": "120 100% 38%",
    "--popover-foreground": "0 0% 100%",
    "--destructive": "0 75% 48%",
    "--destructive-foreground": "0 0% 100%",
    "--ring": "120 100% 43%"
  },
  "beige-grey": {
    "--background": "30 20% 85%",
    "--foreground": "0 0% 20%",
    "--primary": "30 20% 85%",
    "--primary-foreground": "0 0% 20%",
    "--card": "30 20% 80%",
    "--card-foreground": "0 0% 20%",
    "--border": "30 20% 75%",
    "--input": "30 20% 75%",
    "--accent": "0 0% 20%",
    "--accent-foreground": "30 20% 85%",
    "--secondary": "0 0% 20%",
    "--secondary-foreground": "30 20% 85%",
    "--muted": "0 0% 20%",
    "--muted-foreground": "30 20% 65%",
    "--popover": "30 20% 80%",
    "--popover-foreground": "0 0% 20%",
    "--destructive": "0 75% 48%",
    "--destructive-foreground": "30 20% 85%",
    "--ring": "30 20% 85%"
  },
  "pastel-purple": {
    "--background": "300 20% 75%",
    "--foreground": "300 20% 25%",
    "--primary": "300 20% 75%",
    "--primary-foreground": "300 20% 25%",
    "--card": "300 20% 70%",
    "--card-foreground": "300 20% 25%",
    "--border": "300 20% 65%",
    "--input": "300 20% 65%",
    "--accent": "300 20% 85%",
    "--accent-foreground": "300 20% 25%",
    "--secondary": "300 20% 65%",
    "--secondary-foreground": "300 20% 25%",
    "--muted": "300 20% 65%",
    "--muted-foreground": "300 20% 55%",
    "--popover": "300 20% 70%",
    "--popover-foreground": "300 20% 25%",
    "--destructive": "0 75% 48%",
    "--destructive-foreground": "300 20% 75%",
    "--ring": "300 20% 75%"
  },
  "navy-electric": {
    "--background": "220 100% 24%",
    "--foreground": "180 100% 50%",
    "--primary": "220 100% 24%",
    "--primary-foreground": "180 100% 50%",
    "--card": "220 100% 19%",
    "--card-foreground": "180 100% 50%",
    "--border": "220 100% 14%",
    "--input": "220 100% 14%",
    "--accent": "180 100% 50%",
    "--accent-foreground": "220 100% 24%",
    "--secondary": "180 100% 40%",
    "--secondary-foreground": "220 100% 24%",
    "--muted": "180 100% 40%",
    "--muted-foreground": "220 100% 70%",
    "--popover": "220 100% 19%",
    "--popover-foreground": "180 100% 50%",
    "--destructive": "0 75% 48%",
    "--destructive-foreground": "180 100% 50%",
    "--ring": "220 100% 24%"
  },
  "stripe-gradient": {
    "--background": "220 20% 97%",
    "--foreground": "220 100% 13%",
    "--primary": "220 100% 13%",
    "--primary-foreground": "220 20% 97%",
    "--card": "220 20% 97%",
    "--card-foreground": "220 100% 13%",
    "--border": "220 20% 92%",
    "--input": "220 20% 92%",
    "--accent": "220 100% 13%",
    "--accent-foreground": "220 20% 97%",
    "--secondary": "220 20% 92%",
    "--secondary-foreground": "220 100% 13%",
    "--muted": "220 20% 92%",
    "--muted-foreground": "220 100% 13%",
    "--popover": "220 20% 97%",
    "--popover-foreground": "220 100% 13%",
    "--destructive": "0 75% 48%",
    "--destructive-foreground": "220 20% 97%",
    "--ring": "220 100% 13%"
  },
  "blue-lagoon": {
    "--background": "200 50% 70%",
    "--foreground": "200 50% 20%",
    "--primary": "200 50% 70%",
    "--primary-foreground": "200 50% 20%",
    "--card": "200 50% 65%",
    "--card-foreground": "200 50% 20%",
    "--border": "200 50% 60%",
    "--input": "200 50% 60%",
    "--accent": "200 50% 80%",
    "--accent-foreground": "200 50% 20%",
    "--secondary": "200 50% 60%",
    "--secondary-foreground": "200 50% 20%",
    "--muted": "200 50% 60%",
    "--muted-foreground": "200 50% 50%",
    "--popover": "200 50% 65%",
    "--popover-foreground": "200 50% 20%",
    "--destructive": "0 75% 48%",
    "--destructive-foreground": "200 50% 70%",
    "--ring": "200 50% 70%"
  },
  "horror-red": {
    "--background": "0 85% 58%",
    "--foreground": "0 0% 100%",
    "--primary": "0 85% 58%",
    "--primary-foreground": "0 0% 100%",
    "--card": "0 85% 53%",
    "--card-foreground": "0 0% 100%",
    "--border": "0 85% 48%",
    "--input": "0 85% 48%",
    "--accent": "0 85% 68%",
    "--accent-foreground": "0 0% 100%",
    "--secondary": "0 85% 48%",
    "--secondary-foreground": "0 0% 100%",
    "--muted": "0 85% 48%",
    "--muted-foreground": "0 85% 70%",
    "--popover": "0 85% 53%",
    "--popover-foreground": "0 0% 100%",
    "--destructive": "0 75% 48%",
    "--destructive-foreground": "0 0% 100%",
    "--ring": "0 85% 58%"
  },
  "slumber": {
    "--background": "220 100% 10%",
    "--foreground": "180 100% 30%",
    "--primary": "220 100% 10%",
    "--primary-foreground": "180 100% 30%",
    "--card": "220 100% 5%",
    "--card-foreground": "180 100% 30%",
    "--border": "220 100% 15%",
    "--input": "220 100% 15%",
    "--accent": "180 100% 30%",
    "--accent-foreground": "220 100% 10%",
    "--secondary": "180 100% 20%",
    "--secondary-foreground": "220 100% 10%",
    "--muted": "180 100% 20%",
    "--muted-foreground": "220 100% 70%",
    "--popover": "220 100% 5%",
    "--popover-foreground": "180 100% 30%",
    "--destructive": "0 75% 48%",
    "--destructive-foreground": "180 100% 30%",
    "--ring": "220 100% 10%"
  },
  "banky": {
    "--background": "45 100% 62%",
    "--foreground": "220 100% 30%",
    "--primary": "45 100% 62%",
    "--primary-foreground": "220 100% 30%",
    "--card": "45 100% 57%",
    "--card-foreground": "220 100% 30%",
    "--border": "45 100% 52%",
    "--input": "45 100% 52%",
    "--accent": "220 100% 30%",
    "--accent-foreground": "45 100% 62%",
    "--secondary": "220 100% 20%",
    "--secondary-foreground": "45 100% 62%",
    "--muted": "220 100% 20%",
    "--muted-foreground": "45 100% 70%",
    "--popover": "45 100% 57%",
    "--popover-foreground": "220 100% 30%",
    "--destructive": "0 75% 48%",
    "--destructive-foreground": "45 100% 62%",
    "--ring": "45 100% 62%"
  },
  "sothebys": {
    "--background": "220 100% 14%",
    "--foreground": "35 100% 60%",
    "--primary": "220 100% 14%",
    "--primary-foreground": "35 100% 60%",
    "--card": "220 100% 9%",
    "--card-foreground": "35 100% 60%",
    "--border": "220 100% 19%",
    "--input": "220 100% 19%",
    "--accent": "35 100% 60%",
    "--accent-foreground": "220 100% 14%",
    "--secondary": "35 100% 50%",
    "--secondary-foreground": "220 100% 14%",
    "--muted": "35 100% 50%",
    "--muted-foreground": "220 100% 70%",
    "--popover": "220 100% 9%",
    "--popover-foreground": "35 100% 60%",
    "--destructive": "0 75% 48%",
    "--destructive-foreground": "35 100% 60%",
    "--ring": "220 100% 14%"
  },
  "liberty": {
    "--background": "320 100% 15%",
    "--foreground": "0 0% 100%",
    "--primary": "320 100% 15%",
    "--primary-foreground": "0 0% 100%",
    "--card": "320 100% 10%",
    "--card-foreground": "0 0% 100%",
    "--border": "320 100% 20%",
    "--input": "320 100% 20%",
    "--accent": "320 100% 25%",
    "--accent-foreground": "0 0% 100%",
    "--secondary": "320 100% 20%",
    "--secondary-foreground": "0 0% 100%",
    "--muted": "320 100% 20%",
    "--muted-foreground": "320 100% 70%",
    "--popover": "320 100% 10%",
    "--popover-foreground": "0 0% 100%",
    "--destructive": "0 75% 48%",
    "--destructive-foreground": "0 0% 100%",
    "--ring": "320 100% 15%"
  },
  "imprint": {
    "--background": "210 100% 58%",
    "--foreground": "0 0% 100%",
    "--primary": "210 100% 58%",
    "--primary-foreground": "0 0% 100%",
    "--card": "210 100% 53%",
    "--card-foreground": "0 0% 100%",
    "--border": "210 100% 48%",
    "--input": "210 100% 48%",
    "--accent": "210 100% 68%",
    "--accent-foreground": "0 0% 100%",
    "--secondary": "210 100% 48%",
    "--secondary-foreground": "0 0% 100%",
    "--muted": "210 100% 48%",
    "--muted-foreground": "210 100% 70%",
    "--popover": "210 100% 53%",
    "--popover-foreground": "0 0% 100%",
    "--destructive": "0 75% 48%",
    "--destructive-foreground": "0 0% 100%",
    "--ring": "210 100% 58%"
  },
  "circus": {
    "--background": "35 100% 50%",
    "--foreground": "0 85% 45%",
    "--primary": "35 100% 50%",
    "--primary-foreground": "0 85% 45%",
    "--card": "35 100% 45%",
    "--card-foreground": "0 85% 45%",
    "--border": "35 100% 40%",
    "--input": "35 100% 40%",
    "--accent": "0 85% 45%",
    "--accent-foreground": "35 100% 50%",
    "--secondary": "0 85% 35%",
    "--secondary-foreground": "35 100% 50%",
    "--muted": "0 85% 35%",
    "--muted-foreground": "35 100% 70%",
    "--popover": "35 100% 45%",
    "--popover-foreground": "0 85% 45%",
    "--destructive": "0 75% 48%",
    "--destructive-foreground": "35 100% 50%",
    "--ring": "35 100% 50%"
  },
  "mila": {
    "--background": "0 100% 63%",
    "--foreground": "320 100% 38%",
    "--primary": "0 100% 63%",
    "--primary-foreground": "320 100% 38%",
    "--card": "0 100% 58%",
    "--card-foreground": "320 100% 38%",
    "--border": "0 100% 53%",
    "--input": "0 100% 53%",
    "--accent": "320 100% 38%",
    "--accent-foreground": "0 100% 63%",
    "--secondary": "320 100% 28%",
    "--secondary-foreground": "0 100% 63%",
    "--muted": "320 100% 28%",
    "--muted-foreground": "0 100% 70%",
    "--popover": "0 100% 58%",
    "--popover-foreground": "320 100% 38%",
    "--destructive": "0 75% 48%",
    "--destructive-foreground": "0 100% 63%",
    "--ring": "0 100% 63%"
  },
  "kelsey": {
    "--background": "45 100% 62%",
    "--foreground": "30 100% 18%",
    "--primary": "45 100% 62%",
    "--primary-foreground": "30 100% 18%",
    "--card": "45 100% 57%",
    "--card-foreground": "30 100% 18%",
    "--border": "45 100% 52%",
    "--input": "45 100% 52%",
    "--accent": "30 100% 18%",
    "--accent-foreground": "45 100% 62%",
    "--secondary": "30 100% 28%",
    "--secondary-foreground": "45 100% 62%",
    "--muted": "30 100% 28%",
    "--muted-foreground": "45 100% 70%",
    "--popover": "45 100% 57%",
    "--popover-foreground": "30 100% 18%",
    "--destructive": "0 75% 48%",
    "--destructive-foreground": "45 100% 62%",
    "--ring": "45 100% 62%"
  },
  "inside-head": {
    "--background": "340 100% 28%",
    "--foreground": "0 0% 100%",
    "--primary": "340 100% 28%",
    "--primary-foreground": "0 0% 100%",
    "--card": "340 100% 23%",
    "--card-foreground": "0 0% 100%",
    "--border": "340 100% 18%",
    "--input": "340 100% 18%",
    "--accent": "340 100% 38%",
    "--accent-foreground": "0 0% 100%",
    "--secondary": "340 100% 18%",
    "--secondary-foreground": "0 0% 100%",
    "--muted": "340 100% 18%",
    "--muted-foreground": "340 100% 70%",
    "--popover": "340 100% 23%",
    "--popover-foreground": "0 0% 100%",
    "--destructive": "0 75% 48%",
    "--destructive-foreground": "0 0% 100%",
    "--ring": "340 100% 28%"
  },
  "engineered": {
    "--background": "30 20% 90%",
    "--foreground": "30 20% 30%",
    "--primary": "30 20% 90%",
    "--primary-foreground": "30 20% 30%",
    "--card": "30 20% 85%",
    "--card-foreground": "30 20% 30%",
    "--border": "30 20% 80%",
    "--input": "30 20% 80%",
    "--accent": "30 20% 30%",
    "--accent-foreground": "30 20% 90%",
    "--secondary": "30 20% 30%",
    "--secondary-foreground": "30 20% 90%",
    "--muted": "30 20% 30%",
    "--muted-foreground": "30 20% 70%",
    "--popover": "30 20% 85%",
    "--popover-foreground": "30 20% 30%",
    "--destructive": "0 75% 48%",
    "--destructive-foreground": "30 20% 90%",
    "--ring": "30 20% 90%"
  }
};

// Apply theme variables to document root
const applyThemeVariables = (theme: ThemeType) => {
  const root = document.documentElement;
  const variables = themeVariables[theme];

  // Apply theme variables
  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  // Add a data attribute for theme-specific styling
  root.setAttribute("data-theme", theme);
  
  // Set a class on the body for direct theme access in CSS if needed
  document.body.classList.remove(
    'theme-dark', 'theme-light', 'theme-midnight-blue', 'theme-lemon-fresh', 
    'theme-coral-delight', 'theme-forest-atmosphere', 'theme-lavender-bliss', 
    'theme-sunset-glow', 'theme-ocean-breeze', 'theme-modern-mint', 
    'theme-royal-elegance', 'theme-autumn-harvest', 'theme-tech-noir', 
    'theme-serene-sky'
  );
  document.body.classList.add(`theme-${theme}`);
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>("midnight-blue");
  const { user, isAuthenticated } = useAuthContext();

  // Load theme from localStorage or use default
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as ThemeType | null;
    if (storedTheme && availableThemes.includes(storedTheme)) {
      setThemeState(storedTheme);
      applyThemeVariables(storedTheme);
    }
  }, []);

  // Load theme from Firebase if user is authenticated
  useEffect(() => {
    const loadUserTheme = async () => {
      if (isAuthenticated && user) {
        try {
          const userTheme = await getUserTheme(user.uid);
          if (userTheme && availableThemes.includes(userTheme as ThemeType)) {
            setThemeState(userTheme as ThemeType);
            applyThemeVariables(userTheme as ThemeType);
          }
        } catch (error) {
          console.error("Error loading user theme:", error);
        }
      }
    };

    loadUserTheme();
  }, [isAuthenticated, user]);

  // Set theme function
  const setTheme = async (newTheme: ThemeType) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
    applyThemeVariables(newTheme);

    // Save theme to Firebase if user is authenticated
    if (isAuthenticated && user) {
      try {
        // Save theme to user profile in Firebase
        await setUserTheme(user.uid, newTheme);
        
        // Log success for debugging
        console.log(`Theme "${newTheme}" saved to Firebase for user ${user.uid}`);
      } catch (error) {
        console.error("Error saving user theme to Firebase:", error);
        // Don't throw error to prevent UI disruption, but log it
      }
    } else {
      console.log("Theme saved to localStorage only (user not authenticated)");
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, availableThemes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
