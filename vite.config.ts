import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';

export default defineConfig({
  plugins: [
    ...VitePluginNode({
      adapter: 'express', // Use 'express', 'fastify', 'koa', etc.
      appPath: './src/main.ts', // Path to your entry file
      exportName: 'viteNodeApp',
      tsCompiler: 'esbuild',
    }),
  ],
  server: {
    port: 3000, // Port for the Node.js server
  },
});