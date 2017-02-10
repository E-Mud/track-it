import path from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';

import React from 'react';
import {renderToString} from 'react-dom/server';

import webpack from 'webpack';
import webpackMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import config from '../webpack.config.js';

import MainPage from '../client/main/component';

import Auth from './users/auth';
import socialAccountRouter from './social/social-account-router';

import SocialAccountService from './social/social-account-service';
import TrackService from './tracks/track-service';

export default {
  server: (app) => {
    const isDeveloping = process.env.NODE_ENV !== 'production';

    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'pug');

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
      req.authToken = req.cookies.authToken

      Auth.getPayload(req.authToken).then(
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
      Promise.all([
        TrackService.getTracksByUserId(req.user._id),
        SocialAccountService.getCompleteAccounts(req.user._id)
      ]).then((result) => {
        const trackList = result[0],
          socialAccounts = result[1],
          authToken = req.authToken,
          markup = renderToString(<MainPage socialAccounts={socialAccounts} trackList={trackList} authToken={authToken}/>)

          res.render('layout', {
            title: 'Track',
            stylesFile: 'main.css',
            scriptFile: 'main.bundle.js',
            props: {socialAccounts, trackList, authToken},
            markup: markup
          })
      })
    });

    return app
  }
}
