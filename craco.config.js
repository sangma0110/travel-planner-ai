const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          "util": require.resolve("util/"),
          "http": require.resolve("stream-http"),
          "https": require.resolve("https-browserify"),
          "stream": require.resolve("stream-browserify"),
          "buffer": require.resolve("buffer/"),
          "url": require.resolve("url/"),
          "process": require.resolve("process/browser"),
          "zlib": require.resolve("browserify-zlib"),
          "crypto": require.resolve("crypto-browserify"),
          "assert": require.resolve("assert/"),
          "path": require.resolve("path-browserify"),
          "fs": false,
          "os": require.resolve("os-browserify/browser")
        }
      },
      plugins: [
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer']
        }),
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
        })
      ],
      module: {
        rules: [
          {
            test: /\.m?js/,
            resolve: {
              fullySpecified: false
            }
          }
        ]
      }
    }
  }
}; 