// Firebase implementation
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  PhoneAuthProvider,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  UserCredential,
  User,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signOut,
  updateProfile
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { 
  getDatabase, 
  ref, 
  set, 
  get, 
  update, 
  remove, 
  query as dbQuery, 
  orderByChild, 
  equalTo, 
  push, 
  onValue,
  serverTimestamp,
  connectDatabaseEmulator
} from "firebase/database";

// Declaration for global recaptchaVerifier
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | undefined;
  }
}

// User type
export interface UserProfile {
  displayName: string;
  email: string | null;
  photoURL: string | null;
  theme: string;
  createdAt: string;
  bio?: string;
}

// Library item
export interface LibraryItem {
  id: string;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  addedAt: string;
}

// Watch history item
export interface WatchHistoryItem {
  id: string;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  watchedAt: string;
  progress?: number;
  currentSeason?: number;
  currentEpisode?: number;
}

// Firebase configuration - Using the EXACT same config as in player.js
const firebaseConfig = {
  apiKey: "AIzaSyAFODTsHwTCpthvJjzs6GQjDBish6r3oQs",
  authDomain: "utilixcinema.firebaseapp.com",
  databaseURL: "https://utilixcinema-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "utilixcinema",
  storageBucket: "utilixcinema.appspot.com",
  messagingSenderId: "851957022660",
  appId: "1:851957022660:web:395e193451af05b401ae91",
  measurementId: "G-T5G9KEN7ZE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const database = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();

// Check if we're online
const checkOnlineStatus = async (): Promise<boolean> => {
  try {
    // Try to connect to Firebase to check if we're online
    const connectedRef = ref(database, '.info/connected');
    return new Promise((resolve) => {
      onValue(connectedRef, (snap) => {
        if (snap.val() === true) {
          resolve(true);
        } else {
          resolve(false);
        }
      }, { onlyOnce: true });
    });
  } catch (error) {
    console.error('Error checking online status:', error);
    return false;
  }
};

// Authentication functions

// Register with email and password
export const registerWithEmail = async (
  email: string,
  password: string,
  displayName: string,
): Promise<User> => {
  try {
    // Check if we're online
    const isOnline = await checkOnlineStatus();
    if (!isOnline) {
      throw new Error("You appear to be offline. Please check your internet connection.");
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Generate default avatar
    const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName || user.uid}`;
    
    // Update profile with display name and avatar
    await updateProfile(user, {
      displayName,
      photoURL: defaultAvatar
    });
    
    // Create comprehensive user profile in Realtime Database
    await createUserProfile(user.uid, {
      displayName,
      email,
      photoURL: defaultAvatar,
      theme: "dark",
      createdAt: new Date().toISOString(),
      bio: ""  // Initialize with empty bio
    });
    
    console.log(`Registered new user ${user.uid} with email ${email} and created profile`);

    return user;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

// Login with email and password
export const loginWithEmail = async (
  email: string,
  password: string,
): Promise<User> => {
  try {
    // Check if we're online
    const isOnline = await checkOnlineStatus();
    if (!isOnline) {
      throw new Error("You appear to be offline. Please check your internet connection.");
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Refresh the token to ensure it's up to date
    await userCredential.user.getIdToken(true);
    
    return userCredential.user;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// Send passwordless email login link
export const sendLoginEmail = async (
  email: string,
  actionCodeSettings: any
): Promise<void> => {
  try {
    // Check if we're online
    const isOnline = await checkOnlineStatus();
    if (!isOnline) {
      throw new Error("You appear to be offline. Please check your internet connection.");
    }

    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    // Save the email to localStorage for later use
    localStorage.setItem('emailForSignIn', email);
  } catch (error) {
    console.error("Email link error:", error);
    throw error;
  }
};

// Complete passwordless email sign-in
export const completeEmailSignIn = async (url: string): Promise<User | null> => {
  try {
    // Check if we're online
    const isOnline = await checkOnlineStatus();
    if (!isOnline) {
      throw new Error("You appear to be offline. Please check your internet connection.");
    }

    if (isSignInWithEmailLink(auth, url)) {
      // Get email from localStorage that was saved when sending the link
      let email = localStorage.getItem('emailForSignIn');
      
      if (!email) {
        // If email not found in localStorage, prompt user
        email = window.prompt('Please provide your email for confirmation');
      }
      
      if (email) {
        const userCredential = await signInWithEmailLink(auth, email, url);
        // Clear email from storage
        localStorage.removeItem('emailForSignIn');
        
        // Check if user profile exists, if not create one
        const userRef = ref(database, `userProfiles/${userCredential.user.uid}`);
        const snapshot = await get(userRef);
        
        if (!snapshot.exists()) {
          await createUserProfile(userCredential.user.uid, {
            displayName: userCredential.user.displayName || email.split('@')[0],
            email: email,
            photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userCredential.user.uid}`,
            theme: "dark",
            createdAt: new Date().toISOString(),
          });
        }
        
        return userCredential.user;
      }
    }
    return null;
  } catch (error) {
    console.error("Email sign-in completion error:", error);
    throw error;
  }
};

