import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
	build: {
		outDir: 'build', // 결과물을 build 폴더에 저장
	},
	plugins: [
		sveltekit(),
		viteStaticCopy({
			targets: [
				{
					src: 'src/background.js',
					dest: ''
				}
			]
		})
	],
});
