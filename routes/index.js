const express = require('express');
const router = express.Router();
require('dotenv').config();

/* GET home page. Pass through the Google Maps API key. */
router.get('/', function(req, res, next) {
  res.render('index', { MAPS_API_KEY: process.env.MAPS_API_KEY });
});

module.exports = router;