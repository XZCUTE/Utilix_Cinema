import { useState, useEffect, useCallback } from "react";
import { User, updateProfile as updateFirebaseAuthProfile } from "firebase/auth";
import {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  sendLoginEmail,
  completeEmailSignIn,
  sendPhoneVerification,
  verifyPhoneCode,
  signOutUser,
  onAuthChange,
  getUserProfile,
  updateUserProfile,
  UserProfile,
  resetPassword,
  auth
} from "@/lib/firebase";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [phoneConfirmation, setPhoneConfirmation] = useState<any>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Load user profile when user changes
  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        try {
          // Get the auth token for the user
          const token = await user.getIdToken(true);
          setAuthToken(token);
          
          const userProfile = await getUserProfile(user.uid);
          setProfile(userProfile);
        } catch (err) {
          console.error("Error loading user profile:", err);
          // If there's a permission error, set appropriate error
          if (err instanceof Error && 
              (err.message.includes("permission_denied") || 
               err.message.includes("Permission denied"))) {
            setError(new Error("Permission denied. Please log out and log back in."));
          }
        }
      } else {
        setProfile(null);
        setAuthToken(null);
      }
    };

    loadProfile();
  }, [user]);

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = onAuthChange((authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Login with email and password
  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      const loggedInUser = await loginWithEmail(email, password);
      
      // Get a new token after login
      if (loggedInUser) {
        await loggedInUser.getIdToken(true);
      }
      
      return loggedInUser;
    } catch (err) {
      console.error("Login error:", err);
      if (err instanceof Error) {
        // Handle specific Firebase errors with more user-friendly messages
        if (err.message.includes("auth/wrong-password") || 
            err.message.includes("auth/user-not-found")) {
          setError(new Error("Invalid email or password. Please try again."));
        } else if (err.message.includes("auth/too-many-requests")) {
          setError(new Error("Too many failed login attempts. Please try again later or reset your password."));
        } else {
          setError(err);
        }
      } else {
        setError(new Error("An unknown error occurred during login."));
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Force reauthentication (for permission issues)
  const reauthenticate = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // First log out
      await logout();
      
      // Display message to user
      setError(new Error("Your session has expired. Please log in again."));
      
      return true;
    } catch (err) {
      console.error("Reauthentication error:", err);
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error("An error occurred. Please try logging in again."));
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register with email and password
  const register = useCallback(
    async (email: string, password: string, displayName: string) => {
      try {
        setError(null);
        setLoading(true);
        const authUser = await registerWithEmail(email, password, displayName);
        return authUser;
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error("An unknown error occurred during registration");
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Login with Google
  const loginWithGoogleProvider = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const authUser = await loginWithGoogle();
      return authUser;
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("An unknown error occurred during Google login");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Send passwordless email login link
  const sendEmailLink = useCallback(async (email: string, actionCodeSettings: any) => {
    try {
      setError(null);
      setLoading(true);
      await sendLoginEmail(email, actionCodeSettings);
      return true;
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("An unknown error occurred sending email link");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Complete email sign in from link
  const completeEmailLogin = useCallback(async (url: string) => {
    try {
      setError(null);
      setLoading(true);
      const authUser = await completeEmailSignIn(url);
      return authUser;
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("An unknown error occurred completing email sign-in");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Login with Phone
  const loginWithPhone = useCallback(async (phoneNumber: string) => {
    try {
      setError(null);
      setLoading(true);
      // This function initiates the phone verification process
      const confirmation = await sendPhoneVerification(
        phoneNumber,
        "recaptcha-container",
      );
      setPhoneConfirmation(confirmation);
      return confirmation;
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("An unknown error occurred during phone login");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Verify phone code
  const verifyPhone = useCallback(async (code: string) => {
    if (!phoneConfirmation) {
      throw new Error("No phone confirmation result found");
    }
    
    try {
      setError(null);
      setLoading(true);
      const user = await verifyPhoneCode(phoneConfirmation, code);
      return user;
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("An unknown error occurred during phone verification");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [phoneConfirmation]);

  // Request password reset
  const forgotPassword = useCallback(async (email: string) => {
    try {
      setError(null);
      setLoading(true);
      await resetPassword(email);
      return true;
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("An unknown error occurred requesting password reset");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout
  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      await signOutUser();
      setUser(null);
      setProfile(null);
      setAuthToken(null);
      // Clear any cached data
      localStorage.removeItem("cinema_library_cache");
      localStorage.removeItem("cinema_history_cache");
    } catch (err) {
      console.error("Logout error:", err);
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error("An error occurred during logout."));
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!user) {
        throw new Error("No authenticated user");
      }

      try {
        setError(null);
        setLoading(true);

        // Make sure we're working with the latest profile data
        const currentProfile = await getUserProfile(user.uid);
        
        if (!currentProfile) {
          throw new Error("User profile not found");
        }

        // Update the profile in Firebase
        await updateUserProfile(user.uid, updates);
        
        // Update the user's displayName and photoURL in Firebase Auth if they've changed
        if (updates.displayName || updates.photoURL) {
          const authUpdates: {
            displayName?: string;
            photoURL?: string;
          } = {};
          
          if (updates.displayName) {
            authUpdates.displayName = updates.displayName;
          }
          
          if (updates.photoURL) {
            authUpdates.photoURL = updates.photoURL;
          }
          
          // Only update auth profile if there are changes
          if (Object.keys(authUpdates).length > 0) {
            await updateFirebaseAuthProfile(user, authUpdates);
          }
        }

        // Get the updated profile after changes
        const updatedProfile = await getUserProfile(user.uid);
        setProfile(updatedProfile);

        console.log("Profile updated successfully:", updatedProfile);
        return updates;
      } catch (err) {
        console.error("Profile update error:", err);
        
        // Handle specific errors
        if (err instanceof Error) {
          if (err.message.includes("permission_denied") || 
             err.message.includes("Permission denied")) {
            await reauthenticate();
            setError(new Error("Permission denied. Please log in again."));
          } else {
            setError(err);
          }
        } else {
          setError(new Error("An unknown error occurred while updating profile"));
        }
        
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, reauthenticate]
  );

  return {
    user,
    profile,
    loading,
    error,
    login,
    register,
    loginWithGoogle: loginWithGoogleProvider,
    sendEmailLink,
    completeEmailLogin,
    loginWithPhone,
    verifyPhone,
    forgotPassword,
    logout,
    reauthenticate,
    updateProfile,
    authToken,
    isAuthenticated: !!user,
    phoneConfirmation
  };
};
