const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  short_description: { type: String, required: true },
  price: { type: String, required: true },
  latitude: { type: String, required: true },
  longitude: { type: String, required: true },
  listing_id: { type: String, required: true },
  displayable_address: { type: String, required: true },
  num_bedrooms: { type: String, required: true },
  num_bathrooms: { type: String, required: true },
  property_type: { type: String, required: true },
  image_80_60_url: { type: String, required: true },
  details_url: { type: String, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Property', propertySchema);
