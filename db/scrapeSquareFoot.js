const rp         = require('request-promise');
const cheerio    = require('cheerio');
const mongoose   = require('mongoose');
const config = require('../config/config');
const databaseUrl = config.db;
const Property = require('../models/property');
let counter = 0;

mongoose.connect(databaseUrl);

function cheerioUrlAsync(url, callback) {
  rp(url)
  .then(htmlString => {
    const $ = cheerio.load(htmlString);
    const squareFoot = $('.num-sqft').text();
    callback(squareFoot);
  }).catch(err => {
    console.log(err);
  });
}

Property.find({}, (err, data) => {
  data.forEach((listing, index)=> {
    setTimeout(() => {
      if (!listing.scrapeSquareFeet || listing.scrapeSquareFeet !== 'NA') {
        cheerioUrlAsync(listing.details_url.split('&utm_medium=api')[0], (squareFoot) => {
          if (parseInt(squareFoot)) {
            counter++;
            listing.scrapeSquareFeet = parseInt(squareFoot.split(',').join(''));
            listing.pricePerSquareFoot = listing.price / listing.scrapeSquareFeet;
          } else listing.scrapeSquareFeet = 'NA';
          Property.create(listing, (err, listing) => {
            console.log(`${listing.scrapeSquareFeet},${counter},${index+1}`);
            return console.log(`${listing.listing_id} saved`);
          });
        });
      }
    }, index);
  });
});
