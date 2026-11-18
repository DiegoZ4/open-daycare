"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

function navIcon(children: ReactNode): ReactNode {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

const navItems: NavItem[] = [
  {
    label: "Feed",
    href: "/",
    icon: navIcon(<path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />),
  },
  {
    label: "Niños",
    href: "/children",
    icon: navIcon(
      <>
        <circle cx="9" cy="7" r="3" />
        <circle cx="17" cy="9" r="2.4" />
        <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 20a5 5 0 0 1 5.5-4.9" />
      </>
    ),
  },
  {
    label: "Avisos",
    href: "#",
    icon: navIcon(
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
    ),
  },
  {
    label: "Mi cuenta",
    href: "#",
    icon: navIcon(
      <>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
  },
];

const baseItemClass = "flex items-center gap-3 py-[11px] px-3 rounded-[12px] text-[14.5px]";
const activeItemClass = `${baseItemClass} bg-[#FBE3D8] text-[#D9583C] font-extrabold`;
const inactiveItemClass = `${baseItemClass} text-[#6E6359] font-semibold`;

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 flex-1">
      {navItems.map((item) => {
        const className = isActive(pathname, item.href) ? activeItemClass : inactiveItemClass;

        if (item.href === "#") {
          return (
            <a key={item.label} href="#" className={className}>
              {item.icon}
              {item.label}
            </a>
          );
        }

        return (
          <Link key={item.label} href={item.href} className={className}>
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
