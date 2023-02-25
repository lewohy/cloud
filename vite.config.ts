import path from 'path';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import suidPlugin from "@suid/vite-plugin";
import monacoEditorPlugin from 'vite-plugin-monaco-editor';

export default defineConfig({
    plugins: [
        solidPlugin(),
        suidPlugin(),
        monacoEditorPlugin({
            languageWorkers: [
                'editorWorkerService',
                'css',
                'html',
                'json',
                'typescript'
            ]
        })
    ],
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
