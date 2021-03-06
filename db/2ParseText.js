const vision = require('@google-cloud/vision')({
  projectId: 'image-scraping',
  keyFilename: 'Image-scraping-5d9b95a7812f.json'
});
const mongoose = require('mongoose');
const config = require('../config/config');
const databaseUrl = config.db;
const Property = require('../models/property');
const fs = require('fs');
const request = require('request');
const async = require('async');
const PARALLEL_LIMIT = 3;
const path = require('path');
let counter = 0;

const squareFeetArray = ['SQFT','SQ FT','SOFT','SO FT','SAFT','SA FT','SQ FEET',
  'SQ.FT','SQ. FT','SO.FT','SO. FT','SA.FT','SA. FT','SQ.FEET','SQ. FEET',
  'SQ-FT','SQ- FT','SO-FT','SO- FT','SA-FT','SA- FT','SQ-FEET','SQ- FEET',
  'SQUARE FEET','SQUARE FT','FT2'];

mongoose.connect(databaseUrl);

const download = (uri, filename, callback) => {
  request.head({ uri: uri }, function(err, res){
    if (err) {
      console.log(err)
    } else {
      console.log('content-type:', res.headers['content-type']);
      console.log('content-length:', res.headers['content-length']);

      request(uri)
        .pipe(fs.createWriteStream(filename))
        .on('close', callback)
        .on('error', (err) => {
          return console.log(err);
        });
    }
  });
};

// GET SQUARE FEET DATA FROM FLOOR PLANS AND SAVE TO DB
function editProperty(listing, callback) {
  console.log(listing.pricePerSquareFoot);
  if (listing.price == 0) {
    Property.remove({ listing_id: listing.listing_id, date: listing.date }, err => {
      if (err) {
        console.log(err);
      } else {
        console.log('Property removed');
        callback();
      }
    });
  } else if (listing.floor_plan[0] && listing.floor_plan[0] !== undefined && !listing.pricePerSquareFoot) {
    download(listing.floor_plan[0], path.join(__dirname, `../images/${listing.listing_id}.png`), () => {
      vision.detectText(path.join(__dirname, `../images/${listing.listing_id}.png`), (err, text) => {
        if (err) {
          console.log('cloud vision error:', err);
          callback();
        } else if (text[0] && text) {
          listing.floorPlanText = text[0];
          listing.parsedText = listing.floorPlanText
          .split(',').join('')    // thousand separator
          .split('\n').join(' ')
          .split('(').join(' ')
          .split(')').join(' ')
          .split('/').join(' ')
          .split('-').join(' ');  // equals signs often register as dashes
          listing.array = [];
          listing.finalArray = [];
          delete listing.squareFeet;
          listing.pricePerSquareFoot = 'NA';
          squareFeetArray.forEach((value, index) => {
            if (listing.parsedText.toUpperCase().includes(value)) {
              listing.array[index] = listing.parsedText.toUpperCase().split(value);
              listing.array[index].forEach((value, index1) => {
                listing.array[index][index1] = parseInt(value.split(' ')[value.split(' ').length -2]);
                if (isNaN(listing.array[index][index1])) {
                  listing.array[index][index1] = 0;
                }
              });
              // console.log('yes', value);
              listing.array[index].splice(listing.array[index].length-1, 1);
            }
          });
          listing.array.forEach((array, index) => {
            if (listing.array[index]) {
              listing.finalArray.push(Math.max.apply(null,listing.array[index]));
            }
          });
          if (isFinite(Math.max.apply(null, listing.finalArray)) && Math.max.apply(null, listing.finalArray) !== null && Math.max.apply(null, listing.finalArray) !== 0 ) {
            listing.squareFeet = Math.max.apply(null, listing.finalArray);
            listing.pricePerSquareFoot = listing.price / listing.squareFeet;
          }
          console.log(listing.finalArray,listing.squareFeet);
          listing.save((err, listing) => {
            if (err) return console.log(err);
            counter++;
            console.log(`${listing.listing_id} saved, ${counter}`);
            callback();
          });
        } else callback();
      });
    });
  } else callback();
}

// descending sort
function sortByKey(array, key) {
  return array.sort(function(a, b) {
    var x = a[key]; var y = b[key];
    return ((x < y) ? 1 : ((x > y) ? -1 : 0));
  });
}


Property.find({}, (err, data) => {
  const shortArray = sortByKey(data,'date').slice(0,3000);
  async.eachLimit(shortArray, PARALLEL_LIMIT, editProperty, function(err) {
    console.log('reached');
    if (err) console.log(err);
    console.log('done');
    dbSummary();
  });
});

function dbSummary() {
  let totalProperties;
  let totalFloorPlans;
  let totalSquareFeet;

  Property.count({}, (err, count) => {
    console.log(`Total unique properties in DB: ${count}`);
    totalProperties = count;
    Property.count({ floor_plan: {$exists: true, $ne: []} }, (err, count) => {
      console.log(`Total floor plans in DB: ${count}`);
      totalFloorPlans = count;
      Property.count({ squareFeet: {$exists: true} }, (err, count) => {
        console.log(`Total properties with square foot data: ${count}`);
        totalSquareFeet = count;
        const floorPlansPercent = parseInt((totalFloorPlans / totalProperties) * 100);
        const squareFeetPercent = parseInt((totalSquareFeet / totalProperties) * 100);
        const squareFeetPercentOfFloorPlans = parseInt((totalSquareFeet / totalFloorPlans) * 100);
        console.log(`Properties with floor plans: ${floorPlansPercent}%`);
        console.log(`Properties with square feet data (% of total): ${squareFeetPercent}%`);
        console.log(`Properties with square feet data (% of floor plans): ${squareFeetPercentOfFloorPlans}%`);
      });
    });
  });
}
