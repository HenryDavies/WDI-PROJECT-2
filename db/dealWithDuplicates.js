const mongoose = require('mongoose');
const config = require('../config/config');
const databaseUrl = config.db;
const Property = require('../models/property');

mongoose.connect(databaseUrl);

function updatedToday(date) {
  return date >= Date.parse('2017-01-17 00:00:00');
}

// descending sort
function sortByKey(array, key) {
  return array.sort(function(a, b) {
    var x = a[key]; var y = b[key];
    return ((x < y) ? 1 : ((x > y) ? -1 : 0));
  });
}

// find duplicates and delete

// Property.find({}, (err, data) => {
//   data.forEach((listing, index) => {
//     Property.count({listing_id: listing.listing_id}, (err, count) => {
//       console.log(count, updatedToday(listing.updatedAt));
//       if (count > 1 && !updatedToday(listing.updatedAt)) {
//         Property.remove(listing);
//       }
//     });
//   });
// });



// find properties that have been updated, import price history, delete older versions

Property.find({}, (err, data) => {
  data.forEach((listing, index) => {
    Property.find({listing_id: listing.listing_id}, (err, listings) => {
      // console.log(listings.length);
      // if (listings.length > 1) {
      //   console.log('duplicate');
      //   const duplicatesArray = sortByKey(listings, 'date');
      //   if (!duplicatesArray[0].priceHistory) {
      //     duplicatesArray[0].priceHistory = [];
      //   }
      //   for (let i = 1; i < duplicatesArray.length; i++) {
      //     duplicatesArray[0].priceHistory.unshift([duplicatesArray[i].price,duplicatesArray[i].first_published_date,duplicatesArray[i].last_published_date]);
      //     Property.remove(duplicatesArray[i]);
      //   }
      //   Property.update({ listing_id: duplicatesArray[0].listing_id, date: duplicatesArray[0].date }, {$set: { priceHistory: duplicatesArray[0].priceHistory }});
      // }
    });
  });
});

// COUNT TOTALS, FLOOR PLANS & SQUARE FOOT DATA

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

dbSummary();
