let url =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Define letiables for our tile layers.
let street = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
});

let topo = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
  attribution:
    'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
});

let googleSat = L.tileLayer(
  "http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
  {
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
  }
);

// Only one base layer can be shown at a time.
let baseMaps = {
  Street: street,
  Topography: topo,
  Satellite: googleSat,
};

// Tectonic Plates
let t_url =
  "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

let myStyle = {
  color: "#FC4E2A",
  weight: 5,
  stroke: true,
  opacity: 1,
};

let tectonicLayer = L.geoJSON();

d3.json(t_url).then(function (t_response) {
  tectonicLayer.addData(t_response);
  tectonicLayer.setStyle(myStyle);
});

// Optional if reading geoJson data from save file
// let tectonicLayer;
// $.getJSON("static/data/tectonic_boundaries.json", function (data) {
//   console.log(data);
//   tectonicLayer = L.geoJSON(data, { style: myStyle });
// });

function getColor(d) {
  return d > 90
    ? "#E31A1C"
    : d > 70
    ? "#FC4E2A"
    : d > 50
    ? "#FD8D3C"
    : d > 30
    ? "#FEB24C"
    : d > 10
    ? "#FFE92B"
    : "#8EFF2B";
}

let placeMarkers = [];
d3.json(url).then(function (response) {
  for (let i = 0; i < response.features.length; i++) {
    let location = response.features[i];
    let magnitude = response.features[i].properties.mag;
    let place = response.features[i].properties.place;
    let depth = location.geometry.coordinates[2];

    // console.log(magnitude);

    if (location) {
      placeMarkers.push(
        L.circle(
          [location.geometry.coordinates[1], location.geometry.coordinates[0]],
          {
            radius: magnitude * 15000,
            fillColor: getColor(depth),
            color: "black",
            fillOpacity: 0.8,
          }
        )
          // .addTo(myMap)
          .bindPopup(
            `<b>Location:</b> ${place} <hr> <b>Magnitude:</b> ${magnitude} <br> <b>Depth:</b> ${depth}`
          )
      );
    }
  }

  let earthquakeLayer = L.layerGroup(placeMarkers);

  console.log(placeMarkers);

  // Overlays that can be toggled on or off
  let overlayMaps = {
    Earthquakes: earthquakeLayer,
    "Tectonic Plates": tectonicLayer,
  };

  // Create a map object, and set the default layers.
  let myMap = L.map("map", {
    center: [30, -80],
    zoom: 4,
    layers: [street, earthquakeLayer],
  });

  // Pass our map layers into our layer control.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(myMap);

  let legend = L.control({ position: "bottomright" });

  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");
    let depth = [-10, 10, 30, 50, 70, 90];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (let i = 0; i < depth.length; i++) {
      div.innerHTML +=
        '<i style="background:' +
        getColor(depth[i] + 1) +
        '"></i> ' +
        depth[i] +
        (depth[i + 1] ? "&ndash;" + depth[i + 1] + "<br>" : "+");
    }

    return div;
  };

  legend.addTo(myMap);
});
