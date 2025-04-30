/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	// Ignore certificates folder to prevent unnecessary Fast Refresh
	watchOptions: {
		ignored: ["**/certificates/**"],
	},
};

export default nextConfig;
