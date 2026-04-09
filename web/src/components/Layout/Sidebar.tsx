"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  RefreshCw,
  Calculator,
  ChevronDown,
} from "lucide-react";

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
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand text-white shrink-0">
            <Wallet className="size-5" strokeWidth={2.2} />
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight">
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
                <LayoutDashboard className="size-5" strokeWidth={1.8} />
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
                  <Receipt className="size-5" strokeWidth={1.8} />
                </div>
                <span className="menu-item-text flex-1 text-start">내역 관리</span>
                <ChevronDown
                  className={cn(
                    "size-4 text-text-tertiary transition-transform duration-[var(--duration-normal)]",
                    isHistoryOpen ? "rotate-180" : ""
                  )}
                  strokeWidth={2}
                />
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
                  <Wallet className="size-5" strokeWidth={1.8} />
                </div>
                <span className="menu-item-text flex-1 text-start">자산 관리</span>
                <ChevronDown
                  className={cn(
                    "size-4 text-text-tertiary transition-transform duration-[var(--duration-normal)]",
                    isAssetsOpen ? "rotate-180" : ""
                  )}
                  strokeWidth={2}
                />
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
                <RefreshCw className="size-5" strokeWidth={1.8} />
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
                <Calculator className="size-5" strokeWidth={1.8} />
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
