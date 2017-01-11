const googleMap = googleMap || {};
const google = google;

googleMap.mapSetup = function() {
  const canvas = document.getElementById('map-canvas');
  const mapOptions = {
    zoom: 11,
    center: new google.maps.LatLng(51.5085300,-0.1257400),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  this.map = new google.maps.Map(canvas,mapOptions);
  this.getProperties();
};

googleMap.getProperties = function() {
  $.get('http://localhost:3000/properties').done(this.loopThroughProperties);
};

googleMap.loopThroughProperties = function(data) {
  console.log(data);
  $.each(data.properties, (index, property) => {
    setTimeout(() => {
      console.log(index);
      googleMap.createMarkerForProperty(property);
    }, index*500);
  });
};

googleMap.createMarkerForProperty = function(property) {
  const latlng = new google.maps.LatLng(property.latitude, property.longitude);
  const marker = new google.maps.Marker({
    position: latlng,
    animation: google.maps.Animation.DROP,
    map: this.map
  });
  this.addInfoWindowForProperty(property, marker);
};

googleMap.addInfoWindowForProperty = function(property, marker) {
  google.maps.event.addListener(marker, 'click', () => {
    if (typeof this.infoWindow !== 'undefined') this.infoWindow.close();
    this.infoWindow = new google.maps.InfoWindow({
      content: `
        <h4>${property.num_bedrooms} bed, ${property.num_bathrooms} bath ${property.property_type}</h4>
        <p>${property.displayable_address}</p>
        <p>£${property.price}</p>
      `
    });
    this.infoWindow.open(this.map, marker);
  });
};

$(googleMap.mapSetup.bind(googleMap));

// short_description: { type: String, required: true },
// price: { type: String, required: true },
// latitude: { type: String, required: true },
// longitude: { type: String, required: true },
// listing_id: { type: String, required: true },
// displayable_address: { type: String, required: true },
// num_bedrooms: { type: String, required: true },
// num_bathrooms: { type: String, required: true },
// property_type: { type: String, required: true }
