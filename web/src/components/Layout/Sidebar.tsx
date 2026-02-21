"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const pathname = usePathname();
  const { sidebarOpen, closeSidebar } = useSidebar();
  const trigger = useRef<HTMLButtonElement>(null);
  const sidebar = useRef<HTMLElement>(null);

  // Close sidebar on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target as Node) ||
        trigger.current.contains(target as Node)
      )
        return;
      closeSidebar();
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  }, [sidebarOpen, closeSidebar]);

  // Close sidebar on escape key
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;
      closeSidebar();
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, [sidebarOpen, closeSidebar]);

  return (
    <aside
      ref={sidebar}
      className={cn(
        "absolute left-0 top-0 z-9999 flex h-screen w-[290px] flex-col overflow-y-hidden bg-white duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* SIDEBAR HEADER */}
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-primary text-white">
            <svg
              className="fill-current"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8.5 10C9.32843 10 10 9.32843 10 8.5C10 7.67157 9.32843 7 8.5 7C7.67157 7 7 7.67157 7 8.5C7 9.32843 7.67157 10 8.5 10Z"
                fill="currentColor"
              />
              <path
                d="M15.5 10C16.3284 10 17 9.32843 17 8.5C17 7.67157 16.3284 7 15.5 7C14.6716 7 14 7.67157 14 8.5C14 9.32843 14.6716 10 15.5 10Z"
                fill="currentColor"
              />
              <path
                d="M8.5 17C9.32843 17 10 16.3284 10 15.5C10 14.6716 9.32843 14 8.5 14C7.67157 14 7 14.6716 7 15.5C7 16.3284 7.67157 17 8.5 17Z"
                fill="currentColor"
              />
              <path
                d="M15.5 17C16.3284 17 17 16.3284 17 15.5C17 14.6716 16.3284 14 15.5 14C14.6716 14 14 14.6716 14 15.5C14 16.3284 14.6716 17 15.5 17Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <span className="text-xl font-bold text-black dark:text-white">
            POOR GUY
          </span>
        </Link>

        <button
          ref={trigger}
          onClick={closeSidebar}
          className="block lg:hidden"
        >
          <svg
            className="fill-current"
            width="20"
            height="18"
            viewBox="0 0 20 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
              fill=""
            />
          </svg>
        </button>
      </div>
      {/* SIDEBAR HEADER */}

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        {/* Sidebar Menu */}
        <nav className="mt-5 px-4 py-4 lg:mt-9 lg:px-6">
          {/* Menu Group */}
          <div>
            <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
              MENU
            </h3>

            <ul className="mb-6 flex flex-col gap-1.5">
              {/* Menu Item Dashboard */}
              <li>
                <Link
                  href="/"
                  className={cn(
                    "group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4",
                    pathname === "/" || pathname === "/dashboard"
                      ? "bg-graydark dark:bg-meta-4 text-white"
                      : "text-black dark:text-white"
                  )}
                >
                  <svg
                    className="fill-current"
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5.56875 15.75H2.25C1.82812 15.75 1.51875 15.3844 1.51875 14.9906V5.99063C1.51875 5.76563 1.63125 5.54063 1.77188 5.4L8.52187 0.61875C8.775 0.45 9.1125 0.45 9.36562 0.61875L16.2281 5.42813C16.3688 5.56875 16.4813 5.76563 16.4813 5.99063V14.9906C16.4813 15.3844 16.1437 15.75 15.75 15.75H12.375C11.9531 15.75 11.6437 15.3844 11.6437 14.9906V10.6313C11.6437 10.2094 11.3062 9.87188 10.8844 9.87188H7.11562C6.69375 9.87188 6.35625 10.2094 6.35625 10.6313V14.9906C6.35625 15.3844 6.01875 15.75 5.56875 15.75Z"
                      fill=""
                    />
                  </svg>
                  대시보드
                </Link>
              </li>
              {/* Menu Item Dashboard */}

              {/* Menu Item Transactions */}
              <li>
                <Link
                  href="/transactions"
                  className={cn(
                    "group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4",
                    pathname.includes("transactions")
                      ? "bg-graydark dark:bg-meta-4 text-white"
                      : "text-black dark:text-white"
                  )}
                >
                  <svg
                    className="fill-current"
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15.75 3.375H2.25C1.63125 3.375 1.125 3.88125 1.125 4.5V13.5C1.125 14.1187 1.63125 14.625 2.25 14.625H15.75C16.3688 14.625 16.875 14.1187 16.875 13.5V4.5C16.875 3.88125 16.3688 3.375 15.75 3.375ZM15.75 13.5H2.25V7.875H15.75V13.5ZM15.75 5.625H2.25V4.5H15.75V5.625Z"
                      fill=""
                    />
                    <path d="M4.5 10.125H6.75V11.25H4.5V10.125Z" fill="" />
                  </svg>
                  거래 내역
                </Link>
              </li>
              {/* Menu Item Transactions */}
            </ul>
          </div>
        </nav>
        {/* Sidebar Menu */}
      </div>
    </aside>
  );
};

export default Sidebar;
