import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protect the chat/app area
  if (pathname.startsWith("/chat") && !user) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  // Prevent logged-in users from going back to login/signup
  if (
    (pathname === "/login" ||
      pathname === "/signup") &&
    user
  ) {
    return NextResponse.redirect(
      new URL("/chat", request.url)
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/chat/:path*",
    "/login",
    "/signup",
  ],
};