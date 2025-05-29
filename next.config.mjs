/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'explorer-api.walletconnect.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'd2f70xi62kby8n.cloudfront.net',
        pathname: '/bridge/icons/**',
      },
      {
        protocol: 'https',
        hostname: 'smartcontract.imgix.net',
        pathname: '/tokens/**',
      },
    ],
    dangerouslyAllowSVG: true,
  },
};

export default nextConfig;
