import type { NextConfig } from "next";

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com'], // ← הוסף את זה
  },
}

export default nextConfig;
