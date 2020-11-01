const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

// Send this through in the event of no results
function noResults(res, error = "") {
  console.log(error);
  res.json([{}]);
}

/* GET events based on location */
router.get('/events/:location', function (req, res) {
  // Retrieve the location and remove the unnecessary characters
  const location = req.params.location.replace(/\(|\)| /g, '');

  // API URL
  const url = `http://api.eventful.com/json/events/search?app_key=${process.env.EVENTFUL_API_KEY}&` +
    `location=${location}&` +
    'units=km&within=50&' +
    'include=categories,price,links&' +
    'date=Next+Week&sort_order=date&page_size=250';

  axios.get(url)
    .then((response) => res.json(response.data.events.event))
    .catch((error) => noResults(res, error));
});

/* GET events based on keywords collected from a title as well as location and category */
router.get('/events/:location/:categories/:title', function (req, res) {
  // Filter and split a title to get a list of keywords
  const location = req.params.location.replace(/\(|\)| /g, '');
  const { categories } = req.params;
  const { title } = req.params;
  let rsp = [];
  let addedIDs = [];
  let keywords = title
    .replace(/[^A-Za-z0-9 ]/g, '')
    .replace(/  /g, ' ')
    .split(' ');

  // The below block of code is simultaneously executed for however many items are in the list of keywords.
  // The block queries the API and then adds its results to an array and removes a keyword.
  // Once there are no more keywords, that's the green light to pass the results to the client.
  keywords.forEach(keyword => {
    const url = `http://api.eventful.com/json/events/search?app_key=${process.env.EVENTFUL_API_KEY}&` +
      `keywords=${keyword}&` +
      `location=${location}&` +
      'units=km&within=50&' +
      `category=${categories}&` +
      'include=categories,price,links&' +
      'date=Future&sort_order=date&page_size=250';
    axios.get(url)
      .then((response) => {
        response.data.events.event.forEach(event => {
          if (!addedIDs.includes(event.id) && event.title !== title) { // Prevent duplicates (mostly) and the original event showing up
            rsp.push(event);
            addedIDs.push(event.id);
          }
        });
        keywords.splice(keywords.indexOf(keyword), 1);
        if (keywords.length === 0) { // Send the response when all keywords have been processed
          if (rsp.length > 0) {
            res.json(rsp);
          } else {
            noResults(res);
          }
        }
      })
      .catch((error) => noResults(res, error));
  });
});

module.exports = router;