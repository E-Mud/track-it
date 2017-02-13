var express = require('express');
var router = express.Router();
import TagService from './tag-service';

router.get('/', (req, res, next) => {
  TagService.getAllTags(req.user._id).then(
    (tags) => res.json(tags));
});

module.exports = router;
