"use client";

import React from "react";
import { useSidebar } from "@/context/SidebarContext";

const Header = () => {
  const { toggleSidebar, toggleMobileSidebar } = useSidebar();

  const handleToggle = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth >= 1024) {
        toggleSidebar();
      } else {
        toggleMobileSidebar();
      }
    }
  };

  return (
    <header className="sticky top-0 flex w-full bg-white border-gray-200 z-[99999] lg:border-b">
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
        <div className="flex items-center justify-between w-full px-4 py-4 border-b border-gray-200 lg:w-auto lg:border-b-0 lg:py-0 lg:px-0">
          <button
            onClick={handleToggle}
            className="flex items-center justify-center w-10 h-10 text-gray-500 rounded-lg lg:h-11 lg:w-11 lg:border lg:border-gray-200"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <div className="flex items-center lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-brand-500 text-white text-xs font-bold">
              PG
            </div>
          </div>

          <div className="w-10 lg:hidden" />
        </div>

        <div className="hidden lg:block lg:py-4">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="검색..."
              className="h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-4 focus:ring-brand-500/10 xl:w-[430px]"
            />
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-3 lg:py-4">
          <div className="w-10 h-10 rounded-full bg-gray-100" />
        </div>
      </div>
    </header>
  );
};

export default Header;
