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

router.get('/twitter/callback', (req, res, next) => {
  const requestToken = req.query.oauth_token,
    verifier = req.query.oauth_verifier;
    
  SocialAccountService.Twitter.completeAccessRequest(req.user._id, {requestToken, verifier}).then(() => {
    res.redirect('/')
  })
});

module.exports = router;
