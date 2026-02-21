"use client";

import React from "react";
import Sidebar from "@/components/Layout/Sidebar";
import { SidebarProvider } from "@/context/SidebarContext";

function LayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen xl:flex">
      <Sidebar />
      <div className="flex-1 lg:ml-[290px]">
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
