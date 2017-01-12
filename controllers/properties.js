const Property = require('../models/property');

module.exports = {
  index: propertiesIndex
};

function propertiesIndex(req, res) {
  Property.find((err, properties) => {
    if (err) return res.status(500).send();
    return res.status(200).json({ properties });
  });
}
