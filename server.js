import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';

import usersRouter from './server/users/user-router';

const isDeveloping = process.env.NODE_ENV !== 'production';
const app = express();

app.use(bodyParser.json());
app.use('/api/users', usersRouter);

if (isDeveloping) {
  let webpack = require('webpack');
  let webpackMiddleware = require('webpack-dev-middleware');
  let webpackHotMiddleware = require('webpack-hot-middleware');
  let config = require('./webpack.config.js');

  const compiler = webpack(config);
  const middleware = webpackMiddleware(compiler, {
    publicPath: config.output.publicPath,
    noInfo: true,
    quiet: false,
    lazy: false,
    watchOptions: {
      aggregateTimeout: 300,
      poll: true
    },
    stats: {
      colors: true,
    }
  });

  app.use(middleware);
  app.use(webpackHotMiddleware(compiler));
} else {
  const buildJsPath = path.join(__dirname, 'public/build');
  app.use('/public', express.static(buildJsPath));
}

const clientPath = path.join(__dirname, 'client');
app.get('/', (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});
app.get('/register', (req, res) => {
  res.sendFile(path.join(clientPath,  'register', 'index.html'));
});

export default app;
