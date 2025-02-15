/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};
module.exports = {
  eslint: {
    ignoreDuringBuilds: true, // Skip ESLint checks in production
  },
};



export default nextConfig;

