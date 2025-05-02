/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,

	// Use webpack configuration for ignoring files
	webpack: (config, { isServer }) => {
		// Ignore certificate files in the webpack watcher
		config.watchOptions = {
			ignored: /certificates/,
		};
		return config;
	},
};

export default nextConfig;
