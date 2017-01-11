const mongoose = require('mongoose');
const config = require('../config/config');
const databaseUrl = config.db;
const Property = require('../models/property');

mongoose.connect(databaseUrl);

Property.colleciton.drop();

const property1 = new Property({
  short_description: 'This is a test house',
  price: 349995,
  lat: '51.55468',
  lng: '0.131565'
});

const property2 = new Property({
  short_description: 'This is a SECOND test house',
  price: 1799000,
  lat: '51.523342',
  lng: '-0.185542'
});

property1.save(err => {
  if (err) return console.log(err);
  return console.log('Property was saved');
});

property2.save(err => {
  if (err) return console.log(err);
  return console.log('Property was saved');
});


// const propertySchema = new mongoose.Schema({
//   short_description: { type: String, required: true },
//   price: { type: Number, required: true },
//   lat: { type: String, required: true },
//   lng: { type: String, required: true }
// }, {
//   timestamps: true
// });
