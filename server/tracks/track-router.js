var express = require('express');
var router = express.Router();
import TrackService from './track-service';

router.post('/', (req, res, next) => {
  req.body.userId = req.user._id;

  TrackService.createTrack(req.body).then(
    (createdTrack) => res.json(createdTrack));
});

router.get('/', (req, res, next) => {
  TrackService.getTracksByUserId(req.user._id).then(
    (tracks) => res.json(tracks));
});

module.exports = router;
