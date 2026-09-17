"use client";

import React, { createContext, useContext, useState } from "react";

interface AdminNavContextType {
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleMobileOpen: () => void;
}

export const AdminNavContext = createContext<AdminNavContextType>({
  mobileOpen: false,
  setMobileOpen: () => {},
  toggleMobileOpen: () => {},
});

export function AdminNavProvider({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleMobileOpen = () => setMobileOpen((prev) => !prev);

  return (
    <AdminNavContext.Provider
      value={{ mobileOpen, setMobileOpen, toggleMobileOpen }}
    >
      {children}
    </AdminNavContext.Provider>
  );
}

export const useAdminNav = () => useContext(AdminNavContext);
