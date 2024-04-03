require('esbuild').buildSync({
  entryPoints: ['index.ts'],
  bundle: true,
  // minify: true,
  packages: 'external',
  platform: 'node',
  outdir: 'dist'
})
