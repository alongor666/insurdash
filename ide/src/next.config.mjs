/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Required for Next.js static export with images.
  images: {
    unoptimized: true,
  }
};

export default nextConfig;
