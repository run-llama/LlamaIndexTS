const path = require('path');

module.exports = {
  target: 'web',
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'main.bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.js', '.ts'],
    symlinks: false,
  },
  experiments: {
    asyncWebAssembly: true,
  },
};
