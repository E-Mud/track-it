import bodyParser from 'body-parser';

import Auth from './users/auth';
import usersRouter from './users/user-router';
import tracksRouter from './tracks/track-router';
import socialAccountApiRouter from './social/social-account-api-router';

export default {
  server: (app) => {
    app.use(bodyParser.json());
    app.use('/api/users', usersRouter);
    app.use('/api', (req, res, next) => {
      const authToken = req.get('Authorization').match(/Bearer\s(.+)/)

      Auth.getPayload(authToken[1]).then(({user}) => {
        req.user = user
        next();
      })
    })
    app.use('/api/tracks', tracksRouter);
    app.use('/api/accounts', socialAccountApiRouter);

    return app
  }
}
