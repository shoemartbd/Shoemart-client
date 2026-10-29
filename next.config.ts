import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },

      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "png.pngtree.com",
      },
      {
        protocol: "https",
        hostname: "api.bdcourier.com",
      },
    ],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },

  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/auth/:path*`,
      },
      // Google OAuth lands here after sign-in (BETTER_AUTH_URL points at the
      // frontend), so it must reach the backend through the same origin to
      // read the session cookie and set the access/refresh token cookies.
      {
        source: "/api/v1/auth/google/:path*",
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/v1/auth/google/:path*`,
      },
    ];
  },
};

export default nextConfig;
