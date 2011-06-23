function initialize() {
   var baseURL = getBaseURL();
   var basePath = window.location.pathname;
   var initLocId=getLocationFromURL();
   
   var htmlTitle = document.title;
   var areaTitle = "Region View";
   
   var resetCenter = new google.maps.LatLng(43.029, -89.37);
   var resetZoom = 10;
   
   var resetAction = function (event) {
         map.setCenter(resetCenter);
         map.setZoom(resetZoom);
         document.title = htmlTitle;
         window.location.hash = null;
         setMapTitle(areaTitle);
         resetLink.href = basePath+"#";
         return false;
   };
   
   if (window.XMLHttpRequest)
   {// code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp=new XMLHttpRequest();
   }
   else
   {// code for IE6, IE5
      xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
   }
   
   try {
      xmlhttp.open("GET", "http://badgerblokartclub.org/Locations/Locations.xml", false);
      xmlhttp.send();
      locationsXmlDoc = xmlhttp.responseXML;
   }
   catch(e) {
      alert("Can't Load File From Host - using built-in locations list.");
      var txt='<locations>';
      txt=txt+'   <location id="matc" name="MATC Lot" latLng="43.12274, -89.33206" mapCtrLatLng="43.12178, -89.3325" zoom="17" />';
      txt=txt+'   <location id="dmv" name="DMV Lot" latLng="43.07407, -89.45797" zoom="18" />';
      txt=txt+'   <location id="cub" name="Cub Lot" latLng="43.03410, -89.45851" zoom="18" />';
      txt=txt+'   <location id="uw" name="UW Health Lot" latLng="43.10335, -89.52278" mapCtrLatLng="43.1027, -89.52245" zoom="18" />';
      txt=txt+'   <location id="costco" name="Costco Lot" latLng="43.10094, -89.52262" zoom="18" />';
      txt=txt+'   <location id="edgerton" name="Edgerton Lot" latLng="42.83733, -89.08878" zoom="17" />';
      txt=txt+'   <location id="wps" name="WPS Lot" latLng="43.04494, -89.34380" zoom="18" />';
      txt=txt+'</locations>';
      
      parser=new DOMParser();
      locationsXmlDoc=parser.parseFromString(txt,"text/xml");
   }
   
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
   resetLink.href = basePath+"#";
   
   // Null-Object pattern.
   // Action to perform if there is no initLoc from the URL.
   var initLoc = {
      action: resetAction
   };

   var len=locations.length;
   for(var i=0; i<len; i++) {
   	var item = locations[i];
   	processLocationXml(item);
   }
   
   initLoc.action();
   
   //VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV
   // Just function definitions below...
   
   // Side-effect warning: sets the global variable; initLoc
   function processLocationXml(item) {
      var attributes = item.attributes;
      
      var id = attributes.getNamedItem("id").value;
      var name = attributes.getNamedItem("name").value;
      var latLng = makeLatLng(attributes.getNamedItem("latLng").value);
      var mapCtrLatLngElm  = attributes.getNamedItem("mapCtrLatLng");
      if(mapCtrLatLngElm != null){
         mapCtrLatLng = makeLatLng(mapCtrLatLngElm.value);
      } else {
         mapCtrLatLng = latLng;
      }
      var zoom = parseInt(attributes.getNamedItem("zoom").value);
      var loc = new Location(id, name, latLng, mapCtrLatLng, zoom);
      
      add_li(loc);
      makeMarker(loc, map);
      
      if(initLocId == id) {
         initLoc = loc;
      }
   };
   
   function makeLatLng( latLngStr ) {
      latLngArr = latLngStr.split(',');
      var latLng = new google.maps.LatLng(parseFloat(latLngArr[0]), parseFloat(latLngArr[1]));
      return latLng;
   }

   function Location(id, name, latLng, mapCtrLatLng, zoom) {
      this.id = id;
      this.name = name;
      this.latlng = latLng;
      this.mapCtr = mapCtrLatLng;
      this.zoom = zoom;
      this.path = basePath+"#"+this.id;
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
         document.title = htmlTitle+": "+location.name;
         window.location.hash = location.id;
         setMapTitle(location.name);
         return false;
      }
   }

   function add_li(location) {
      var list = document.getElementById("locationList");

      var a = document.createElement('a');
      a.setAttribute('href', location.path);
      a.onclick = location.action;
      a.innerHTML = location.name;

      var li = document.createElement("li");
      li.insertBefore(a, null);
      list.appendChild(li);
   }
   
   function getLocationFromURL(){
      return window.location.hash.substring(1);
   }
   
   function getBaseURL() {
         var query = window.location.href;
         var vars = query.split("#");
         return vars[0];
   }
   
   function setMapTitle(title) {
      var mapTitle = document.getElementById("mapTitle");
      mapTitle.innerHTML = title+":";
   }
}