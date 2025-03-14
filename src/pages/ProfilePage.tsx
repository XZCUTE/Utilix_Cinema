import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuthContext } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Loader, Save, LogOut, Camera, ChevronLeft, ChevronRight, Upload, UploadCloud, User } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define ThemeType to match what's in ThemeContext
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

const profileSchema = z.object({
  displayName: z.string().min(2, {
    message: "Display name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  bio: z.string().max(160).optional(),
});

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated, updateProfile, logout } =
    useAuthContext();
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [currentAvatarPage, setCurrentAvatarPage] = useState(0);
  const avatarsPerPage = 8;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  
  // Updated to include 50 diverse avatar options
  const [avatarOptions] = useState([
    // Original options
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Bella",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Max",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucy",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Luna",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver",
    // New options - adding 43 more diverse avatars
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Jackson",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aiden",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Ava",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Liam",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Mia",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Noah",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Ethan",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Lily",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Mason",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Chloe",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Logan",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Harper",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aria",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Benjamin",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Riley",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Elijah",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Madison",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Carter",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Grace",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Jayden",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Layla",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Ryan",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Zara",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Matthew",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Penelope",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Luke",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Samantha",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Victoria",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Owen",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aurora",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Wyatt",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Stella",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Henry",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Maya",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Sebastian",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Evelyn",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Joseph",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Brooklyn"
  ]);
  
  const [selectedAvatar, setSelectedAvatar] = useState(
    profile?.photoURL || avatarOptions[0],
  );

  // Get Google profile picture if available
  const googleProfilePicture = user?.photoURL || null;

  // Handler for uploading custom avatar
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCustomAvatar(result);
        setSelectedAvatar(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handler for using Google profile picture
  const handleUseGoogleAvatar = () => {
    if (googleProfilePicture) {
      setSelectedAvatar(googleProfilePicture);
    }
  };

  // Trigger file upload dialog
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Calculate visible avatars based on current page
  const visibleAvatars = avatarOptions.slice(
    currentAvatarPage * avatarsPerPage,
    (currentAvatarPage + 1) * avatarsPerPage
  );
  
  // Calculate total pages
  const totalPages = Math.ceil(avatarOptions.length / avatarsPerPage);
  
  // Handle page navigation
  const goToNextPage = () => {
    setCurrentAvatarPage((prev) => (prev + 1) % totalPages);
  };
  
  const goToPrevPage = () => {
    setCurrentAvatarPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: profile?.displayName || user?.displayName || "",
      email: profile?.email || user?.email || "",
      bio: profile?.bio || "",
    },
  });

  // Update form when profile changes
  useEffect(() => {
    if (profile) {
      form.reset({
        displayName: profile.displayName || "",
        email: profile.email || "",
        bio: profile.bio || "",
      });
      setSelectedAvatar(profile.photoURL || avatarOptions[0]);
    }
  }, [profile, form, avatarOptions]);

  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      // Create a comprehensive profile update object
      const profileUpdates = {
        ...data,
        photoURL: selectedAvatar,
      };
      
      // Log what we're updating
      console.log("Updating profile with:", profileUpdates);
      
      const result = await updateProfile(profileUpdates);
      
      // Show success toast or notification
      console.log("Profile updated successfully:", result);
      
      // Add a success message here if you have a toast or notification system
    } catch (error) {
      console.error("Error updating profile:", error);
      // Show error toast or notification
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="py-8">
          <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
          <p className="text-card-foreground/70">Manage your profile and preferences</p>

          <Tabs
            defaultValue={activeTab}
            onValueChange={setActiveTab}
            className="mt-8"
          >
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <div className="bg-card rounded-lg p-6 border border-border">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="w-32 h-32 border-4 border-primary">
                      <AvatarImage src={selectedAvatar} />
                      <AvatarFallback>UT</AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col items-center space-y-3">
                      <div className="flex flex-col gap-2">
                        <p className="text-sm text-card-foreground/70">
                          Custom Avatar Options
                        </p>
                        <div className="flex justify-center gap-2">
                          {/* Upload custom avatar button */}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  size="icon" 
                                  variant="outline" 
                                  onClick={triggerFileUpload}
                                  className="relative"
                                >
                                  <UploadCloud className="h-4 w-4" />
                                  <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleAvatarUpload}
                                    accept="image/*"
                                    className="hidden"
                                    aria-label="Upload avatar image"
                                  />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Upload custom avatar</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          {/* Google profile picture button - only show if available */}
                          {googleProfilePicture && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    size="icon" 
                                    variant="outline" 
                                    onClick={handleUseGoogleAvatar}
                                    className={selectedAvatar === googleProfilePicture ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}
                                  >
                                    <User className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Use Google profile picture</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>

                      <Separator className="my-2" />
                      
                      <p className="text-sm text-card-foreground/70">
                        Select an avatar ({currentAvatarPage + 1}/{totalPages})
                      </p>
                      
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {visibleAvatars.map((avatar, index) => (
                        <button
                          key={index}
                            className={`rounded-full overflow-hidden w-12 h-12 ${selectedAvatar === avatar ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
                          onClick={() => setSelectedAvatar(avatar)}
                        >
                          <img
                            src={avatar}
                            alt={`Avatar option ${index + 1}`}
                            className="w-full h-full"
                          />
                        </button>
                      ))}
                      </div>
                      
                      <div className="flex justify-center gap-2 mt-2">
                        <Button 
                          size="icon" 
                          variant="outline" 
                          onClick={goToPrevPage}
                          title="Previous avatars"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="outline" 
                          onClick={goToNextPage}
                          title="More avatars"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 w-full">
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                      >
                        <FormField
                          control={form.control}
                          name="displayName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Display Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Your display name"
                                  {...field}
                                  className="bg-card/50 border-border"
                                />
                              </FormControl>
                              <FormDescription className="text-card-foreground/70">
                                This is your public display name.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="your.email@example.com"
                                  {...field}
                                  className="bg-card/50 border-border"
                                  disabled
                                />
                              </FormControl>
                              <FormDescription className="text-card-foreground/70">
                                Your email address cannot be changed.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="bio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bio</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Tell us a little bit about yourself"
                                  className="resize-none bg-card/50 border-border"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription className="text-card-foreground/70">
                                Brief description for your profile. Max 160
                                characters.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end gap-4">
                          <Button
                            type="submit"
                            disabled={isLoading}
                            className="gap-2"
                          >
                            {isLoading ? (
                              <Loader className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                            Save Changes
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg p-6 border border-border">
                <h2 className="text-xl font-semibold mb-4">Account Actions</h2>
                <p className="text-card-foreground/70 mb-4">
                  Manage your account settings and security
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="outline"
                    className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Log Out
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
              <div className="bg-card rounded-lg p-6 border border-border">
                <h2 className="text-xl font-semibold mb-4">Theme Settings</h2>
                <p className="text-card-foreground/70 mb-6">
                  Customize the appearance of the application
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[
                    { id: "dark", name: "Dark", color: "bg-gray-900" },
                    { id: "light", name: "Light", color: "bg-gray-100" },
                    { id: "midnight-blue", name: "Midnight Blue", color: "bg-blue-800" },
                    { id: "lemon-fresh", name: "Lemon Fresh", color: "bg-yellow-400" },
                    { id: "coral-delight", name: "Coral Delight", color: "bg-red-400" },
                    { id: "forest-atmosphere", name: "Forest Atmosphere", color: "bg-green-700" },
                    { id: "lavender-bliss", name: "Lavender Bliss", color: "bg-purple-700" },
                    { id: "sunset-glow", name: "Sunset Glow", color: "bg-yellow-600" },
                    { id: "ocean-breeze", name: "Ocean Breeze", color: "bg-teal-600" },
                    { id: "modern-mint", name: "Modern Mint", color: "bg-green-400" },
                    { id: "royal-elegance", name: "Royal Elegance", color: "bg-purple-900" },
                    { id: "autumn-harvest", name: "Autumn Harvest", color: "bg-amber-800" },
                    { id: "tech-noir", name: "Tech Noir", color: "bg-blue-700" },
                    { id: "serene-sky", name: "Serene Sky", color: "bg-blue-400" },
                    { id: "pink-teal-cream", name: "Pink Teal Cream", color: "bg-[#FF78AC]" },
                    { id: "orange-yellow", name: "Orange Yellow", color: "bg-[#FF921C]" },
                    { id: "fuchsia-dark", name: "Fuchsia Dark", color: "bg-[#D8125B]" },
                    { id: "green-red-white", name: "Green Red White", color: "bg-[#205A28]" },
                    { id: "cream-black", name: "Cream Black", color: "bg-[#FFFDF2]" },
                    { id: "black-white", name: "Black White", color: "bg-black" },
                    { id: "dark-pink", name: "Dark Pink", color: "bg-[#970747]" },
                    { id: "blue-mint", name: "Blue Mint", color: "bg-[#106EBE]" },
                    { id: "red-black", name: "Red Black", color: "bg-[#B4121B]" },
                    { id: "dark-green-ivory", name: "Dark Green Ivory", color: "bg-[#009B4D]" },
                    { id: "bright-green-pink", name: "Bright Green Pink", color: "bg-[#31EC56]" },
                    { id: "yellow-green", name: "Yellow Green", color: "bg-[#BAFF39]" },
                    { id: "blue-shades", name: "Blue Shades", color: "bg-[#00ABE4]" },
                    { id: "lime-white", name: "Lime White", color: "bg-[#00DD00]" },
                    { id: "beige-grey", name: "Beige Grey", color: "bg-[#DDD0C8]" },
                    { id: "pastel-purple", name: "Pastel Purple", color: "bg-[#C5ADC5]" },
                    { id: "navy-electric", name: "Navy Electric", color: "bg-[#01257D]" },
                    { id: "stripe-gradient", name: "Stripe Gradient", color: "bg-gradient-to-r from-[#F8F8F9] to-[#111439]" },
                    { id: "blue-lagoon", name: "Blue Lagoon", color: "bg-[#96C2DB]" },
                    { id: "horror-red", name: "Horror Red", color: "bg-[#E7473C]" },
                    { id: "slumber", name: "Slumber", color: "bg-[#0A1828]" },
                    { id: "banky", name: "Banky", color: "bg-[#FFCE32]" },
                    { id: "sothebys", name: "Sothebys", color: "bg-[#002349]" },
                    { id: "liberty", name: "Liberty", color: "bg-[#4F0341]" },
                    { id: "imprint", name: "Imprint", color: "bg-[#4A8BDF]" },
                    { id: "circus", name: "Circus", color: "bg-[#FFAB00]" },
                    { id: "mila", name: "Mila", color: "bg-[#FF5841]" },
                    { id: "kelsey", name: "Kelsey", color: "bg-[#FFD43A]" },
                    { id: "inside-head", name: "Inside Head", color: "bg-[#5642A6]" },
                    { id: "engineered", name: "Engineered", color: "bg-[#151515]" }
                  ].map((themeOption) => (
                    <button
                      key={themeOption.id}
                      className={`p-4 rounded-lg border transition-all ${
                        theme === themeOption.id
                          ? "border-primary bg-primary/20"
                          : "border-border bg-card/50 hover:bg-card/80"
                      }`}
                      onClick={() => setTheme(themeOption.id as ThemeType)}
                    >
                      <div className="flex gap-2 mb-2">
                        <div
                          className={`w-8 h-8 rounded-full ${themeOption.color}`}
                        ></div>
                        <div className="flex-1 h-8 rounded bg-card/70 overflow-hidden">
                          <div className={`h-full w-3/4 ${themeOption.color} opacity-30`}></div>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-center">
                        {themeOption.name}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Theme Preview */}
              <div className="bg-card rounded-lg p-6 border border-border">
                <h2 className="text-xl font-semibold mb-4">Theme Preview</h2>
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1">
                    <div className="p-4 rounded-lg bg-background border border-border">
                      <div className="w-40 h-10 mb-4 rounded-md bg-card/70"></div>
                      
                      <div className="flex gap-2 mb-4">
                        <div className="flex-1 h-10 bg-primary rounded-md flex items-center justify-center">
                          <div className="h-2 w-16 rounded-md bg-primary-foreground"></div>
                        </div>
                        <div className="flex-1 h-10 bg-muted rounded-md flex items-center justify-center">
                          <div className="h-2 w-16 rounded-md bg-muted-foreground"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium mb-2 block">Background</span>
                      <div className="h-8 w-full bg-background border border-border rounded-md"></div>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium mb-2 block">Card</span>
                      <div className="h-8 w-full bg-card border border-border rounded-md"></div>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium mb-2 block">Primary</span>
                      <div className="h-8 w-full bg-primary rounded-md"></div>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium mb-2 block">Accent</span>
                      <div className="h-8 w-full bg-accent rounded-md"></div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
