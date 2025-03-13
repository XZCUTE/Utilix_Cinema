import React, { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  X,
  LogIn,
  Smartphone,
  AlertCircle,
  Loader,
  Link as LinkIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PhoneLogin from "./PhoneLogin";
import EmailLinkLogin from "./EmailLinkLogin";
import ForgotPasswordForm from "./ForgotPasswordForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuthContext } from "@/context/AuthContext";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  });

interface AuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  defaultTab?: "login" | "email-link" | "phone";
  onLogin?: () => void;
  allowClose?: boolean;
}

const AuthModal = ({
  isOpen = true,
  onClose = () => {},
  defaultTab = "login",
  onLogin = () => {},
  allowClose = false,
}: AuthModalProps) => {
  const {
    login,
    loginWithGoogle,
    loading,
    error,
    isAuthenticated,
  } = useAuthContext();
  const [activeTab, setActiveTab] = useState<
    "login" | "email-link" | "phone"
  >(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleClose = () => {
    if (isAuthenticated || allowClose) {
      onClose();
    }
  };

  const handleLoginSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      setIsLoggingIn(true);
      setAuthError(null);

      // Use the login function from AuthContext
      await login(data.email, data.password);

      // Call the login callback
      onLogin();
      onClose();
    } catch (err) {
      console.error("Login error:", err);
      setAuthError(
        err instanceof Error
          ? err.message
          : "Failed to login. Please try again.",
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoggingIn(true);
      setAuthError(null);

      // Use the loginWithGoogle function from AuthContext
      await loginWithGoogle();

      // Call the login callback
      onLogin();
      onClose();
    } catch (err) {
      console.error("Google login error:", err);
      setAuthError(
        err instanceof Error
          ? err.message
          : "Failed to login with Google. Please try again.",
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAuthSuccess = () => {
    onLogin();
    onClose();
  };

  const renderLoginTabContent = () => {
    if (showForgotPassword) {
      return (
        <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />
      );
    }

    return (
      <>
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl flex items-center gap-2">
            <LogIn className="h-5 w-5" /> Welcome Back
          </DialogTitle>
          <DialogDescription>
            Sign in to your account to continue watching your favorite shows
            and movies.
          </DialogDescription>
        </DialogHeader>

        {(authError || error) && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {authError ||
                (error instanceof Error
                  ? error.message
                  : "An error occurred")}
            </AlertDescription>
          </Alert>
        )}

        <Form {...loginForm}>
          <form
            onSubmit={loginForm.handleSubmit(handleLoginSubmit)}
            className="space-y-4"
          >
            <FormField
              control={loginForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        placeholder="your.email@example.com"
                        type="email"
                        {...field}
                        className="pl-10"
                        disabled={isLoggingIn}
                      />
                    </FormControl>
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={loginForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        type={showPassword ? "text" : "password"}
                        {...field}
                        className="pl-10"
                        disabled={isLoggingIn}
                      />
                    </FormControl>
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-7 w-7"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoggingIn}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end items-center">
              <Button
                variant="link"
                className="px-0 text-sm"
                type="button"
                disabled={isLoggingIn}
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot password?
              </Button>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoggingIn || loading}
            >
              {isLoggingIn || loading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-muted"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full flex gap-2 items-center justify-center"
              onClick={handleGoogleLogin}
              disabled={isLoggingIn || loading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24"
                viewBox="0 0 24 24"
                width="24"
                className="h-4 w-4"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              {isLoggingIn ? "Signing in..." : "Sign in with Google"}
            </Button>
          </form>
        </Form>
      </>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-background border-border shadow-lg">
        <Tabs
          defaultValue={activeTab}
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value as any);
            setShowForgotPassword(false);
          }}
          className="w-full"
        >
          <div className="flex flex-col items-center pt-8 pb-4 bg-gradient-to-b from-primary/10 to-background">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-2xl font-bold mb-4 text-foreground">Utilix Cinema</h1>
            </motion.div>
            <TabsList className="grid w-[90%] grid-cols-3 mb-2 bg-background/80 backdrop-blur-sm">
              <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <LogIn className="h-4 w-4 mr-2" />
                <span>Login</span>
              </TabsTrigger>
              <TabsTrigger value="email-link" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <LinkIcon className="h-4 w-4 mr-2" />
                <span>Email Link</span>
              </TabsTrigger>
              <TabsTrigger value="phone" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Smartphone className="h-4 w-4 mr-2" />
                <span>Phone</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Login Tab */}
          <TabsContent value="login" className="p-6 pt-4">
            {renderLoginTabContent()}
          </TabsContent>

          {/* Email Link Tab */}
          <TabsContent value="email-link" className="p-6 pt-4">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl flex items-center gap-2">
                <LinkIcon className="h-5 w-5" /> Sign in with Email Link
              </DialogTitle>
              <DialogDescription>
                Get a magic link sent to your email - no password needed
              </DialogDescription>
            </DialogHeader>

            <EmailLinkLogin 
              onSuccess={handleAuthSuccess}
              onBack={() => setActiveTab("login")}
            />
          </TabsContent>

          {/* Phone Login Tab */}
          <TabsContent value="phone" className="p-6 pt-4">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl flex items-center gap-2">
                <Smartphone className="h-5 w-5" /> Phone Login
              </DialogTitle>
              <DialogDescription>
                Sign in with your phone number using SMS verification.
              </DialogDescription>
            </DialogHeader>

            <PhoneLogin onSuccess={handleAuthSuccess} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