// Login with Google
export const loginWithGoogle = async (): Promise<User> => {
  try {
    // Check if we're online
    const isOnline = await checkOnlineStatus();
    if (!isOnline) {
      throw new Error("You appear to be offline. Please check your internet connection.");
    }

    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if profile exists, create or update if needed
    const userProfile = await getUserProfile(user.uid);
    
    if (!userProfile) {
      // Create new profile for Google user
      await createUserProfile(user.uid, {
        displayName: user.displayName || "Google User",
        email: user.email,
        photoURL: user.photoURL,
        theme: "dark",
        createdAt: new Date().toISOString(),
      });
      console.log(`Created new profile for Google user ${user.uid}`);
    } else {
      // Update existing profile with latest Google data
      const updates: Partial<UserProfile> = {};
      
      // Only update fields if they exist in Google account
      if (user.displayName && user.displayName !== userProfile.displayName) {
        updates.displayName = user.displayName;
      }
      
      if (user.email && user.email !== userProfile.email) {
        updates.email = user.email;
      }
      
      if (user.photoURL && user.photoURL !== userProfile.photoURL) {
        updates.photoURL = user.photoURL;
      }
      
      // Update profile if we have changes
      if (Object.keys(updates).length > 0) {
        await updateUserProfile(user.uid, updates);
        console.log(`Updated profile for Google user ${user.uid}`, updates);
      }
    }
    
    return user;
  } catch (error) {
    console.error("Google login error:", error);
    throw error;
  }
};

// Phone authentication - Step 1: Send verification code
export const sendPhoneVerification = async (
  phoneNumber: string,
  recaptchaContainerId: string,
): Promise<any> => {
  try {
    // Check if we're online
    const isOnline = await checkOnlineStatus();
    if (!isOnline) {
      throw new Error("You appear to be offline. Please check your internet connection.");
    }

    // Make sure any existing reCAPTCHA instances are cleared
    window.recaptchaVerifier = undefined;
    
    // Create a new reCAPTCHA verifier instance
    const recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
      size: 'invisible',
      callback: () => {
        console.log('reCAPTCHA solved');
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired');
        // Reset the reCAPTCHA
        window.recaptchaVerifier = undefined;
      }
    });
    
    // Render the reCAPTCHA
    await recaptchaVerifier.render();
    
    // Send verification code to the phone number
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    return confirmationResult;
  } catch (error) {
    console.error("Phone verification error:", error);
    throw error;
  }
};

// Phone authentication - Step 2: Verify the code
export const verifyPhoneCode = async (
  confirmationResult: any,
  code: string,
): Promise<User> => {
  try {
    // Check if we're online
    const isOnline = await checkOnlineStatus();
    if (!isOnline) {
      throw new Error("You appear to be offline. Please check your internet connection.");
    }

    const userCredential = await confirmationResult.confirm(code);
    const user = userCredential.user;
    
    // Check if user profile exists, if not create one
    const userRef = ref(database, `userProfiles/${user.uid}`);
    const snapshot = await get(userRef);
    
    if (!snapshot.exists()) {
    await createUserProfile(user.uid, {
        displayName: user.phoneNumber || "User",
        email: user.email,
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
      theme: "dark",
      createdAt: new Date().toISOString(),
    });
  }

  return user;
  } catch (error) {
    console.error("Phone code verification error:", error);
    throw error;
  }
};

