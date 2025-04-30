/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	
	watchOptions: {
		ignored: ["**/certificates/**"],
	},
};

export default nextConfig;
