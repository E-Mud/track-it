import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import Auth from './server/users/auth';
import usersRouter from './server/users/user-router';
import tracksRouter from './server/tracks/track-router';

const isDeveloping = process.env.NODE_ENV !== 'production';
const port = isDeveloping ? 3000 : process.env.PORT;
const app = express();

app.use(bodyParser.json());
app.use(cookieParser());
app.use('/api/users', usersRouter);
app.use('/api', (req, res, next) => {
  const authToken = req.get('Authorization').match(/Bearer\s(.+)/)
  
  Auth.getPayload(authToken[1]).then(({user}) => {
    req.user = user
    next();
  })
})
app.use('/api/tracks', tracksRouter);

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
  Auth.getPayload(req.cookies.authToken).then(
    (payload) => res.sendFile(path.join(clientPath, 'main', 'index.html')),
    (error) => res.redirect('/login')
  )
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(clientPath,  'register', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(clientPath,  'login', 'index.html'));
});

if(process.env.NODE_ENV !== 'test'){
  app.listen(port, '0.0.0.0', function onStart(err) {
    if (err) {
      console.log(err);
    }
    console.info('==> 🌎 Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', port, port);
  });
}

export default app;
