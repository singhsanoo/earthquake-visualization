let myMap = L.map("map", {
  center: [37.7749, -110.4194],
  zoom: 5,
});

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(myMap);

let topo = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
  attribution:
    'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
});

let url =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

d3.json(url).then(function (response) {
  for (let i = 0; i < response.features.length; i++) {
    let location = response.features[i];
    let magnitude = response.features[i].properties.mag;

    console.log(magnitude);

    if (location) {
      L.circle(
        [location.geometry.coordinates[1], location.geometry.coordinates[0]],
        {
          radius: magnitude * 15000,
          fillColor: getColor(location.geometry.coordinates[2]),
          color: "black",
          fillOpacity: 0.8,
        }
      ).addTo(myMap);
    }
  }
});

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
