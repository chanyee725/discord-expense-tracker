"use client";

import React from "react";
import Sidebar from "@/components/Layout/Sidebar";
import { SidebarProvider } from "@/context/SidebarContext";

function LayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen xl:flex">
      <Sidebar />
      <div
        data-slot="layout-content"
        className="flex-1 lg:ms-[290px] bg-surface-page min-h-screen"
      >
        <div className="px-6 py-6">
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
