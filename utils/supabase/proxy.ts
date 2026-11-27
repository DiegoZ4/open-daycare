import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export async function updateSession(request: NextRequest) {
  // Optimistic auth redirects based on cookie presence only (no network
  // checks in the proxy — Next.js 16 docs). The real defense is the
  // server-side getUser() check in app/(staff)/layout.tsx.
  const { pathname } = request.nextUrl;
  const isPublicAuthRoute =
    pathname === "/login" || pathname === "/activate-account";
  const hasSessionCookie = request.cookies
    .getAll()
    .some(({ name }) => name.includes("-auth-token"));

  if (!isPublicAuthRoute && !hasSessionCookie) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }
  if (isPublicAuthRoute && hasSessionCookie) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  // Create an unmodified response
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    },
  );

  // IMPORTANT: do not run code between createServerClient and supabase.auth.getUser().
  // Calling getUser() here refreshes expired auth tokens and persists the new
  // ones in cookies, keeping the session alive on every request.
  await supabase.auth.getUser()

  return supabaseResponse
}
