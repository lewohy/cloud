import path from 'path';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import suidPlugin from "@suid/vite-plugin";

export default defineConfig({
    plugins: [solidPlugin(), suidPlugin()],
    build: {
        target: 'esnext'
    },
    resolve: {
        alias: {
            '~': path.resolve(process.cwd())
        }
    },
    server: {
        middlewareMode: true
    },
    publicDir: false
});
