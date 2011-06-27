function initialize() {
   var baseURL = getBaseURL();
   var basePath = window.location.pathname;
   var initLocId=getLocationFromURL();
   var selector = document.getElementById("locationSelect")
   
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
      //alert("WARNING: Can't Load File From Host - using built-in locations list.");
      var txt='<regions>';
      txt=txt+'   <region id="bbc" name="Badger blokart® Club" latLng="43.029, -89.37" zoom="10" >';
      txt=txt+'      <locations>';
      txt=txt+'         <location id="matc" name="MATC Lot" latLng="43.12274, -89.33206" mapCtrLatLng="43.12178, -89.3325" zoom="17" />';
      txt=txt+'         <location id="dmv" name="DMV Lot" latLng="43.07407, -89.45797" zoom="18" />';
      txt=txt+'         <location id="cub" name="Cub Lot" latLng="43.03410, -89.45851" zoom="18" />';
      txt=txt+'         <location id="uw" name="UW Health Lot" latLng="43.10335, -89.52278" mapCtrLatLng="43.1027, -89.52245" zoom="18" />';
      txt=txt+'         <location id="costco" name="Costco Lot" latLng="43.10094, -89.52262" zoom="18" />';
      txt=txt+'         <location id="edgerton" name="Edgerton Lot" latLng="42.83733, -89.08878" zoom="17" />';
      txt=txt+'         <location id="wps" name="WPS Lot" latLng="43.04494, -89.34380" zoom="18" />';
      txt=txt+'      </locations>';
      txt=txt+'   </region>';
      txt=txt+'</regions>';
      
      parser=new DOMParser();
      locationsXmlDoc=parser.parseFromString(txt,"text/xml");
   }
   
   regions = locationsXmlDoc.getElementsByTagName("region");
   regionElem = regions[0];
   locationElems = regionElem.getElementsByTagName("location");

   var map = makeMap();
   
   var region = makeLocationFromXml(null, regionElem, 0);
   
   var len=locationElems.length;
   var locations = new Array(len);
   for(var i=0; i<len; i++) {
      var item = locationElems[i];
      var loc = makeLocationFromXml(region, item, i+1);
      locations[i] = loc;
   }
   
   region.locations = locations;
   
   var resetLink = document.getElementById("resetLink");
   modifyLocationLink(resetLink, region);
   resetLink.innerHTML = resetLink.innerHTML+" Area:";
   
   // Null-Object pattern.
   // Action to perform if there is no initLoc from the URL.
   var initLoc = {
      id: "Initial",
      action: region.action
   };

   initSelector(region);
   var len = region.locations.length;
   for(var i=0; i<len; i++) {
   	var loc = region.locations[i];
   	
   	updateInitLoc(loc);
   	add_li(loc);
	add_sel(i, loc);
        makeMarker(loc, map);
   }
   initLoc.action();
   
   //VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV
   // Just function definitions below...
   
   function makeMap() {
      var scaleOptions = {
         position: google.maps.ControlPosition.TOP_CENTER
      };
      
      var myOptions = {
         zoom: 4,
         center: new google.maps.LatLng(40.0, -99.0),
         mapTypeId: google.maps.MapTypeId.SATELLITE,
         scaleControl: true,
         scaleControlOptions: scaleOptions
      };
      
      return new google.maps.Map(document.getElementById("map_canvas"), myOptions);
   }
   
   function makeLocationFromXml(region, item, selectorIndex){
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
      return new Location(region, id, name, latLng, mapCtrLatLng, zoom, selectorIndex);
   };
      
   // Side-Effect Warning: Updates global var initLoc!
   function updateInitLoc(loc) {
      if(initLocId == loc.id) {
         initLoc = loc;
      }
   };
   
   function makeLatLng( latLngStr ) {
      latLngArr = latLngStr.split(',');
      var latLng = new google.maps.LatLng(parseFloat(latLngArr[0]), parseFloat(latLngArr[1]));
      return latLng;
   }

   function Location(region, id, name, latLng, mapCtrLatLng, zoom, selectorIndex) {
      this.name = name;
      this.latlng = latLng;
      this.mapCtr = mapCtrLatLng;
      this.zoom = zoom;
      this.selectorIndex = selectorIndex;
      
      this.region = region;
      
      if(region == null) {
         // The location is the region:
         this.id = id;
         this.title = "The "+this.name+" Sailing Locations";
      } else {
         this.id = region.id+"."+id;
         this.title = "The "+region.name+" Sailing Locations: "+this.name;
      }
      
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
         document.title = location.title;
         window.location.hash = location.id;
         setMapTitle(location.name);
         selector.selectedIndex = location.selectorIndex;
         return false;
      }
   }
   
   function modifyLocationLink(a, location) {
      a.setAttribute('href', location.path);
      a.onclick = location.action;
      a.innerHTML = location.name;
   }

   function add_li(location) {
      var list = document.getElementById("locationList");

      var a = document.createElement('a');
      modifyLocationLink(a, location);

      var li = document.createElement("li");
      li.insertBefore(a, null);
      list.appendChild(li);
   }
   
   function initSelector(region) {
      var numOptions = locations.length+1;
      selector.options = new Array(numOptions);
      selector.actions = new Array(numOptions);
      
      selector.options[0] = new Option("Select a Location");
      selector.actions[0] = region.action;
      
      selector.onchange = function() {
         this.actions[this.selectedIndex]();
      };
   }
   
   function add_sel(index, location) {
      var opt = document.createElement('option');
      opt.text = location.name;
      selector.options[index+1] = opt;
      selector.actions[index+1] = location.action;
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