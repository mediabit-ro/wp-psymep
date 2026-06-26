/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	async redirects() {
		return [
			{
				source: '/:path*',
				destination: 'https://app.kalyra.io/',
				permanent: false,
			},
		];
	},
};
module.exports = nextConfig;
