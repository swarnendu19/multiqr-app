/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: [], // Add domains if you load images from external URLs
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '50mb',
        },
    },
};

module.exports = nextConfig;
