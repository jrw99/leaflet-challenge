
// function that will give each marker a different radius based the magnitude of the earthquake.
// negaitve magnitudes need to be dealt with but for now just set them to 0 so no errors occur...
function markerSize(magnitude) {  
  if (magnitude < 0) return 0;
  let size = Math.sqrt(magnitude) * 25000;
  return size;
}

// function to determine the colour based on the depth coordinate
function markerColour(depth) {
  var colour = "";
  if (depth <= 10) {
    colour = '#a3f600';
  }
  else if (depth >= 10 && depth <= 30) {
    colour = '#dcf400';
  }
  else if (depth >= 30 && depth <= 50) {
    colour = '#f7db11';
  }
  else if (depth >= 50 && depth <= 70) {
    colour = '#fdb72a';
  }
  else if (depth >= 70 && depth <= 90) {
    colour = '#fca35d';
  }
  else if (depth >= 90) {
    colour = '#ff5f65';
  }
  return colour;
}

// Marker arrays
var equakeMarkers = [];
var tplatesMarkers = [];

// Level 1 - earthquake data
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data_equake) {

  // Level 2 - tectonic data - fetching it once we get the data for level 1 so we can process it all once we have it all...
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json").then(function (data_tectonic) {

    // Loop through the earthquake data, and create the quake markers based on magnitude for size and depth for colour.
    for (var i = 0; i < data_equake.features.length; i++) {

      var magnitude = data_equake.features[i].properties.mag;
      var depth = data_equake.features[i].geometry.coordinates[2];     

      equakeMarkers.push(
        L.circle([data_equake.features[i].geometry.coordinates[1], data_equake.features[i].geometry.coordinates[0]], {
          stroke: true,
          weight: 1,
          fillOpacity: 0.5,
          color: "black",
          fillColor: markerColour(depth),
          radius: markerSize(magnitude)
        }).bindPopup(`<h1>${data_equake.features[i].properties.type}</h1> <hr><h3>Place: ${data_equake.features[i].properties.place}</h3> <h3>Magnitude: ${data_equake.features[i].properties.mag}</h3>`)
      );
    }

    for (var i = 0; i < data_tectonic.features.length; i++) {
       tplatesMarkers.push(
         L.polygon([data_tectonic.features[i].geometry.coordinates])
       );
    }

    // Create the base layers.
    var satelite = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // var grayscale = L.tileLayer('https://{s}tiles.wmflabs.org/bw-mapnik/${z}/${x}/${y}.png', {
    // 	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    // });

    // var outdoors = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    // 	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    // });

    // Create two separate layer groups: one for the eqrthqyuake markers and another for the tectonic markers.
    var equakes = L.layerGroup(equakeMarkers);
    var tplates = L.layerGroup(tplatesMarkers);    

    // Create a baseMaps object.
    var baseMaps = {
      "Satelite": satelite
      // "Grayscale": grayscale,
      // "Outdoors": outdoors
    };

    // Create an overlay object.
    var overlayMaps = {
      "Earthquakes": equakes,
      "Tectonic Plates": tplates
    };

    // Define a map object.
    var myMap = L.map("map", {
      center: [38.57, -121.47],
      zoom: 5,
      layers: [satelite, equakes, tplates]
      //layers: [satelite, grayscale, outdoors, equakes, tplates]
    });

    // Pass the map layers to a layer control and add the layer control to the map.
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

    // Set up the legend.
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
      var div = L.DomUtil.create("div", "info legend");
      var ranges = ['-10-10', '10-30', '30-50', '50-70', '70-90', '90+'];
      var colors = ['#a3f600', '#dcf400', '#f7db11', '#fdb72a', '#fca35d', '#ff5f65']
      var labels = [];    

      ranges.forEach(function(range, index) {
        labels.push("<li><div style=\"background-color: " + colors[index] + "\"></div> "+ranges[index]+"</li>");
      });

      div.innerHTML += "<ul>" + labels.join("") + "</ul>";
      return div;
    };

    // Adding the legend to the map
    legend.addTo(myMap);

  });
});