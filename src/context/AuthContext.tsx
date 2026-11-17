"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  priorityPreference: "SPEED" | "LOWEST_COST" | "MIN_CHANGES";
  company?: string;
  avatarUrl?: string;
}

const DEFAULT_USER: UserProfile = {
  id: "traveler-aarav",
  name: "Dr. Aarav Sharma",
  email: "aarav.sharma@tech-summit.in",
  role: "Keynote Speaker & AI Research Director",
  priorityPreference: "SPEED",
  company: "India CleanTech & AI Foundation",
};

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoaded: boolean;
  login: (email: string, phone?: string, name?: string, priority?: "SPEED" | "LOWEST_COST" | "MIN_CHANGES") => void;
  signup: (userData: Omit<UserProfile, "id">) => void;
  logout: () => void;
  loginAsDemoSpeaker: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoaded: false,
  login: () => {},
  signup: () => {},
  logout: () => {},
  loginAsDemoSpeaker: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("remode_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.name === "Dr. Elena Vance") {
          setUser(DEFAULT_USER);
          localStorage.setItem("remode_user", JSON.stringify(DEFAULT_USER));
        } else if (parsed && parsed.email) {
          setUser(parsed);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const login = (
    email: string,
    phone?: string,
    name?: string,
    priority: "SPEED" | "LOWEST_COST" | "MIN_CHANGES" = "SPEED"
  ) => {
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: name || email.split("@")[0].replace(".", " "),
      email,
      phone: phone || undefined,
      role: "Executive Traveler",
      priorityPreference: priority,
    };
    setUser(newUser);
    try {
      localStorage.setItem("remode_user", JSON.stringify(newUser));
      // Sync immediately with PostgreSQL database
      fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newUser.email,
          name: newUser.name,
          phone: newUser.phone,
          priorityPreference: priority,
        }),
      }).catch((err) => console.error("Failed to sync user to database:", err));
    } catch (e) {
      console.error(e);
    }
  };

  const signup = (userData: Omit<UserProfile, "id">) => {
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      ...userData,
    };
    setUser(newUser);
    try {
      localStorage.setItem("remode_user", JSON.stringify(newUser));
      // Sync immediately with PostgreSQL database
      fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newUser.email,
          name: newUser.name,
          phone: newUser.phone,
          priorityPreference: newUser.priorityPreference,
        }),
      }).catch((err) => console.error("Failed to sync user to database:", err));
    } catch (e) {
      console.error(e);
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("remode_user");
    } catch (e) {
      console.error(e);
    }
  };

  const loginAsDemoSpeaker = () => {
    setUser(DEFAULT_USER);
    try {
      localStorage.setItem("remode_user", JSON.stringify(DEFAULT_USER));
      // Sync demo speaker with PostgreSQL database
      fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: DEFAULT_USER.email,
          name: DEFAULT_USER.name,
          phone: DEFAULT_USER.phone,
          priorityPreference: DEFAULT_USER.priorityPreference,
        }),
      }).catch((err) => console.error("Failed to sync user to database:", err));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoaded,
        login,
        signup,
        logout,
        loginAsDemoSpeaker,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
