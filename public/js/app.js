"use strict";var googleMap=googleMap||{},google=google;googleMap.markers=[],googleMap.mapSetup=function(){$(".searchSubmit").on("click",this.getSearchLocation.bind(this)),$(".searchClear").on("click",this.clearSearch.bind(this));var o=document.getElementById("map-canvas"),e={zoom:11,center:new google.maps.LatLng(51.50853,(-.12574)),mapTypeId:google.maps.MapTypeId.ROADMAP};this.map=new google.maps.Map(o,e),this.getProperties()},googleMap.getProperties=function(){$.get("http://localhost:3000/properties").done(this.loopThroughProperties)},googleMap.loopThroughProperties=function(o){$.each(o.properties,function(o,e){setTimeout(function(){console.log(o),googleMap.createMarkerForProperty(e)},50*o)})},googleMap.createMarkerForProperty=function(o){var e=new google.maps.LatLng(o.latitude,o.longitude),a=new google.maps.Marker({position:e,animation:google.maps.Animation.DROP,map:this.map});googleMap.markers.push(a),this.addInfoWindowForProperty(o,a)},googleMap.addInfoWindowForProperty=function(o,e){var a=this;google.maps.event.addListener(e,"click",function(){"undefined"!=typeof a.infoWindow&&a.infoWindow.close(),a.infoWindow=new google.maps.InfoWindow({content:'\n        <h4 class="markerHead"><a href="'+o.details_url+'">'+o.num_bedrooms+" bed "+o.property_type+'</a></h4>\n        <img src="'+o.image_80_60_url+'">\n        <p class="address">'+o.displayable_address+'</p>\n        <p class="price">£'+parseInt(o.price).toLocaleString()+"</p>\n      "}),a.infoWindow.open(a.map,e)})},googleMap.getSearchLocation=function(o){o&&o.preventDefault();var e=!0,a=!1,r=void 0;try{for(var t,n=googleMap.markers[Symbol.iterator]();!(e=(t=n.next()).done);e=!0){var p=t.value;p.setMap(null)}}catch(o){a=!0,r=o}finally{try{!e&&n.return&&n.return()}finally{if(a)throw r}}googleMap.markers=[];var g=$(".locationForm").val(),l=1e3*parseInt($(".searchRadius").val()),i="https://maps.googleapis.com/maps/api/geocode/json?address="+g+"&bounds=0.3170,%2051.7360|-0.6553,%2051.2503&components=administrative_area:England&key=AIzaSyAzPfoyVbxG2oz378kpMkMszn2XtZn-1SU";$.get(i).done(function(o){var e=o.results[0].geometry.location.lat,a=o.results[0].geometry.location.lng,r=new google.maps.LatLng(e,a),t=new google.maps.Marker({position:r,animation:google.maps.Animation.DROP,icon:{path:google.maps.SymbolPath.CIRCLE,scale:4},map:googleMap.map});googleMap.markers.push(t),googleMap.searchCircle=new google.maps.Circle({strokeColor:"#FF0000",strokeOpacity:.8,strokeWeight:2,fillColor:"#FF0000",fillOpacity:.15,map:googleMap.map,center:r,radius:l})})},googleMap.clearSearch=function(o){o&&o.preventDefault(),$(".locationForm").val(""),$(".searchRadius").val("Radius"),googleMap.markers[googleMap.markers.length-1].setMap(null),googleMap.markers.pop(),googleMap.searchCircle.setMap(null),this.getProperties()},$(googleMap.mapSetup.bind(googleMap));