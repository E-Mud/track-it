import path from 'path';
import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import TrackItAPI from './server/api';
import TrackItApp from './server/app';

const port = process.env.PORT || 3000;
let app = express();

app = TrackItAPI(app)
app = TrackItApp(app)

const server = http.Server(app);

if(process.env.NODE_ENV !== 'test'){
  server.listen(port, '0.0.0.0', function onStart(err) {
    if (err) {
      console.log(err);
    }
    console.info('==> 🌎 Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', port, port);
  });
}

export default server
