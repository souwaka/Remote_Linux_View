/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack のオリジン制限を解除
  allowedDevOrigins: ['192.168.43.56'],
};

module.exports = nextConfig;

