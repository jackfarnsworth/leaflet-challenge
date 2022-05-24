
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

d3.json(queryUrl).then(function (data) {
  console.log(data.features);
  let earthquakeData = data.features;
  makemap(earthquakeData);
});

function colors(depth){
  if (depth > 90)
      return "red";
  else if (depth > 70)
      return "#f57402";
  else if (depth > 50)
      return "#ffc60a";
  else if (depth > 30)
      return "#fcf517";
  else if (depth > 10)
      return "#e5fc35";
  else 
      return "#69f702";
}

function popups(feature, layer)
{
    layer.bindPopup(`<h2>${feature.properties.place}</h2>
                    <hr>
                    <p>${new Date(feature.properties.time)}</p>
                    <hr>
                    <b>Magnitude: </b> ${feature.properties.mag}<br>
                    <b>Depth: </b> ${feature.geometry.coordinates[2]}`);
}

function radius(magnitude)
{
    if (magnitude < 1)
      return 1;
    else
      return (2 ** magnitude + 1);
}

function style(feature)
{
  return {
    opacity: 0.75,
    fillOpacity: 0.75,
    fillColor: colors(feature.geometry.coordinates[2]),
    color: "000000",
    radius: radius(feature.properties.mag),
    weight: 1
  }
}

function makemap(earthquakeData) {
  var earthquakes = L.geoJSON(earthquakeData,
    {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: style,
        onEachFeature: popups
    });

  var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  });
  var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  var baseMaps = {
    "Globe Map": Esri_WorldImagery,
    "Topographic Map": topo
  };

  var overlays = {
    "Earthquakes": earthquakes
  }

  var myMap = L.map("map", {
    center: [
      35, -90
    ],
    zoom: 3,
    layers: [Esri_WorldImagery, earthquakes]
  });

  L.control.layers(baseMaps, overlays, {
    collapsed: false
  }).addTo(myMap);

var legend = L.control({position:"bottomright"});
legend.onAdd=function(map) { 
  var div = L.DomUtil.create("div","info legend")

  var depth = [0,30,50,70,90];

  div.innerHTML += `<h4> Depth Legend <h4>`
  for (var i = 0; i < depth.length; i++) {
    div.innerHTML += `<i style="background:` + colors(depth[i] + 1) + `"></i> ` + depth[i] + (depth[i + 1] ? `&ndash;` + depth[i + 1] + `<br>` : `+`);
    }
 
  return div
}

legend.addTo(myMap)
}