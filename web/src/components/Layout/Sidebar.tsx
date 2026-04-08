"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const pathname = usePathname();
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(
    pathname.includes("transactions") || pathname.includes("category-expenses")
  );
  const [isAssetsOpen, setIsAssetsOpen] = React.useState(
    pathname.includes("assets") || pathname.includes("account-management")
  );

  return (
    <aside
      data-slot="sidebar"
      className="fixed top-0 start-0 z-50 h-screen flex flex-col bg-sidebar border-e border-sidebar-border w-[290px] px-5 shadow-[var(--shadow-elevated)]"
    >
      <div className="py-8 flex">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand text-white shrink-0">
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
          <span className="text-xl font-bold text-foreground">
            가계부
          </span>
        </Link>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mb-6">
          <div className="mb-4 text-[11px] font-semibold tracking-wide uppercase leading-5 text-text-disabled">
            MENU
          </div>

          <div className="flex flex-col gap-1.5">
            <Link
              href="/"
              className={cn(
                "menu-item",
                pathname === "/" || pathname === "/dashboard"
                  ? "menu-item-active"
                  : "menu-item-inactive"
              )}
            >
              <div className={cn(
                pathname === "/" || pathname === "/dashboard"
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
              )}>
                <svg
                  className="fill-current size-5"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.56875 15.75H2.25C1.82812 15.75 1.51875 15.3844 1.51875 14.9906V5.99063C1.51875 5.76563 1.63125 5.54063 1.77188 5.4L8.52187 0.61875C8.775 0.45 9.1125 0.45 9.36562 0.61875L16.2281 5.42813C16.3688 5.56875 16.4813 5.76563 16.4813 5.99063V14.9906C16.4813 15.3844 16.1437 15.75 15.75 15.75H12.375C11.9531 15.75 11.6437 15.3844 11.6437 14.9906V10.6313C11.6437 10.2094 11.3062 9.87188 10.8844 9.87188H7.11562C6.69375 9.87188 6.35625 10.2094 6.35625 10.6313V14.9906C6.35625 15.3844 6.01875 15.75 5.56875 15.75Z"
                    fill=""
                  />
                </svg>
              </div>
              <span className="menu-item-text">대시보드</span>
            </Link>

            {/* 내역 관리 - Collapsible Parent */}
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                className={cn(
                  "menu-item w-full",
                  (pathname.includes("transactions") || pathname.includes("category-expenses"))
                    ? "menu-item-active"
                    : "menu-item-inactive"
                )}
              >
                <div className={cn(
                  (pathname.includes("transactions") || pathname.includes("category-expenses"))
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                )}>
                  <svg
                    className="fill-current size-5"
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
                </div>
                <span className="menu-item-text flex-1 text-start">내역 관리</span>
                <svg
                  className={cn(
                    "fill-current text-text-tertiary transition-transform duration-[var(--duration-normal)]",
                    isHistoryOpen ? "rotate-180" : ""
                  )}
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M6 8.25L2.25 4.5L3.3075 3.4425L6 6.135L8.6925 3.4425L9.75 4.5L6 8.25Z" fill="currentColor"/>
                </svg>
              </button>

              {/* Sub-menu Items */}
              {isHistoryOpen && (
                <div className="flex flex-col gap-1 ms-6">
                  <Link
                    href="/transactions"
                    className={cn(
                      "menu-item text-sm",
                      pathname.includes("transactions")
                        ? "menu-item-active"
                        : "menu-item-inactive"
                    )}
                  >
                    <span className="menu-item-text">거래 내역</span>
                  </Link>
                  
                  <Link
                    href="/category-expenses"
                    className={cn(
                      "menu-item text-sm",
                      pathname.includes("category-expenses")
                        ? "menu-item-active"
                        : "menu-item-inactive"
                    )}
                  >
                    <span className="menu-item-text">카테고리 내역</span>
                  </Link>
                </div>
              )}
            </div>

            {/* 자산 관리 - Collapsible Parent */}
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setIsAssetsOpen(!isAssetsOpen)}
                className={cn(
                  "menu-item w-full",
                  (pathname.includes("assets") || pathname.includes("account-management"))
                    ? "menu-item-active"
                    : "menu-item-inactive"
                )}
              >
                <div className={cn(
                  (pathname.includes("assets") || pathname.includes("account-management"))
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                )}>
                  <svg
                    className="fill-current size-5"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15.75 4.5H2.25C1.63125 4.5 1.125 5.00625 1.125 5.625V13.5C1.125 14.1187 1.63125 14.625 2.25 14.625H15.75C16.3688 14.625 16.875 14.1187 16.875 13.5V5.625C16.875 5.00625 16.3688 4.5 15.75 4.5ZM15.75 13.5H2.25V6.75H15.75V13.5ZM15.75 5.625H2.25V5.625H15.75V5.625Z"
                      fill=""
                    />
                    <path
                      d="M15.75 3.375H2.25C1.8375 3.375 1.5 3.7125 1.5 4.125H16.5C16.5 3.7125 16.1625 3.375 15.75 3.375Z"
                      fill=""
                    />
                    <path d="M12 9.375H14.25V10.5H12V9.375Z" fill="" />
                  </svg>
                </div>
                <span className="menu-item-text flex-1 text-start">자산 관리</span>
                <svg
                  className={cn(
                    "fill-current text-text-tertiary transition-transform duration-[var(--duration-normal)]",
                    isAssetsOpen ? "rotate-180" : ""
                  )}
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M6 8.25L2.25 4.5L3.3075 3.4425L6 6.135L8.6925 3.4425L9.75 4.5L6 8.25Z" fill="currentColor"/>
                </svg>
              </button>

              {/* Sub-menu Items */}
               {isAssetsOpen && (
                 <div className="flex flex-col gap-1 ms-6">
                   <Link
                     href="/assets"
                     className={cn(
                       "menu-item text-sm",
                       pathname === "/assets"
                         ? "menu-item-active"
                         : "menu-item-inactive"
                     )}
                   >
                     <span className="menu-item-text">자산 현황</span>
                   </Link>
                   
                   <Link
                     href="/account-management"
                     className={cn(
                       "menu-item text-sm",
                       pathname.includes("account-management")
                         ? "menu-item-active"
                         : "menu-item-inactive"
                     )}
                   >
                     <span className="menu-item-text">계좌 관리</span>
                   </Link>
                 </div>
               )}
            </div>

            <Link
              href="/recurring-management"
              className={cn(
                "menu-item",
                pathname.includes("recurring-management")
                  ? "menu-item-active"
                  : "menu-item-inactive"
              )}
            >
              <div className={cn(
                pathname.includes("recurring-management")
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
              )}>
                <svg
                  className="fill-current size-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 4V10H7M23 20V14H17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 003.51 15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="menu-item-text">반복 관리</span>
            </Link>

            <Link
              href="/budget-calculator"
              className={cn(
                "menu-item",
                pathname.includes("budget-calculator")
                  ? "menu-item-active"
                  : "menu-item-inactive"
              )}
            >
              <div className={cn(
                pathname.includes("budget-calculator")
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
              )}>
                <svg
                  className="fill-current size-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 7H7V9H9V7ZM11 15H13V17H11V15ZM13 7H11V9H13V7ZM15 7H17V9H15V7ZM11 11H13V13H11V11ZM7 11H9V13H7V11ZM7 15H9V17H7V15ZM15 11H17V13H15V11ZM19 3H18V1H16V3H8V1H6V3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V8H19V19Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <span className="menu-item-text">예산 비율 계산기</span>
            </Link>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
