import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit(),
	],
	optimizeDeps: {
		exclude: ['lodash', 'sqlite3', 'sqlite'],
	},
	assetsInclude: ["**/*.sqlite"],
});
