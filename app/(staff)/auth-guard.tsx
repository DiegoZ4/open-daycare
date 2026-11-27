import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import type { ReactNode } from "react";

import { Sidebar } from "@/app/components/sidebar";
import { TopBar } from "@/app/components/top-bar";
import { createClient } from "@/utils/supabase/server";

// Profile consumed by the staff shell (SPEC 09). Built from public.users
// joined with public.daycares; no generated Database types yet.
export type Profile = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  daycareName: string;
  role: "admin" | "staff" | "parent";
};

type UserRow = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: "admin" | "staff" | "parent";
  daycares: { name: string } | { name: string }[] | null;
};

async function getProfile(): Promise<Profile | null> {
  // Stop prerendering here: supabase-js reads Date.now() internally when
  // checking token expiry, an unstable value under cacheComponents.
  await connection();
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // getUser() (never getSession()) — it verifies the token against the
  // auth server instead of trusting the cookies (@supabase/ssr docs).
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("users")
    .select("id, full_name, avatar_url, role, daycares(name)")
    .eq("id", user.id)
    .single();

  if (!data) {
    return null;
  }

  const row = data as UserRow;
  const daycareName = Array.isArray(row.daycares)
    ? (row.daycares[0]?.name ?? "")
    : (row.daycares?.name ?? "");

  return {
    id: row.id,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    daycareName,
    role: row.role,
  };
}

// Async guard inside a <Suspense> boundary (see layout): reading cookies is
// a runtime API under cacheComponents, so it must not block the prerendered
// shell. Unauthenticated users get redirected at request time.
export async function AuthGuard({ children }: { children: ReactNode }) {
  const profile = await getProfile();
  if (!profile) {
    redirect("/login");
  }

  return (
    <>
      <Sidebar profile={profile} />
      <TopBar />
      <main className="min-w-0 flex-1 lg:h-screen lg:overflow-y-auto">
        {children}
      </main>
    </>
  );
}
