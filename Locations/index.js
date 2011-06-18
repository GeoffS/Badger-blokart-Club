function initialize() {
   var resetCenter = new google.maps.LatLng(43.029, -89.37);
   var resetZoom = 10;
   var resetAction = function (event) {
         map.setCenter(resetCenter);
         map.setZoom(resetZoom);
         return false;
   }

   xmlhttp = new XMLHttpRequest();
   xmlhttp.open("GET", "http://badgerblokartclub.org/Locations/Locations.xml", false);
   xmlhttp.send();
   locationsXmlDoc = xmlhttp.responseXML;

   locations = locationsXmlDoc.getElementsByTagName("location");

   var scaleOptions = {
      position: google.maps.ControlPosition.TOP_CENTER
   };

   var myOptions = {
      zoom: resetZoom,
      center: resetCenter,
      mapTypeId: google.maps.MapTypeId.SATELLITE,
      scaleControl: true,
      scaleControlOptions: scaleOptions
   };

   var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

   var resetLink = document.getElementById("resetLink");
   resetLink.onclick = resetAction;

   for each(var item in locations) processLocationXml(item);

   function processLocationXml(item) {
      var attributes = item.attributes;
      
      var name = attributes.getNamedItem("name").value;
      var lat  = parseFloat(attributes.getNamedItem("lat").value);
      var lng  = parseFloat(attributes.getNamedItem("lng").value);
      var mapCtrLat = attributes.getNamedItem("mapCtrLat");
      if(mapCtrLat != null){
         mapCtrLat = parseFloat(mapCtrLat.value);
      } else {
         mapCtrLat = lat;
      }
      var mapCtrLng = attributes.getNamedItem("mapCtrLng");
      if(mapCtrLng != null){
         mapCtrLng = parseFloat(mapCtrLng.value);
      } else {
         mapCtrLng = lng;
      }
      var zoom = parseInt(attributes.getNamedItem("zoom").value);
      var loc = new Location(name, lat, lng, mapCtrLat, mapCtrLng, zoom);
      
      add_li(loc);
      makeMarker(loc, map);
   };

   function Location(name, lat, lng, mapCtrLat, mapCtrLng, zoom) {
      this.name = name;
      this.latlng = new google.maps.LatLng(lat, lng);
      this.mapCtr = new google.maps.LatLng(mapCtrLat, mapCtrLng);
      this.zoom = zoom;
      this.action = makeLocationAction(this);
   }

   function makeMarker(location, map) {
      var marker = new google.maps.Marker({
         position: location.latlng,
         map: map,
         title: location.name
      });

      google.maps.event.addListener(marker, 'click', location.action);
      return marker;
   }

   function makeLocationAction(location) {
      var mapCtr = location.mapCtr;
      var zoom = location.zoom;
      return function doSomething(event) {
         map.setCenter(mapCtr);
         map.setZoom(zoom);
         return false;
      }
   }

   function add_li(location) {
      var list = document.getElementById("locationList");

      var a = document.createElement('a');
      a.setAttribute('href', 'noscript.html');
      a.onclick = location.action;
      a.innerHTML = location.name;

      var li = document.createElement("li");
      li.insertBefore(a, null);
      list.appendChild(li);
   }
}