const mongoose = require('mongoose');
const config = require('../config/config');
const databaseUrl = config.db;
const Property = require('../models/property');
const rp = require('request-promise');
const start = 0;
const end = 10;
let counter = 0;

mongoose.connect(databaseUrl);

for (var i = start; i < end; i++) {
  const options = {
    uri: `http://api.zoopla.co.uk/api/v1/property_listings.js?area=London&order_by=age&page_size=100&page_number=${i}&listing_status=sale&api_key=gfya4wfdf8ypa8xemktvhx6h`,
    headers: {
      'User-Agent': 'Request-Promise',
      'Connection': 'keep-alive'
    },
    json: true // Automatically parses the JSON string in the response
  };
  setTimeout(function() {
    rp(options)
    .then(data => {
      data.listing.forEach((listing, index) => {
        listing.date = Date.parse(listing.last_published_date);
        Property.count({ listing_id: listing.listing_id, date: Date.parse(listing.last_published_date) }, (err, count) => {
          if (count === 0) {
            Property.create(listing, (err, listing) => {
              if (err) return console.log(err);
              counter++;
              return console.log(`${listing.listing_id} saved, ${counter}`);
            });
          } else console.log('already exists in DB');
        })
        .catch(err => {
          if (err) console.log('rp error:', err);
        });
      });
    });
  },  (i - start) * 1000);
}

// (i - start) * 420000 - delay if downloading more than 1000 (10 pages)
