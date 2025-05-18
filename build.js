// build.js
const {build} = require("esbuild")
// import { build } from 'esbuild';
const syntaxPlugin = require('./tony/esbuild.plugin.js');

build({
  entryPoints: ['app.js'],
  bundle: true,
  outfile: 'index.js',
  plugins: [syntaxPlugin],
  platform: 'node',
  sourcemap: true,
  // watch: process.argv.includes('--watch'),
}).then(() => {
  console.log('[Tony] Build complete.');
}).catch((err) => {
  console.error('[Tony] Build failed:', err);
});
