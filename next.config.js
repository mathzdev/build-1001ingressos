/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['react-password-checklist', 'string-width'],
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                fs: false,
                tls: false,
                child_process: false,
                net: false,
            };
        }

        return config;
    },
};

module.exports = nextConfig;
