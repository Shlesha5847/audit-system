"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, USERS, defaultUser, Firm, FIRMS, defaultFirm } from "./constants";

interface UserContextType {
  currentUser: User;
  users: User[];
  firms: Firm[];
  currentFirm: Firm;
  switchUser: (userId: string) => void;
  switchFirm: (firmId: string) => void;
}

const UserContext = createContext<UserContextType>({
  currentUser: defaultUser,
  users: USERS,
  firms: FIRMS,
  currentFirm: defaultFirm,
  switchUser: () => {},
  switchFirm: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User>(defaultUser);
  const router = useRouter();

  useEffect(() => {
    // Restore user & firm from localStorage if saved
    try {
      const savedUserId = localStorage.getItem("audit_current_user_id");
      const savedFirmId = localStorage.getItem("audit_current_firm_id");

      let activeUser = defaultUser;
      if (savedUserId) {
        const foundUser = USERS.find((u) => u.id === savedUserId);
        if (foundUser) activeUser = foundUser;
      }

      if (savedFirmId) {
        const foundFirm = FIRMS.find((f) => f.id === savedFirmId);
        if (foundFirm) {
          activeUser = {
            ...activeUser,
            firm_id: foundFirm.id,
          };
        }
      }

      setCurrentUserState(activeUser);
      document.cookie = `audit_user_id=${activeUser.id}; path=/; max-age=31536000`;
      document.cookie = `audit_firm_id=${activeUser.firm_id}; path=/; max-age=31536000`;
    } catch (e) {
      console.warn("Could not read localStorage:", e);
    }
  }, []);

  const switchUser = (userId: string) => {
    const selected = USERS.find((u) => u.id === userId);
    if (selected) {
      const updatedUser: User = {
        ...selected,
        firm_id: currentUser.firm_id, // Retain currently active firm
      };
      setCurrentUserState(updatedUser);
      try {
        localStorage.setItem("audit_current_user_id", selected.id);
        document.cookie = `audit_user_id=${selected.id}; path=/; max-age=31536000`;
      } catch (e) {
        console.warn("Could not save to localStorage:", e);
      }
      router.refresh();
    }
  };

  const switchFirm = (firmId: string) => {
    const selectedFirm = FIRMS.find((f) => f.id === firmId);
    if (selectedFirm) {
      const updatedUser: User = {
        ...currentUser,
        firm_id: selectedFirm.id,
      };
      setCurrentUserState(updatedUser);
      try {
        localStorage.setItem("audit_current_firm_id", selectedFirm.id);
        document.cookie = `audit_firm_id=${selectedFirm.id}; path=/; max-age=31536000`;
      } catch (e) {
        console.warn("Could not save to localStorage:", e);
      }
      router.refresh();
      router.push("/clients");
    }
  };

  const currentFirm = FIRMS.find((f) => f.id === currentUser.firm_id) || defaultFirm;

  return (
    <UserContext.Provider
      value={{
        currentUser,
        users: USERS,
        firms: FIRMS,
        currentFirm,
        switchUser,
        switchFirm,
      }}
    >
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
