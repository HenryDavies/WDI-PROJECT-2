const express = require('express');
const router = express.Router();

const properties = require('../controllers/properties');
const statics = require('../controllers/statics');

router.route('/')
  .get(statics.home);
router.route('/properties')
  .get(properties.index);

module.exports = router;
