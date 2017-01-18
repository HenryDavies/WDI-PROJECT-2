
const mongoose = require('mongoose');
const config = require('../config/config');
const databaseUrl = config.db;
const Property = require('../models/property');

mongoose.connect(databaseUrl);

// Compare square feets
//
// Property.find({}, (err, data) => {
//   let parseCount = 0;
//   let scrapeCount = 0;
//   let parseScrapeCount = 0;
//   data.forEach((listing, index) => {
//     if (listing.squareFeet && listing.scrapeSquareFeet !== 'NA') {
//       parseCount++;
//       scrapeCount++;
//       parseScrapeCount++;
//     } else if (listing.squareFeet) parseCount++;
//     else if (listing.scrapeSquareFeet !== 'NA') {
//       scrapeCount++;
//     }
//   });
//   console.log(`Parse count: ${parseCount}`);
//   console.log(`Scrape count: ${scrapeCount}`);
//   console.log(`Properties with parse & scrape data: ${parseScrapeCount}`);
//   console.log(`Properties with either data: ${parseCount+scrapeCount-parseScrapeCount}`);
// });


let counterPrices = 0;


// SET PRICES PER SQUARE FOOT
//
// Property.find({}, (err, data) => {
//   data.forEach((listing, index) => {
//     if (listing.floor_plan[0] && listing.floor_plan[0] !== undefined) {
//       if (listing.price / listing.squareFeet) {
//         listing.pricePerSquareFoot = listing.price / listing.squareFeet;
//         console.log(listing.pricePerSquareFoot);
//         Property.create(listing, (err, listing) => {
//           if (err) return console.log(err);
//           counterPrices++;
//           return console.log(`${listing.listing_id} saved, ${counterPrices}`);
//         });
//       } else {
//         listing.pricePerSquareFoot = 'NA';
//         Property.create(listing, (err, listing) => {
//           if (err) return console.log(err);
//           counterPrices++;
//           return console.log(`${listing.listing_id} saved, ${counterPrices}`);
//         });
//       }
//     }
//   });
//   dbSummary();
// });
//
// function dbSummary() {
//   let totalProperties;
//   let totalFloorPlans;
//   let totalSquareFeet;
//
//   Property.count({}, (err, count) => {
//     console.log(`Total unique properties in DB: ${count}`);
//     totalProperties = count;
//     Property.count({ floor_plan: {$exists: true, $ne: []} }, (err, count) => {
//       console.log(`Total floor plans in DB: ${count}`);
//       totalFloorPlans = count;
//       Property.count({ squareFeet: {$exists: true} }, (err, count) => {
//         console.log(`Total properties with square foot data: ${count}`);
//         totalSquareFeet = count;
//         let floorPlansPercent = parseInt((totalFloorPlans / totalProperties) * 100);
//         let squareFeetPercent = parseInt((totalSquareFeet / totalProperties) * 100);
//         let squareFeetPercentOfFloorPlans = parseInt((totalSquareFeet / totalFloorPlans) * 100);
//         console.log(`Properties with floor plans: ${floorPlansPercent}%`);
//         console.log(`Properties with square feet data (% of total): ${squareFeetPercent}%`);
//         console.log(`Properties with square feet data (% of floor plans): ${squareFeetPercentOfFloorPlans}%`);
//       });
//     });
//   });
// }


// function updatedToday(date) {
//   return date >= Date.parse('2017-01-17 00:00:00');
// }
//
