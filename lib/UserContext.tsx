"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, USERS, defaultUser } from "./constants";

interface UserContextType {
  currentUser: User;
  users: User[];
  switchUser: (userId: string) => void;
}

const UserContext = createContext<UserContextType>({
  currentUser: defaultUser,
  users: USERS,
  switchUser: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User>(defaultUser);
  const router = useRouter();

  useEffect(() => {
    // Restore user from localStorage if saved
    try {
      const savedUserId = localStorage.getItem("audit_current_user_id");
      if (savedUserId) {
        const found = USERS.find((u) => u.id === savedUserId);
        if (found) {
          setCurrentUserState(found);
          document.cookie = `audit_user_id=${found.id}; path=/; max-age=31536000`;
        }
      }
    } catch (e) {
      console.warn("Could not read localStorage:", e);
    }
  }, []);

  const switchUser = (userId: string) => {
    const selected = USERS.find((u) => u.id === userId);
    if (selected) {
      setCurrentUserState(selected);
      try {
        localStorage.setItem("audit_current_user_id", selected.id);
        document.cookie = `audit_user_id=${selected.id}; path=/; max-age=31536000`;
      } catch (e) {
        console.warn("Could not save to localStorage:", e);
      }
      router.refresh();
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, users: USERS, switchUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
