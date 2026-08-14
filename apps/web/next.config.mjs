/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@jigsaw/shared"],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
