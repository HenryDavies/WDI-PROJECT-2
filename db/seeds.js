const vision = require('@google-cloud/vision')({
  projectId: 'image-scraping',
  keyFilename: 'Image-scraping-5d9b95a7812f.json'
});

const mongoose = require('mongoose');
const config = require('../config/config');
const databaseUrl = config.db;
const Property = require('../models/property');
const rp = require('request-promise');

mongoose.connect(databaseUrl);

Property.collection.drop();

var options = {
  uri: 'http://api.zoopla.co.uk/api/v1/property_listings.js?area=London&order_by=age&page_size=100&page_number=1&listing_status=sale&api_key=gfya4wfdf8ypa8xemktvhx6h',
  headers: {
    'User-Agent': 'Request-Promise'
  },
  json: true // Automatically parses the JSON string in the response
};

rp(options)
.then(data => {
  for (var i in data.listing) {
    Property.create(data.listing[i], (err, listing) => {
      if (err) return console.log(err);
      // return console.log(`${listing.listing_id} saved`);
    });
  }
  console.log(`Total of ${i} saved`);
})
.catch(err => {
  console.log(err);
});

vision.detectText('floorplantest.jpg', function(err, text, apiResponse) {
  console.log(text);
});







// const property1 = new Property({
//   short_description: 'This is a test house',
//   price: 349995,
//   lat: '51.55468',
//   lng: '0.131565'
// });
//
// const property2 = new Property({
//   short_description: 'This is a SECOND test house',
//   price: 1799000,
//   lat: '51.523342',
//   lng: '-0.185542'
// });
//
// property1.save(err => {
//   if (err) return console.log(err);
//   return console.log('Property was saved');
// });
//
// property2.save(err => {
//   if (err) return console.log(err);
//   return console.log('Property was saved');
// });


// const propertySchema = new mongoose.Schema({
//   short_description: { type: String, required: true },
//   price: { type: Number, required: true },
//   lat: { type: String, required: true },
//   lng: { type: String, required: true }
// }, {
//   timestamps: true
// });
