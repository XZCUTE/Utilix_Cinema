import React, { createContext, useContext, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { User } from "firebase/auth";
import { UserProfile } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<User>;
  register: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  sendEmailLink: (email: string, actionCodeSettings: any) => Promise<boolean>;
  completeEmailLogin: (url: string) => Promise<User | null>;
  loginWithPhone: (phoneNumber: string) => Promise<any>;
  verifyPhone: (code: string) => Promise<User>;
  forgotPassword: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (
    updates: Partial<UserProfile>,
  ) => Promise<Partial<UserProfile>>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
