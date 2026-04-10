import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { api } from "../lib/api";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isProfileComplete?: boolean;
  cafeteriaId?: any; // Can be string or populated object { _id, name, canteenCode }
  faculty?: string;
}

interface AuthContextType {
  user: User | null;
  profile: any | null;
  role: string | null;
  loading: boolean;
  isLoggingOut: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const lastFetchedSessionId = useRef<string | null>(null);

  const fetchProfile = async (sessionId?: string) => {
    if (sessionId && sessionId === lastFetchedSessionId.current) return;
    if (sessionId) lastFetchedSessionId.current = sessionId;

    try {
      console.log("[Auth] Fetching profile for session:", sessionId?.slice(0, 8));
      const { data } = await api.get('/auth/profile');
      console.log("Profile data received:", data.email, "Role:", data.role);
      if (data) {
        setUser(data);
        setProfile(data);
        setRole(data.role);
      }
    } catch (err: any) {
      console.error("Error fetching profile:", err.message);
      if (err.response) {
        console.error("Backend response error:", err.response.data);
        if (err.response.status === 401) {
          console.warn("[Auth] Session invalid or expired. Cleaning up...");
          setUser(null);
          setProfile(null);
          setRole(null);
          lastFetchedSessionId.current = null;
          supabase.auth.signOut();
        }
      }
    }
  };

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.access_token);
      }
      setLoading(false);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("[Auth] State changed:", _event, !!session);
      if (session) {
        await fetchProfile(session.access_token);
      } else {
        lastFetchedSessionId.current = null;
        setUser(null);
        setProfile(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      setIsLoggingOut(true);
      console.log("[SignOut] Initiating sign out sequence...");

      // 1. Fire and forget backend logout (cookies)
      api.post('/auth/logout').catch(err => {
        console.warn("[SignOut] Backend cookie clear failed (non-critical):", err.message);
      });

      // 2. Terminate Supabase session
      const { error } = await supabase.auth.signOut();
      if (error) console.error("[SignOut] Supabase signOut error:", error.message);

    } catch (error) {
      console.error("[SignOut] Unexpected error during sign out:", error);
    } finally {
      // 3. Force clear local state to trigger navigation
      lastFetchedSessionId.current = null;
      setUser(null);
      setProfile(null);
      setRole(null);
      setIsLoggingOut(false);
      console.log("[SignOut] Sign out sequence complete.");
    }
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  return (
    <AuthContext.Provider value={{ user, profile, role, loading, isLoggingOut, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
