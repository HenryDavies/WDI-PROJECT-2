const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  short_description: { type: String, required: true },
  price: { type: Number, required: true },
  lat: { type: String, required: true },
  lng: { type: String, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Property', propertySchema);
