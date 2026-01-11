/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workstream/ui"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
