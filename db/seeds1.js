const vision = require('@google-cloud/vision')({
  projectId: 'image-scraping',
  keyFilename: 'Image-scraping-5d9b95a7812f.json'
});
const mongoose = require('mongoose');
const config = require('../config/config');
const databaseUrl = config.db;
const Property = require('../models/property');
const rp = require('request-promise');
const fs = require('fs');
const request = require('request');
const async = require('async');
const PARALLEL_LIMIT = 3;
const start = 47;
const end = 101;
let counter = 0;

const squareFeetArray = ['SQ FT','SQ.FT','SQFT','FT2','SQUARE FEET','SQUARE FT','SAFT','SA FT','SQ-FT','SQ- FT','SQ FEET','SO FT','SO FEET','SO.FT','SOFT','SO-FT','SO- FT'];

mongoose.connect(databaseUrl);

// Property.collection.drop();

const download = (uri, filename, callback) => {
  request.head({uri: uri}, function(err, res){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

function saveProperty(listing, callback) {
  listing.date = Date.parse(listing.last_published_date);
  Property.count({listing_id: listing.listing_id}, (err, count) => {
    console.log(count);
    if (count === 0 ) {
      if (listing.floor_plan) {
        download(listing.floor_plan[0], `images/${listing.listing_id}.png`, () => {
          vision.detectText(`images/${listing.listing_id}.png`, (err, text) => {
            if (err) console.log('cloud vision error:', err);
            else if (text[0] && text) {
              listing.floorPlanText = text[0];
              listing.floorPlanText = listing.floorPlanText.split('\n').join(' ').split(',').join('');
              let sqFt;
              squareFeetArray.forEach((value) => {
                if (listing.floorPlanText.toUpperCase().includes(value)) {
                  sqFt = value;
                }
              });
              listing.floorPlanText = listing.floorPlanText.toUpperCase().split(sqFt);
              listing.floorPlanText.forEach((value, index) => {
                listing.floorPlanText[index] = parseInt(value.split(' ')[value.split(' ').length-2]);
              });
              listing.floorPlanText.splice(listing.floorPlanText.length-1, 1);
              if (isFinite((Math.max.apply(null, listing.floorPlanText)))) {
                listing.squareFeet = Math.max.apply(null, listing.floorPlanText);
              }
              if (listing.squareFeet) {
                listing.pricePerSquareFoot = listing.price / listing.squareFeet;
                if (listing.pricePerSquareFoot > 2000 || listing.pricePerSquareFoot < 250) {
                  delete listing.squareFeet;
                  delete listing.pricePerSquareFoot;
                }
              }
            }
            Property.create(listing, (err, listing) => {
              if (err) return console.log(err);
              counter++;
              return console.log(`${listing.listing_id} saved, ${counter}`);
            });
            callback();
          });
        });
      } else {
        Property.create(listing, (err, listing) => {
          if (err) return console.log(err);
          counter++;
          console.log(`${listing.listing_id} saved, ${counter}`);
          callback();
        });
      }
    } else callback();
  });
}



for (var i = start; i < end; i++) {
  let squareFeetCount = 0;
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
      async.eachLimit(data.listing, PARALLEL_LIMIT, saveProperty, function(err) {
        if (err) console.log('async error:', err);
        Property.find({}, (err, results) => {
          console.log('Total properties saved: ', results.length);
          results.forEach((value) => {
            if (value.squareFeet) squareFeetCount++;
          });
          console.log('Properties with square feet: ', squareFeetCount);
        });
      });
    })
    .catch(err => {
      if (err) console.log('rp error:', err);
    });
  }, (i-start) * 450000);
}
