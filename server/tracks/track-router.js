var express = require('express');
var router = express.Router();
import TrackService from './track-service';

router.post('/', (req, res, next) => {
  req.body.userId = req.user._id;
  
  TrackService.createTrack(req.body).then(
    (createdTrack) => res.json(createdTrack));
});

module.exports = router;
