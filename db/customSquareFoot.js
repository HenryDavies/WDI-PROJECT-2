
const mongoose = require('mongoose');
const config = require('../config/config');
const databaseUrl = config.db;
const Property = require('../models/property');

mongoose.connect(databaseUrl);

// Compare square feets
//
Property.find({}, (err, data) => {
  let parseCount = 0;
  let scrapeCount = 0;
  let parseScrapeCount = 0;
  data.forEach((listing, index) => {
    if (listing.squareFeet && listing.scrapeSquareFeet !== 'NA') {
      parseCount++;
      scrapeCount++;
      parseScrapeCount++;
      listing.pricePerSquareFoot = listing.price / listing.scrapeSquareFeet;
    } else if (listing.squareFeet) parseCount++;
    else if (listing.scrapeSquareFeet !== 'NA') {
      scrapeCount++;
      listing.pricePerSquareFoot = listing.price / listing.scrapeSquareFeet;
    }
    Property.create(listing, (err, listing) => {
      return console.log(`${listing.listing_id} saved`);
    });
  });
  console.log(`Parse count: ${parseCount}`);
  console.log(`Scrape count: ${scrapeCount}`);
  console.log(`Properties with parse & scrape data: ${parseScrapeCount}`);
  console.log(`Properties with either data: ${parseCount+scrapeCount-parseScrapeCount}`);
});
