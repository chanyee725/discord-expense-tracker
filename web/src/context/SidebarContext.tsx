"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SidebarContextType {
  isExpanded: boolean;
  isMobileOpen: boolean;
  isHovered: boolean;
  activeItem: string | null;
  openSubmenu: string | null;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  setIsHovered: (value: boolean) => void;
  setActiveItem: (item: string | null) => void;
  toggleSubmenu: (item: string) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // Desktop sidebar expanded state (default: expanded)
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Mobile sidebar overlay state (default: closed)
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Hover-expand state on collapsed sidebar (default: not hovered)
  const [isHovered, setIsHovered] = useState(false);
  
  // Currently active menu item
  const [activeItem, setActiveItem] = useState<string | null>(null);
  
  // Currently open submenu
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  
  // Track if we're on mobile viewport
  const [isMobile, setIsMobile] = useState(false);

  // Resize event listener for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // When transitioning from mobile to desktop, close mobile sidebar
      if (!mobile && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };

    // Set initial state
    handleResize();

    // Add resize listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isMobileOpen]);

  // Toggle desktop sidebar collapse/expand
  const toggleSidebar = () => {
    setIsExpanded((prev) => !prev);
  };

  // Toggle mobile sidebar overlay
  const toggleMobileSidebar = () => {
    setIsMobileOpen((prev) => !prev);
  };

  // Toggle submenu open/close
  const toggleSubmenu = (item: string) => {
    setOpenSubmenu((prev) => (prev === item ? null : item));
  };

  // Compute final isExpanded value (mobile always shows as collapsed in context)
  const computedIsExpanded = isMobile ? false : isExpanded;

  return (
    <SidebarContext.Provider
      value={{
        isExpanded: computedIsExpanded,
        isMobileOpen,
        isHovered,
        activeItem,
        openSubmenu,
        toggleSidebar,
        toggleMobileSidebar,
        setIsHovered,
        setActiveItem,
        toggleSubmenu,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};
