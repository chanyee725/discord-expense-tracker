"use client";

import React from "react";
import Sidebar from "@/components/Layout/Sidebar";
import Header from "@/components/Layout/Header";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";

function Backdrop() {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();
  
  if (!isMobileOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden" 
      onClick={toggleMobileSidebar}
    />
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isExpanded, isHovered } = useSidebar();
  
  const mainContentMargin = 
    (isExpanded || isHovered) ? "lg:ml-[290px]" : "lg:ml-[90px]";
  
  return (
    <div className="min-h-screen xl:flex">
      <Sidebar />
      <Backdrop />
      <div className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}>
        <Header />
        <div className="p-4 mx-auto max-w-screen-2xl md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
}
