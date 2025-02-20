import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import copyToServerPlugin from './vite-plugin-copy-to-server';

export default defineConfig({
	plugins: [
		sveltekit(),
		copyToServerPlugin({
			targets: [
				{ // node: sqlite 파일 복사
					src: "storage/school.sqlite",
					dest:"build/server/storage/school.sqlite",
				},
				{ // svelte-kit: sqlite 파일 복사
					src: "storage/school.sqlite",
					dest: ".svelte-kit/output/server/storage/school.sqlite",
				},
				{ // .vercel: sqlite 파일 복사
					src: "storage/school.sqlite",
					dest: ".vercel/output/functions/fn.func/.svelte-kit/output/server/storage/school.sqlite",
				},
			]
		}),
	],
	optimizeDeps: {
		exclude: ['lodash', 'sqlite3', 'sqlite'],
	},
	assetsInclude: ["**/*.sqlite"],
});
