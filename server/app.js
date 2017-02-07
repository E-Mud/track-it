import path from 'path';
import cookieParser from 'cookie-parser';

import webpack from 'webpack';
import webpackMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import config from '../webpack.config.js';

import Auth from './users/auth';
import socialAccountRouter from './social/social-account-router';

export default {
  server: (app) => {
    const isDeveloping = process.env.NODE_ENV !== 'production';

    app.use(cookieParser());

    if (isDeveloping) {
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
      const buildJsPath = path.join(__dirname, '../public/build');
      app.use('/public', express.static(buildJsPath));
    }

    const clientPath = path.join(__dirname, '../client');

    app.use((req, res, next) => {
      Auth.getPayload(req.cookies.authToken).then(
        ({user}) => {
          req.user = user
          next()
        },
        (error) => next()
      )
    })

    app.get('/register', (req, res) => {
      if(req.user){
        res.redirect('/')
      }else{
        res.sendFile(path.join(clientPath,  'register', 'index.html'));
      }
    });

    app.get('/login', (req, res) => {
      if(req.user){
        res.redirect('/')
      }else{
        res.sendFile(path.join(clientPath,  'login', 'index.html'));
      }
    });

    app.use((req, res, next) => {
      if(req.user){
        next()
      }else{
        res.redirect('/login')
      }
    })
    app.use('/', socialAccountRouter);
    app.get('/', (req, res) => {
      res.sendFile(path.join(clientPath, 'main', 'index.html'))
    });

    return app
  }
}
