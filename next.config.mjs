/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	// Optimize page bundles
	poweredByHeader: false,
	compress: true,
	
	...(process.env.TURBOPACK
		? {}
		: {
				webpack: (config, { dev, isServer }) => {
					config.resolve.alias = {
						...config.resolve.alias,
						"@": "./src",
					};

					
					if (dev && !isServer) {
						config.watchOptions = {
							...config.watchOptions,
							// Poll using low CPU cycles
							poll: false,
							// Ignore watching node_modules
							ignored: ["node_modules/**"],
							// Aggregate changes
							aggregateTimeout: 300,
						};
					}

					return config;
				},
		  }),
	// Common config for both Webpack and Turbopack
	experimental: {
		// Turbopack specific optimizations
		turbo: {
			resolveAlias: {
				"@": "./src",
			},
		},
		// Optimize page loading
		optimizeCss: true,
		scrollRestoration: true,
	},
	// Reduce number of rebuilds for static assets
	staticPageGenerationTimeout: 120,
	output: "standalone",
};

export default nextConfig;
