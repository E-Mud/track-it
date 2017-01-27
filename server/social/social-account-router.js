var express = require('express');
var router = express.Router();
import TwitterApi from 'node-twitter-api';
import Auth from '../users/auth';
import SocialAccountService from './social-account-service';

router.get('/twitter/access', (req, res, next) => {
  SocialAccountService.Twitter.startAccessRequest(req.user._id).then((redirectUrl) => {
    res.redirect(redirectUrl)
  })
});

module.exports = router;
