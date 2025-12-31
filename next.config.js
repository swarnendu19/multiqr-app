const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin();

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

module.exports = withNextIntl(nextConfig);
