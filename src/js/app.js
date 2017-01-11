const googleMap = googleMap || {};
const google = google;

googleMap.mapSetup = function() {
  const canvas = document.getElementById('map-canvas');
  const mapOptions = {
    zoom: 13,
    center: new google.maps.LatLng(51.523342,-0.185542),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  this.map = new google.maps.Map(canvas,mapOptions);
  this.getProperties();
};

googleMap.getProperties = function() {
  $.get('http://localhost:3000/properties').done(this.loopThroughProperties);
};

googleMap.loopThroughProperties = function(data) {
  console.log(data,data.properties);
  $.each(data.properties, (index, property) => {
    setTimeout(() => {
      console.log(index);
      googleMap.createMarkerForProperty(property);
    }, index*1000+1000);
  });
};

googleMap.createMarkerForProperty = function(property) {
  const latlng = new google.maps.LatLng(property.lat, property.lng);
  const marker = new google.maps.Marker({
    position: latlng,
    animation: google.maps.Animation.DROP,
    map: this.map
  });
  this.addInfoWindowForProperty(property, marker);
};

googleMap.addInfoWindowForProperty = function(property, marker) {
  google.maps.event.addListener(marker, 'click', () => {
    this.infoWindow = new google.maps.InfoWindow({
      content: `
        <p>${property.short_description}</p>
      `
    });
    this.infoWindow.open(this.map, marker);
  });
};

$(googleMap.mapSetup.bind(googleMap));
