var express = require('express');
var router = express.Router();
import SocialAccountBase from './social-account-base';

router.get('/', (req, res, next) => {
  SocialAccountBase.getCompleteAccounts(req.user._id).then((accounts) => {
    res.json(accounts)
  })
});

module.exports = router;
