var express = require('express');
var router = express.Router();
import SocialAccountBase from './social-account-base';

const removeAuthInfo = (accounts) => {
  return accounts.map((acc) => {
    let newAcc = Object.assign({}, acc);
    delete newAcc.auth

    return newAcc
  })
}

router.get('/', (req, res, next) => {
  SocialAccountBase.getCompleteAccounts(req.user._id).then((accounts) => {
    res.json(removeAuthInfo(accounts))
  })
});

module.exports = router;
