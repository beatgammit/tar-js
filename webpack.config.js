const webpack = require('webpack');

const debug = process.env.NODE_ENV !== 'production';
const filename = debug ? 'tar.js' : 'tar.min.js';

module.exports = {
  entry: __dirname + '/lib/tar.js',
  output: {
    path: __dirname + '/dist',
    filename,
    library: 'Tar',
  },
  module: {
    loaders: [],
  },
  plugins: debug ? [] : [
    new webpack.optimize.UglifyJsPlugin(),
  ],
};
