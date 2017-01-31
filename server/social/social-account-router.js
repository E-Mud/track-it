var express = require('express');
var router = express.Router();
import SocialAccountService from './social-account-service';

const TwitterService = SocialAccountService.forType(SocialAccountService.TYPE.TWITTER)

router.get('/twitter/access', (req, res, next) => {
  TwitterService.startAccessRequest(req.user._id).then((redirectUrl) => {
    res.redirect(redirectUrl)
  })
});

router.get('/twitter/callback', (req, res, next) => {
  const requestToken = req.query.oauth_token,
    verifier = req.query.oauth_verifier;

  TwitterService.completeAccessRequest(req.user._id, {requestToken, verifier}).then(() => {
    res.redirect('/')
  })
});

module.exports = router;
