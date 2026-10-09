/** @type {import('next').NextConfig} */
const nextConfig = {
  // Images are served from public/images, a junction to ../images (see README).
  images: { unoptimized: true },
};
export default nextConfig;
