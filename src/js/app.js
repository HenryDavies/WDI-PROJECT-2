const googleMap = googleMap || {};
const google = google;
googleMap.markers = [];

google.maps.Circle.prototype.contains = function(latLng) {
  return this.getBounds().contains(latLng) && google.maps.geometry.spherical.computeDistanceBetween(this.getCenter(), latLng) <= this.getRadius();
};

googleMap.mapSetup = function() {
  $('.searchSubmit').on('click', this.getSearchLocation.bind(this));
  $('.searchClear').on('click', this.clearSearch.bind(this));
  const canvas = document.getElementById('map-canvas');
  const mapOptions = {
    zoom: 11,
    center: new google.maps.LatLng(51.5085300,-0.1257400),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  this.map = new google.maps.Map(canvas,mapOptions);
  this.getProperties();
};

googleMap.getProperties = function(circle) {
  return $.get('http://localhost:3000/properties').done(data => {
    const searchProperties = data.properties.filter(function(property) {
      const latlng = new google.maps.LatLng(property.latitude, property.longitude);
      const inCircle = circle ? circle.contains(latlng) : true;
      const bedrooms = (property.num_bedrooms === $('.searchBedrooms').val()
      || (property.num_bedrooms === 1 && $('.searchBedrooms').val() === 'Studio') || (property.num_bedrooms >= 4 && $('.searchBedrooms').val() === '4+') || $('.searchBedrooms').val() === 'Bedrooms');
      function removeSeparator(x) {
        return parseInt(x.split(',').join(''));
      }
      const price = removeSeparator(property.price);
      const minPrice = removeSeparator($('.minPrice').val());
      const maxPrice = removeSeparator($('.maxPrice').val());
      const inValueRange = ((price >= minPrice || isNaN(minPrice)) && (price <= maxPrice || isNaN(maxPrice)));
      return (inCircle && bedrooms && inValueRange);
    });
    this.loopThroughProperties(searchProperties);
  });
};


googleMap.loopThroughProperties = function(data) {
  $.each(data, (index, property) => {
    setTimeout(() => {
      googleMap.createMarkerForProperty(property);
    }, index*50);
  });
};

googleMap.createMarkerForProperty = function(property) {
  const latlng = new google.maps.LatLng(property.latitude, property.longitude);
  const marker = new google.maps.Marker({
    position: latlng,
    animation: google.maps.Animation.DROP,
    map: this.map
  });
  googleMap.markers.push(marker);
  this.addInfoWindowForProperty(property, marker);
};

googleMap.addInfoWindowForProperty = function(property, marker) {
  google.maps.event.addListener(marker, 'click', () => {
    if (typeof this.infoWindow !== 'undefined') this.infoWindow.close();
    this.infoWindow = new google.maps.InfoWindow({
      content: `
        <h4 class="markerHead"><a href="${property.details_url}">${property.num_bedrooms} bed ${property.property_type}</a></h4>
        <img src="${property.image_80_60_url || ''}">
        <p class="address">${property.displayable_address}</p>
        <p class="price">£${parseInt(property.price).toLocaleString()}</p>
      `
    });
    this.infoWindow.open(this.map, marker);
  });
};

googleMap.getSearchLocation = function(e) {
  if (e) e.preventDefault();
  for (const marker of googleMap.markers) {
    marker.setMap(null);
  }
  googleMap.markers = [];
  const searchAddress = $('.locationForm').val();
  const searchRadius = parseInt($('.searchRadius').val())*1000 || 2500;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${searchAddress}&bounds=0.3170,%2051.7360|-0.6553,%2051.2503&components=administrative_area:England&key=AIzaSyAzPfoyVbxG2oz378kpMkMszn2XtZn-1SU`;
  if (searchAddress) {
    $.get(url)
    .done(function(data){
      const lat = data.results[0].geometry.location.lat;
      const lng = data.results[0].geometry.location.lng;
      const latlng = new google.maps.LatLng(lat,lng);
      const marker = new google.maps.Marker({
        position: latlng,
        animation: google.maps.Animation.DROP,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 4
        },
        map: googleMap.map
      });
      googleMap.markers.push(marker);
      googleMap.searchCircle = new google.maps.Circle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.15,
        map: googleMap.map,
        center: latlng,
        radius: searchRadius
      });
      googleMap.getProperties(googleMap.searchCircle);
    });
  } else googleMap.getProperties();
};

googleMap.clearSearch = function(e) {
  if (e) e.preventDefault();
  $('.locationForm').val('');
  $('.searchRadius').val('Radius');
  $('.minPrice').val('Min price');
  $('.maxPrice').val('Max price');
  for (const marker of googleMap.markers) {
    marker.setMap(null);
  }
  googleMap.markers = [];
  googleMap.searchCircle.setMap(null);
  this.getProperties();
};





$(googleMap.mapSetup.bind(googleMap));
