// vite-plugin-copy-to-server.js
import fs from 'fs';
import path from 'path';

export default function copyToServerPlugin(options) {
  return {
    name: 'copy-to-server',
    apply: 'build', // Ensure the plugin only applies during the build
    closeBundle() {
      const rootDir = process.cwd();
      // options.targets = [{ src: 'src/index.html', dest: 'dist/index.html' }]
      for (const target of options.targets) {
        const src = path.resolve(rootDir, target.src);
        const srcDir = path.dirname(src);
        console.log("source directory", srcDir)
        if (!fs.existsSync(srcDir)) {
          console.error(`Directory ${srcDir} does not exist`);
          continue;
        }
        // show files in the source directory
        fs.readdirSync(srcDir).forEach(file => {
          console.log("file in source directory", file);
        });

        const dest = path.resolve(rootDir, target.dest);
        if (!fs.existsSync(src)) {
          console.error(`File ${src} does not exist`);
          continue;
        }
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(path.dirname(dest), { recursive: true });
        }
        console.log(`Copying ${src} to ${dest}`)
        fs.copyFileSync(src, dest);

        // show files in the destination directory
        const destDir = path.dirname(dest);
        fs.readdirSync(destDir).forEach(file => {
          console.log("file in destination directory", file);
        });
      }
    }
  };
}
