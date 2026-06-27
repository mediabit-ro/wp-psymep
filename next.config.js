/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	async redirects() {
		return [
			{
				// Orice sub-pagină (ex: /calendar, /login) este trimisă înapoi
				// la pagina principală care afișează mesajul de migrare.
				// `/:path+` necesită cel puțin un segment, deci `/` nu se redirectează spre sine.
				source: '/:path+',
				destination: '/',
				permanent: false,
			},
		];
	},
};
module.exports = nextConfig;
