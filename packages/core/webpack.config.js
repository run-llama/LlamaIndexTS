const path = require('path');
const os = require('os');

const browserConfig = {
  target: 'web',
  mode: 'development',
  entry: './src/browser.ts',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        include: /src/,
        use: 'ts-loader',
      },
      {
        test: /\.wasm$/,
        type: "asset/inline",
      }
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    symlinks: false,
    fallback: {
      "fs": false,
      "tls": false,
      "net": false,
      "path": false,
      "zlib": false,
      "http": false,
      "https": false,
      "stream": false,
      "crypto": false
    }
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'browser.bundle.js',
    library: {
      name: 'llamaindex',
      type: 'umd',
    },
  },
  experiments: {
    asyncWebAssembly: true,
  },
  //   plugins: [
  //   new BundleAnalyzerPlugin()
  // ]
};

// const serverConfig = {
//   target: 'node',
//   mode: 'development',
//   entry: './src/index.ts',
//   devtool: 'inline-source-map',
//   module: {
//     rules: [
//       {
//         test: /\.ts$/,
//         include: /src/,
//         use: 'ts-loader',
//       },
//       {
//         test: /\.wasm$/,
//         type: "asset/inline",
//       },
//       {
//         test: /\.node$/,
//         loader: "node-loader",
//       }
//     ]
//   },
//   resolve: {
//     extensions: ['.ts', '.js'],
//   },
//   output: {
//     path: path.resolve(__dirname, 'dist'),
//     filename: 'node.bundle.js',
//     library: {
//       name: 'llamaindex',
//       type: 'umd',
//     },
//   },
//   experiments: {
//     asyncWebAssembly: true,
//   },
// };

module.exports = [browserConfig];
