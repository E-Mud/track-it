var path = require('path');
var webpack = require('webpack');

var javascriptEntryPath = path.resolve(__dirname, 'client', 'index.js');
var htmlEntryPath = path.resolve(__dirname, 'client', 'index.html');
var buildPath = path.resolve(__dirname, 'public', 'build');

let pages = {
  example: {
    js: path.resolve(__dirname, 'client', 'index.js')
  },
  register: {
    js: path.resolve(__dirname, 'client', 'register', 'index.js')
  }
}

module.exports = {
  entry: {
    example: [
      'webpack-hot-middleware/client?reload=true',
      pages.example.js
    ],
    register: [
      'webpack-hot-middleware/client?reload=true',
      pages.register.js
    ]
  },
  output: {
    path: buildPath,
    publicPath: '/public/',
    filename: '[name].bundle.js',
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      loaders: ['react-hot', 'babel?presets[]=react,presets[]=es2015'],
    }, {
      test: /\.css$/,
      context: '/styles',
      loader: 'file?name=[path][name].[ext]',
    }, {
      test: /\.styl$/,
      loader: 'style-loader!css-loader!stylus-loader'
    }],
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ]
};
