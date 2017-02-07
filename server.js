import path from 'path';
import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import TrackItAPI from './server/api';
import TrackItApp from './server/app';
import TrackItStream from './server/stream';
import Tracker from './server/tracks/tracker';

let app = express();
app = TrackItAPI.server(app)
app = TrackItApp.server(app)

let server = http.Server(app);
server = TrackItStream.server(server)

if(process.env.NODE_ENV !== 'test'){
  const port = process.env.PORT || 3000;
  server.listen(port, '0.0.0.0', function onStart(err) {
    if (err) {
      console.log(err);
    }else{
      Tracker.startTracking()
    }
    console.info('==> 🌎 Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', port, port);
  });
}

export default server
