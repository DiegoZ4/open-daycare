import Link from "next/link";
import { SidebarNav } from "@/app/components/sidebar-nav";
import { NewPostButton } from "@/app/components/new-post-button";
import { SidebarLogout } from "@/app/components/sidebar-logout";
import type { Profile } from "@/app/(staff)/auth-guard";

// Spanish UI labels for the user_role enum values (DB keeps English enums).
const ROLE_LABELS: Record<Profile["role"], string> = {
  admin: "Admin",
  staff: "Personal",
  parent: "Familia",
};

function initialsOf(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}

export function Sidebar({ profile }: { profile: Profile }) {
  return (
    <aside className="hidden lg:flex w-[248px] shrink-0 flex-col bg-[#FFFDF9] border-r border-[#ECE0D0] py-6 px-4 sticky top-0 h-screen">
      <Link href="/" className="flex items-center gap-[11px] px-2 pt-1 pb-[22px]">
        <div className="flex items-center justify-center shrink-0 w-[38px] h-[38px] rounded-[12px] bg-[linear-gradient(155deg,#F8C3A8,#F2937A)]">
          <svg
            width="21"
            height="21"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        </div>
        <div>
          <div className="font-display font-semibold text-[17px] leading-none text-[#3F362E]">
            OpenDayCare
          </div>
          <div className="mt-[2px] text-[11.5px] text-[#A89A8B] truncate">
            {profile.daycareName}
          </div>
        </div>
      </Link>
      <NewPostButton />
      <SidebarNav />
      <div className="mt-[10px] border-t border-[#ECE0D0] pt-[14px]">
        <div className="flex items-center gap-[11px] py-[6px] px-2">
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt={profile.fullName}
              className="flex items-center justify-center shrink-0 w-[38px] h-[38px] rounded-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center shrink-0 w-[38px] h-[38px] rounded-full bg-[#F2937A] text-white font-display font-semibold text-[16px]">
              {initialsOf(profile.fullName)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-extrabold text-[14px] text-[#3F362E] truncate">
              {profile.fullName}
            </div>
            <div className="text-[12px] text-[#A89A8B]">
              {ROLE_LABELS[profile.role]}
            </div>
          </div>
          <SidebarLogout />
        </div>
      </div>
    </aside>
  );
}
