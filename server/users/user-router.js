var express = require('express');
var router = express.Router();
import UserService from './user-service';

router.post('/register', function(req, res, next) {
  UserService.registerUser(req.body).then(function(createdUser){
    res.json(createdUser);
  }, (error) => {
    res.status(400).json({msg: error});
  });
});

module.exports = router;
