
// function that will give each marker a different radius based the magnitude of the earthquake.
function markerSize(magnitude) { 
  let size = magnitude * 15000;
  return size;
}

// function to determine the colour based on the depth coordinate
function markerColour(depth) {
  let colour = "";
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

// Marker array
let equakeMarkers = [];

// Level 1 - earthquake data
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data_equake) {

  // Loop through the earthquake data, and create the quake markers based on magnitude for size and depth for colour.
  for (let i = 0; i < data_equake.features.length; i++) {

    let magnitude = data_equake.features[i].properties.mag;
    let depth = data_equake.features[i].geometry.coordinates[2];     

    equakeMarkers.push(
      L.circle([data_equake.features[i].geometry.coordinates[1], data_equake.features[i].geometry.coordinates[0]], {
        stroke: true,
        weight: 1,
        fillOpacity: 0.5,
        color: "black",
        fillColor: markerColour(depth),
        radius: markerSize(magnitude)
      }).bindPopup(`<h1>${data_equake.features[i].properties.type}</h1> <hr><h3>Place: ${data_equake.features[i].properties.place}</h3> <h3>Magnitude: ${magnitude}</h3> <h3>Depth: ${depth}</h3>`)
    );
  }  

  // Create base layers.
  let grayscale = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: 'mapbox/light-v10',
      accessToken: API_KEY
  });

  // Create layer group for earthquake markers.
  let equakes = L.layerGroup(equakeMarkers);   

  // Create baseMaps object.
  let baseMaps = {
    "Grayscale": grayscale    
  };

  // Create overlay object.
  let overlayMaps = {
    "Earthquakes": equakes   
  };

  // Define map object.
  let myMap = L.map("map", {   
    center: [38.57, -121.47],
    zoom: 5,
    layers: [grayscale, equakes]    
  });

  // Pass map layers to layer control and add layer control to map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Set up legend.
  let legend = L.control({ position: "bottomright" });
  legend.onAdd = function() {
    let div = L.DomUtil.create("div", "info legend");
    let ranges = ['-10-10', '10-30', '30-50', '50-70', '70-90', '90+'];
    let colors = ['#a3f600', '#dcf400', '#f7db11', '#fdb72a', '#fca35d', '#ff5f65']
    let labels = [];    

    ranges.forEach(function(range, index) {
      labels.push("<li><div style=\"background-color: " + colors[index] + "\"></div> "+ranges[index]+"</li>");
    });

    div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    return div;
  };

  // Add legend to map
  legend.addTo(myMap);

});