// User profile functions - UPDATED TO MATCH PLAYER.JS
export const createUserProfile = async (
  userId: string,
  profile: UserProfile,
): Promise<void> => {
  try {
    // Following player.js structure
    const userRef = ref(database, `userProfiles/${userId}`);
    
    // First check if profile already exists
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      // If profile exists, just update with new data
      await update(userRef, {
        ...profile,
        updatedAt: new Date().toISOString()
      });
      console.log(`Updated existing profile for user ${userId}`);
    } else {
      // Create new profile
      await set(userRef, {
        ...profile,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log(`Created new profile for user ${userId}`);
    }
  } catch (error) {
    console.error("Create/update user profile error:", error);
    throw error;
  }
};

export const getUserProfile = async (
  userId: string,
): Promise<UserProfile | null> => {
  try {
    // Following player.js structure
    const userRef = ref(database, `userProfiles/${userId}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      const profile = snapshot.val() as UserProfile;
      console.log(`Retrieved profile for user ${userId}`);
      return profile;
    } else {
      console.log(`No profile found for user ${userId}`);
      return null;
    }
  } catch (error) {
    console.error("Get user profile error:", error);
    throw error;
  }
};

export const updateUserProfile = async (
  userId: string,
  updates: Partial<UserProfile>,
): Promise<void> => {
  try {
    // Make sure user is authenticated with fresh token
    const currentUser = auth.currentUser;
    if (currentUser) {
      // Force token refresh to ensure we have latest permissions
      await currentUser.getIdToken(true);
    }
    
    // Add timestamp to updates
    const updatesWithTimestamp = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    // Following player.js structure
    const userRef = ref(database, `userProfiles/${userId}`);
    
    // First check if profile exists
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      // Update existing profile
      await update(userRef, updatesWithTimestamp);
      console.log(`Updated profile for user ${userId}`, updates);
    } else {
      // Create new profile with updates
      console.log(`No existing profile found for ${userId}, creating new one`);
      
      // Default profile fields
      const defaultProfile: UserProfile = {
        displayName: currentUser?.displayName || "User",
        email: currentUser?.email || null,
        photoURL: currentUser?.photoURL || null,
        theme: "dark",
        createdAt: new Date().toISOString(),
      };
      
      // Merge defaults with updates
      await set(userRef, {
        ...defaultProfile,
        ...updatesWithTimestamp
      });
      
      console.log(`Created new profile for user ${userId}`);
    }
  } catch (error) {
    console.error("Update user profile error:", error);
    throw error;
  }
};

// Reset password
export const resetPassword = async (email: string): Promise<void> => {
  try {
    // Check if we're online
    const isOnline = await checkOnlineStatus();
    if (!isOnline) {
      throw new Error("You appear to be offline. Please check your internet connection.");
    }

    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Password reset error:", error);
    throw error;
  }
};

// Sign out
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
};

// Auth state observer
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Library functions - UPDATED TO MATCH PLAYER.JS
export const addToLibrary = async (
  userId: string,
  item: Omit<LibraryItem, "addedAt">,
): Promise<LibraryItem> => {
  try {
    // Check if we're online
    const isOnline = await checkOnlineStatus();
    if (!isOnline) {
      throw new Error("You appear to be offline. Please check your internet connection.");
    }

    const newItem = {
      ...item,
      addedAt: new Date().toISOString(),
    };

    // Following player.js approach to library storage
    const isSeries = item.mediaType === 'tv';
    const key = isSeries ? 'series' : 'movies';
    
    // Debug logging
    console.log("FIREBASE: Adding to library:", {item, userId, key});
    
    try {
      // Get current library
      const librarySnapshot = await get(ref(database, `users/${userId}/library`));
      let library = librarySnapshot.val() || { movies: [], series: [] };
      
      const contentList = library[key] || [];
      
      // String comparison for IDs to ensure compatibility
      const contentIndex = contentList.findIndex((content: any) => 
        String(content.id) === String(item.id)
      );
      
      console.log("FIREBASE: Library check:", {
        existingItems: contentList.length,
        foundIndex: contentIndex,
        itemId: item.id
      });
      
      if (contentIndex === -1) {
        // Add new item
        contentList.push({
          id: String(item.id),
          title: item.title,
          poster_path: item.posterPath,
          media_type: item.mediaType,
          date: new Date().toISOString(),
          vote_average: null // Can be enhanced with rating
        });
        console.log(`FIREBASE: Added to ${key}:`, item);
    } else {
        console.log(`FIREBASE: Item already exists in ${key}:`, item.id);
      }
      
      library[key] = contentList;
      console.log("FIREBASE: Saving library:", library);
      await set(ref(database, `users/${userId}/library`), library);

    return newItem;
  } catch (error: any) {
      // Handle permission denied errors specifically
      if (error.code === "PERMISSION_DENIED" || error.message?.includes("permission_denied")) {
        console.error("Permission denied. Make sure you're logged in.");
        throw new Error("Permission denied. Please log out and log back in to fix this issue.");
      }
      console.error("FIREBASE: Error in addToLibrary:", error);
      throw error;
    }
  } catch (error) {
    console.error("Add to library error:", error);
    throw error;
  }
};

// Remove from library
export const removeFromLibrary = async (
  userId: string,
  itemId: string,
  mediaType: "movie" | "tv"
): Promise<void> => {
  try {
    // Following player.js approach
    const isSeries = mediaType === 'tv';
    const key = isSeries ? 'series' : 'movies';
    
    console.log("FIREBASE: Removing from library:", {userId, itemId, mediaType, key});
    
    try {
      // Get current library
      const librarySnapshot = await get(ref(database, `users/${userId}/library`));
      let library = librarySnapshot.val() || { movies: [], series: [] };
      
      const contentList = library[key] || [];
      // String comparison for IDs to ensure compatibility
      const contentIndex = contentList.findIndex((content: any) => 
        String(content.id) === String(itemId)
      );
      
      console.log("FIREBASE: Library check:", {
        existingItems: contentList.length,
        foundIndex: contentIndex,
        itemId: itemId
      });
      
      if (contentIndex !== -1) {
    // Remove item
        contentList.splice(contentIndex, 1);
        console.log(`FIREBASE: Removed from ${key}:`, itemId);
      } else {
        console.log(`FIREBASE: Item not found in ${key}:`, itemId);
      }
      
      library[key] = contentList;
      console.log("FIREBASE: Saving library:", library);
      await set(ref(database, `users/${userId}/library`), library);
  } catch (error: any) {
      // Handle permission denied errors specifically
      if (error.code === "PERMISSION_DENIED" || error.message?.includes("permission_denied")) {
        console.error("Permission denied. Make sure you're logged in.");
        throw new Error("Permission denied. Please log out and log back in to fix this issue.");
      }
      throw error;
    }
  } catch (error) {
    console.error("Remove from library error:", error);
    throw error;
  }
};

// Get user library
export const getUserLibrary = async (
  userId: string,
): Promise<{movies: LibraryItem[], series: LibraryItem[]}> => {
  try {
    // Following player.js structure
    const libraryRef = ref(database, `users/${userId}/library`);
    const snapshot = await get(libraryRef);
    
    console.log("FIREBASE: Getting user library for:", userId);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      
      // Transform the data from player.js format to our app format
      const movies: LibraryItem[] = (data.movies || []).map((item: any) => ({
        id: String(item.id),
        mediaType: "movie",
        title: item.title,
        posterPath: item.poster_path,
        addedAt: item.date || new Date().toISOString()
      }));
      
      const series: LibraryItem[] = (data.series || []).map((item: any) => ({
        id: String(item.id),
        mediaType: "tv",
        title: item.title,
        posterPath: item.poster_path,
        addedAt: item.date || new Date().toISOString()
      }));
      
      console.log("FIREBASE: Library retrieved:", {
        moviesCount: movies.length,
        seriesCount: series.length, 
        movieIds: movies.map(m => m.id),
        seriesIds: series.map(s => s.id)
      });
      
      return { movies, series };
    }
    
    console.log("FIREBASE: Empty library for user");
    return { movies: [], series: [] };
  } catch (error) {
    console.error("Get user library error:", error);
    throw error;
  }
};

// Check if item is in library
export const isInLibrary = async (
  userId: string,
  itemId: string,
  mediaType: "movie" | "tv"
): Promise<boolean> => {
  try {
    // Following player.js approach
    const isSeries = mediaType === 'tv';
    const key = isSeries ? 'series' : 'movies';
    
    console.log("FIREBASE: Checking if in library:", {userId, itemId, mediaType, key});
    
    const libraryRef = ref(database, `users/${userId}/library`);
    const snapshot = await get(libraryRef);
    
    if (snapshot.exists()) {
      const library = snapshot.val();
      const contentList = library[key] || [];
      
      // Use string comparison for IDs to ensure compatibility with different ID types
      const isInLib = contentList.some((item: any) => String(item.id) === String(itemId));
      console.log("FIREBASE: Library check result:", {
        itemsInLibrary: contentList.length,
        isInLibrary: isInLib,
        items: contentList.map((i: any) => String(i.id))
      });
      
      return isInLib;
    }
    
    console.log("FIREBASE: Library not found for user");
    return false;
  } catch (error) {
    console.error("Check if in library error:", error);
    return false;
  }
};

// Watch history functions - UPDATED TO MATCH PLAYER.JS

// Add to watch history - watching a movie or episode
export const addToWatchHistory = async (
  userId: string,
  item: Omit<WatchHistoryItem, "watchedAt">,
): Promise<WatchHistoryItem> => {
  try {
    // Check if we're online
    const isOnline = await checkOnlineStatus();
    if (!isOnline) {
      throw new Error("You appear to be offline. Please check your internet connection.");
    }

    const newItem = {
      ...item,
      watchedAt: new Date().toISOString(),
    };

    try {
      // Following player.js structure for consistency
      const historyRef = ref(database, `users/${userId}/watchHistory/${item.id}`);
      
      await set(historyRef, {
        id: item.id,
        title: item.title,
        mediaType: item.mediaType,
        posterPath: item.posterPath,
        watchedAt: newItem.watchedAt,
        progress: item.progress || 0,
        currentSeason: item.currentSeason,
        currentEpisode: item.currentEpisode
      });

    return newItem;
  } catch (error: any) {
      // Handle permission denied errors specifically
      if (error.code === "PERMISSION_DENIED" || error.message?.includes("permission_denied")) {
        console.error("Permission denied. Make sure you're logged in.");
        throw new Error("Permission denied. Please log out and log back in to fix this issue.");
      }
      throw error;
    }
  } catch (error) {
    console.error("Add to watch history error:", error);
    throw error;
  }
};

// Update watch progress
export const updateWatchProgress = async (
  userId: string,
  itemId: string,
  updates: Partial<WatchHistoryItem>,
): Promise<void> => {
  try {
    const historyRef = ref(database, `users/${userId}/watchHistory/${itemId}`);
    
    const dbUpdates: Record<string, any> = {
      watchedAt: new Date().toISOString(),
    };
    
    if (updates.progress !== undefined) dbUpdates.progress = updates.progress;
    if (updates.currentSeason !== undefined) dbUpdates.currentSeason = updates.currentSeason;
    if (updates.currentEpisode !== undefined) dbUpdates.currentEpisode = updates.currentEpisode;
    
    try {
      // Get current history item first
      const snapshot = await get(historyRef);
      if (snapshot.exists()) {
        // Update existing item
        await update(historyRef, dbUpdates);
      } else {
        // If item doesn't exist yet, we need more data
        if (updates.title && updates.mediaType) {
          await set(historyRef, {
            id: itemId,
            title: updates.title,
            mediaType: updates.mediaType,
            posterPath: updates.posterPath || null,
            watchedAt: dbUpdates.watchedAt,
            progress: updates.progress || 0,
            currentSeason: updates.currentSeason,
            currentEpisode: updates.currentEpisode
          });
        } else {
          console.error("Cannot update non-existent history item without title and mediaType");
        }
    }
  } catch (error: any) {
      // Handle permission denied errors specifically
      if (error.code === "PERMISSION_DENIED" || error.message?.includes("permission_denied")) {
        console.error("Permission denied. Make sure you're logged in.");
        throw new Error("Permission denied. Please log out and log back in to fix this issue.");
      }
      throw error;
    }
  } catch (error) {
    console.error("Update watch progress error:", error);
    throw error;
  }
};

// Get user watch history
export const getUserWatchHistory = async (
  userId: string,
): Promise<WatchHistoryItem[]> => {
  try {
    // Follow player.js structure
    const historyRef = ref(database, `users/${userId}/watchHistory`);
    const snapshot = await get(historyRef);
    
    const items: WatchHistoryItem[] = [];
    if (snapshot.exists()) {
      const data = snapshot.val();
      
      for (const key in data) {
        const item = data[key];
        items.push({
          id: key,
          mediaType: item.mediaType,
          title: item.title,
          posterPath: item.posterPath,
          watchedAt: item.watchedAt,
          progress: item.progress,
          currentSeason: item.currentSeason,
          currentEpisode: item.currentEpisode,
        });
      }
    }
    
    // Sort by most recently watched
    items.sort((a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime());
    
    return items;
  } catch (error) {
    console.error("Get user watch history error:", error);
    throw error;
  }
};

// Theme functions - UPDATED TO MATCH PLAYER.JS
export const setUserTheme = async (
  userId: string,
  theme: string,
): Promise<string> => {
  try {
    // Following player.js approach
    const userRef = ref(database, `userProfiles/${userId}`);
    await update(userRef, { theme });
    return theme;
  } catch (error) {
    console.error("Set user theme error:", error);
    throw error;
  }
};

export const getUserTheme = async (userId: string): Promise<string> => {
  try {
    // Following player.js approach
    const userRef = ref(database, `userProfiles/${userId}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      return snapshot.val().theme || "dark";
    } else {
      return "dark";
    }
  } catch (error) {
    console.error("Get user theme error:", error);
    return "dark";
  }
};
