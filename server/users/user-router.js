var express = require('express');
var router = express.Router();
import UserService from './user-service';

router.post('/register', (req, res, next) => {
  UserService.registerUser(req.body).then((createdUser) => {
    delete createdUser.password
    res.json(createdUser);
  }, (error) => {
    res.status(400).json({msg: error});
  });
});

router.post('/login', (req, res) => {
  UserService.login(req.body).then(
    (result) => res.cookie('authToken', result.authToken).json(result),
    (err) => {
      res.status(400).json({msg: err.message})
    }
  )
})

module.exports = router;
