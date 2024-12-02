import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/onboard",
  "/login",
  "/api/auth",
  "/_next",
  "/favicon.ico",
  "/static",
  "/public",
];

// Regex to exclude static files like .glb, .png, .jpg, etc.
const STATIC_FILE_EXTENSIONS = /\.(glb|gltf|png|jpg|jpeg|svg|css|js|ico|woff|woff2|ttf|otf|eot|mp4|webm|m4v|webp)$/;

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Allow requests to public paths or static files
  if (
    PUBLIC_PATHS.some((path) => pathname.startsWith(path)) ||
    STATIC_FILE_EXTENSIONS.test(pathname)
  ) {
    console.log(`Public or static path accessed: ${pathname}`);
    return NextResponse.next();
  }

  // Attempt to get the user's token
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // If no token, redirect to /onboard
  if (!token) {
    console.log(`No token found. Redirecting to /onboard`);
    const onboardUrl = req.nextUrl.clone();
    onboardUrl.pathname = "/onboard";
    onboardUrl.search = ""; // Optional: Clear query parameters
    return NextResponse.redirect(onboardUrl);
  }

  // If token exists, allow the request
  console.log(`Token found. Allowing access to ${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!onboard|login|api/auth|_next|favicon.ico|static|public|\\.[a-z]+$).*)",
  ],
};
