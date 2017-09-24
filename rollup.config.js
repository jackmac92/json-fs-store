export default {
  dest: 'bundle.js',
  format: 'cjs',
  entry: 'index.js',
  external: ['async', 'fs', 'path', 'node-uuid', 'mkdirp']
};
