const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  short_description: { type: String },
  price: { type: String, required: true },
  latitude: { type: String, required: true },
  longitude: { type: String, required: true },
  listing_id: { type: String },
  displayable_address: { type: String, required: true },
  num_bedrooms: { type: String, required: true },
  num_bathrooms: { type: String},
  property_type: { type: String},
  image_80_60_url: { type: String},
  details_url: { type: String, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Property', propertySchema);
