/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    turbopack: {
        resolveExtensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        resolveAlias: {
            '@/*': './src/*'
        }
    }
};

export default nextConfig;