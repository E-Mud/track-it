var path = require('path');
var webpack = require('webpack');

var javascriptEntryPath = path.resolve(__dirname, 'client', 'index.js');
var buildPath = path.resolve(__dirname, 'public', 'build');
var clientDir = path.resolve(__dirname, 'client')

let pages = {
  main: {
    js: path.resolve(clientDir, 'main', 'index.js')
  },
  login: {
    js: path.resolve(clientDir, 'login', 'index.js')
  },
  register: {
    js: path.resolve(clientDir, 'register', 'index.js')
  }
}

module.exports = {
  entry: {
    main: [
      'webpack-hot-middleware/client?reload=true',
      pages.main.js
    ],
    login: [
      'webpack-hot-middleware/client?reload=true',
      pages.login.js
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
