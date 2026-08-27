/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: [
    '10.0.76.31',
    'localhost',
    '127.0.0.1'
  ],
};

export default nextConfig;
