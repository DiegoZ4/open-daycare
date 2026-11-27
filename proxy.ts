import { updateSession } from "@/utils/supabase/proxy";
import type { NextRequest } from "next/server";

// Next.js 16 renamed the `middleware` file convention to `proxy`.
// This keeps Supabase auth sessions refreshed on every request.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static image files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
