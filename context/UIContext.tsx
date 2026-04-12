"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface UIContextType {
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  notificationCount: number;
  setNotificationCount: (count: number) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <UIContext.Provider
      value={{
        isSidebarOpen,
        setSidebarOpen,
        toggleSidebar,
        notificationCount,
        setNotificationCount,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}
