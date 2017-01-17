
const mongoose = require('mongoose');
const config = require('../config/config');
const databaseUrl = config.db;
const Property = require('../models/property');

let counterPrices = 0;

mongoose.connect(databaseUrl);




// SET PRICES PER SQUARE FOOT
//
Property.find({}, (err, data) => {
  data.forEach((listing, index) => {
    if (listing.floor_plan[0] && listing.floor_plan[0] !== undefined) {
      if (listing.price / listing.squareFeet) {
        listing.pricePerSquareFoot = listing.price / listing.squareFeet;
        console.log(listing.pricePerSquareFoot);
        Property.create(listing, (err, listing) => {
          if (err) return console.log(err);
          counterPrices++;
          return console.log(`${listing.listing_id} saved, ${counterPrices}`);
        });
      } else {
        listing.pricePerSquareFoot = 'NA';
        Property.create(listing, (err, listing) => {
          if (err) return console.log(err);
          counterPrices++;
          return console.log(`${listing.listing_id} saved, ${counterPrices}`);
        });
      }
    }
  });
  dbSummary();
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
        let floorPlansPercent = parseInt((totalFloorPlans / totalProperties) * 100);
        let squareFeetPercent = parseInt((totalSquareFeet / totalProperties) * 100);
        let squareFeetPercentOfFloorPlans = parseInt((totalSquareFeet / totalFloorPlans) * 100);
        console.log(`Properties with floor plans: ${floorPlansPercent}%`);
        console.log(`Properties with square feet data (% of total): ${squareFeetPercent}%`);
        console.log(`Properties with square feet data (% of floor plans): ${squareFeetPercentOfFloorPlans}%`);
      });
    });
  });
}
