var map, featureList, boundarySearch = [], naturetrailSearch = [], arboretumSearch = [], nativeSearch = [];

$(window).resize(function() {
  sizeLayerControl();
});

$(document).on("click", ".feature-row", function(e) {
  $(document).off("mouseout", ".feature-row", clearHighlight);
  sidebarClick(parseInt($(this).attr("id"), 17));
});

if ( !("ontouchstart" in window) ) {
  $(document).on("mouseover", ".feature-row", function(e) {
    highlight.clearLayers().addLayer(L.circleMarker([$(this).attr("lat"), $(this).attr("lng")], highlightStyle));
  });
}

$(document).on("mouseout", ".feature-row", clearHighlight);

$("#about-btn").click(function() {
  $("#aboutModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#full-extent-btn").click(function() {
  map.fitBounds(boundaries.getBounds());
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#legend-btn").click(function() {
  $("#legendModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#login-btn").click(function() {
  $("#loginModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#list-btn").click(function() {
  animateSidebar();
  return false;
});

$("#nav-btn").click(function() {
  $(".navbar-collapse").collapse("toggle");
  return false;
});

$("#sidebar-toggle-btn").click(function() {
  animateSidebar();
  return false;
});

$("#sidebar-hide-btn").click(function() {
  animateSidebar();
  return false;
});

function animateSidebar() {
  $("#sidebar").animate({
    width: "toggle"
  }, 350, function() {
    map.invalidateSize();
  });
}

function sizeLayerControl() {
  $(".leaflet-control-layers").css("max-height", $("#map").height() - 50);
}

function clearHighlight() {
  highlight.clearLayers();
}

function sidebarClick(id) {
  var layer = markerClusters.getLayer(id);
  map.setView([layer.getLatLng().lat, layer.getLatLng().lng], 17);
  layer.fire("click");
  /* Hide sidebar and go to the map on small screens */
  if (document.body.clientWidth <= 767) {
    $("#sidebar").hide();
    map.invalidateSize();
  }
}

function syncSidebar() {
  /* Empty sidebar features */
  $("#feature-list tbody").empty();
  /* Loop through naturetrail layer and add only features which are in the map bounds */
  naturetrail.eachLayer(function (layer) {
    if (map.hasLayer(naturetrailLayer)) {
      if (map.getBounds().contains(layer.getLatLng())) {
        $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="20" height="20" src="assets/img/naturetrail.png"></td><td class="feature-name">' + layer.feature.properties.NAME + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      }
    }
  });
  /* Loop through arboretum layer and add only features which are in the map bounds */
  arboretum.eachLayer(function (layer) {
    if (map.hasLayer(arboretumLayer)) {
      if (map.getBounds().contains(layer.getLatLng())) {
        $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/tree.png"></td><td class="feature-name">' + layer.feature.properties.NAME + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      }
    }
  });
 /* Loop through native layer and add only features which are in the map bounds */
  native.eachLayer(function (layer) {
    if (map.hasLayer(nativeLayer)) {
      if (map.getBounds().contains(layer.getLatLng())) {
        $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/circle.png"></td><td class="feature-name">' + layer.feature.properties.NAME + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      }
    }
  });  
    /* Update list.js featureList */
  featureList = new List("features", {
    valueNames: ["feature-name"]
  });
  featureList.sort("feature-name", {
    order: "asc"
  });
}

/* Basemap Layers */
var cartoLight = L.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png", {
  maxZoom: 26,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://cartodb.com/attributions">CartoDB</a>'
});

var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
				'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
				'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
			mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic3R1YXJ0Z2VvcmdlNTciLCJhIjoiY2p5bzNzamw3MHM3aDNvbzg0d2c3eWtiZSJ9.4zD4tx1DwAOgJm1DC4LbrQ';
var usgsImagery = L.tileLayer(mbUrl, {id: 'mapbox.satellite',maxZoom: 26, attribution: mbAttr});


/* Overlay Layers */
var highlight = L.geoJson(null);
var highlightStyle = {
  stroke: false,
  fillColor: "#00FFFF",
  fillOpacity: 0.7,
  radius: 10
};

var boundaries = L.geoJson(null, {
  style: function (feature) {
    return {
      color: "black",
      fill: false,
      opacity: 1,
      clickable: false
    };
  },
  onEachFeature: function (feature, layer) {
    boundarySearch.push({
      name: layer.feature.properties.BoroName,
      source: "Boundaries",
      id: L.stamp(layer),
      bounds: layer.getBounds()
    });
  }
});
$.getJSON("data/boundaries.geojson", function (data) {
  boundaries.addData(data);
});

//Create a color dictionary based off of stream route_id
var streamColors = {"1":"#ff3135", "2":"#ff3135", "3":"ff3135", "4":"#009b2e",
    "5":"#009b2e", "6":"#009b2e", "7":"#ce06cb", "A":"#fd9a00", "C":"#fd9a00",
    "E":"#fd9a00", "SI":"#fd9a00","H":"#fd9a00", "Air":"#ffff00", "B":"#ffff00",
    "D":"#ffff00", "F":"#ffff00", "M":"#ffff00", "G":"#9ace00", "FS":"#6e6e6e",
    "GS":"#6e6e6e", "J":"#976900", "Z":"#976900", "L":"#969696", "N":"#ffff00",
    "Q":"#ffff00", "R":"#ffff00" };

var streamLines = L.geoJson(null, {
  style: function (feature) {
      return {
        color: streamColors[feature.properties.route_id],
        weight: 3,
        opacity: 1
      };
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Division</th><td>" + feature.properties.Division + "</td></tr>" + "<tr><th>Line</th><td>" + feature.properties.Line + "</td></tr>" + "<table>";
      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.Line);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");

        }
      });
    }
    layer.on({
      mouseover: function (e) {
        var layer = e.target;
        layer.setStyle({
          weight: 3,
          color: "#00FFFF",
          opacity: 1
        });
        if (!L.Browser.ie && !L.Browser.opera) {
          layer.bringToFront();
        }
      },
      mouseout: function (e) {
        streamLines.resetStyle(e.target);
      }
    });
  }
});
$.getJSON("data/streams.geojson", function (data) {
  streamLines.addData(data);
});

/* Single marker cluster layer to hold all clusters */
var markerClusters = new L.MarkerClusterGroup({
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  disableClusteringAtZoom: 16
});

/* Empty layer placeholder to add to layer control for listening when to add/remove naturetrail to markerClusters layer */
var naturetrailLayer = L.geoJson(null);
var naturetrail = L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, {
      icon: L.icon({
        iconUrl: "assets/img/naturetrail.png",
        iconSize: [20, 20],
        iconAnchor: [10, 0],
        popupAnchor: [0, 0]
      }),
      title: feature.properties.NAME,
      riseOnHover: true
    });
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Latin Name</th><td>" + feature.properties.NAME + "</td></tr>" + "<tr><th>Common Name</th><td>" + feature.properties.TEL + "</td></tr>" + "<tr><th>Notes</th><td>" + feature.properties.ADDRESS1 + "</td></tr>" + "<tr><th>Website</th><td><a class='url-break' href='" + feature.properties.URL + "' target='_blank'>" + feature.properties.URL + "</a></td></tr>" + "<table>";
      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.NAME);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");
          highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
        }
      });
      $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="30" height="30" src="assets/img/naturetrail.png"></td><td class="feature-name">' + layer.feature.properties.NAME + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      naturetrailSearch.push({
        name: layer.feature.properties.NAME,
        address: layer.feature.properties.ADDRESS1,
        source: "Nature Trail",
        id: L.stamp(layer),
        lat: layer.feature.geometry.coordinates[1],
        lng: layer.feature.geometry.coordinates[0]
      });
    }
  }
});
$.getJSON("data/Nature Trail.geojson", function (data) {
  naturetrail.addData(data);
  map.addLayer(naturetrailLayer);
});

/* Empty layer placeholder to add to layer control for listening when to add/remove arboretum to markerClusters layer */
var arboretumLayer = L.geoJson(null);
var arboretum = L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, {
      icon: L.icon({
        iconUrl: "assets/img/tree.png",
        iconSize: [24, 28],
        iconAnchor: [12, 28],
        popupAnchor: [0, -25]
      }),
      title: feature.properties.NAME,
      riseOnHover: true
    });
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Latin Name</th><td>" + feature.properties.NAME + "</td></tr>" + "<tr><th>Common Name</th><td>" + feature.properties.TEL + "</td></tr>" + "<tr><th>Notes</th><td>" + feature.properties.ADRESS1 + "</td></tr>" + "<tr><th>Website</th><td><a class='url-break' href='" + feature.properties.URL + "' target='_blank'>" + feature.properties.URL + "</a></td></tr>" + "<table>";
      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.NAME);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");
          highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
        }
      });
      $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/tree.png"></td><td class="feature-name">' + layer.feature.properties.NAME + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      arboretumSearch.push({
        name: layer.feature.properties.NAME,
        address: layer.feature.properties.ADRESS1,
        source: "Arboretum",
        id: L.stamp(layer),
        lat: layer.feature.geometry.coordinates[1],
        lng: layer.feature.geometry.coordinates[0]
      });
    }
  }
});
$.getJSON("data/Arboretum.geojson", function (data) {
  arboretum.addData(data);
});

/* Empty layer placeholder to add to layer control for listening when to add/remove native to markerClusters layer */
var nativeLayer = L.geoJson(null);
var native = L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, {
      icon: L.icon({
        iconUrl: "assets/img/circle.png",
        iconSize: [24, 28],
        iconAnchor: [12, 28],
        popupAnchor: [0, -25]
      }),
      title: feature.properties.NAME,
      riseOnHover: true
    });
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Latin Name</th><td>" + feature.properties.NAME + "</td></tr>" + "<tr><th>Common Name</th><td>" + feature.properties.TEL + "</td></tr>" + "<tr><th>Notes</th><td>" + feature.properties.ADRESS1 + "</td></tr>" + "<tr><th>Website</th><td><a class='url-break' href='" + feature.properties.URL + "' target='_blank'>" + feature.properties.URL + "</a></td></tr>" + "<table>";
      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.NAME);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");
          highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
        }
      });
      $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/tree.png"></td><td class="feature-name">' + layer.feature.properties.NAME + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      nativeSearch.push({
        name: layer.feature.properties.NAME,
        address: layer.feature.properties.ADRESS1,
        source: "Native Trees",
        id: L.stamp(layer),
        lat: layer.feature.geometry.coordinates[1],
        lng: layer.feature.geometry.coordinates[0]
      });
    }
  }
});
$.getJSON("data/Native.geojson", function (data) {
  native.addData(data);
});

map = L.map("map", {
  zoom: 16,
  center: [-36.75250, 174.75665],
  layers: [cartoLight, boundaries, markerClusters, highlight],
  zoomControl: false,
  attributionControl: false
});

/* Layer control listeners that allow for a single markerClusters layer */
map.on("overlayadd", function(e) {
  if (e.layer === naturetrailLayer) {
    markerClusters.addLayer(naturetrail);
    syncSidebar();
  }
  if (e.layer === arboretumLayer) {
    markerClusters.addLayer(arboretum);
    syncSidebar();
  }
  if (e.layer === nativeLayer) {
    markerClusters.addLayer(native);
    syncSidebar();
  }
});

map.on("overlayremove", function(e) {
  if (e.layer === naturetrailLayer) {
    markerClusters.removeLayer(naturetrail);
    syncSidebar();
  }
  if (e.layer === arboretumLayer) {
    markerClusters.removeLayer(arboretum);
    syncSidebar();
  }
  if (e.layer === nativeLayer) {
    markerClusters.removeLayer(native);
    syncSidebar();
  }
});

/* Filter sidebar feature list to only show features in current map bounds */
map.on("moveend", function (e) {
  syncSidebar();
});

/* Clear feature highlight when map is clicked */
map.on("click", function(e) {
  highlight.clearLayers();
});

/* Attribution control */
function updateAttribution(e) {
  $.each(map._layers, function(index, layer) {
    if (layer.getAttribution) {
      $("#attribution").html((layer.getAttribution()));
    }
  });
}
map.on("layeradd", updateAttribution);
map.on("layerremove", updateAttribution);

var attributionControl = L.control({
  position: "bottomright"
});
attributionControl.onAdd = function (map) {
  var div = L.DomUtil.create("div", "leaflet-control-attribution");
  div.innerHTML = "<span class='hidden-xs'>Developed by <a href='http://bryanmcbride.com'>bryanmcbride.com</a> | </span><a href='#' onclick='$(\"#attributionModal\").modal(\"show\"); return false;'>Attribution</a>";
  return div;
};
map.addControl(attributionControl);

var zoomControl = L.control.zoom({
  position: "bottomright"
}).addTo(map);

/* GPS enabled geolocation control set to follow the user's location */
var locateControl = L.control.locate({
  position: "bottomright",
  drawCircle: true,
  follow: true,
  setView: true,
  keepCurrentZoomLevel: true,
  markerStyle: {
    weight: 1,
    opacity: 0.8,
    fillOpacity: 0.8
  },
  circleStyle: {
    weight: 1,
    clickable: false
  },
  icon: "fa fa-location-arrow",
  metric: false,
  strings: {
    title: "My location",
    popup: "You are within {distance} {unit} from this point",
    outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
  },
  locateOptions: {
    maxZoom: 26,
    watch: true,
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 10000
  }
}).addTo(map);

/* Larger screens get expanded layer control and visible sidebar */
if (document.body.clientWidth <= 767) {
  var isCollapsed = true;
} else {
  var isCollapsed = false;
}

var baseLayers = {
  "Street Map": cartoLight,
  "Aerial Imagery": usgsImagery
};

var groupedOverlays = {
  "Points of Interest": {
    "<img src='assets/img/naturetrail.png' width='20' height='20'>&nbsp;Nature Trail": naturetrailLayer,
    "<img src='assets/img/tree.png' width='24' height='28'>&nbsp;Arboretum": arboretumLayer,
    "<img src='assets/img/circle.png' width='24' height='28'>&nbsp;Native Trees": nativeLayer
  },
  "Reference": {
    "Pest Management Boundaries": boundaries,
    "Streams": streamLines
  }
};

var layerControl = L.control.groupedLayers(baseLayers, groupedOverlays, {
  collapsed: isCollapsed
}).addTo(map);

/* Highlight search box text on click */
$("#searchbox").click(function () {
  $(this).select();
});

/* Prevent hitting enter from refreshing the page */
$("#searchbox").keypress(function (e) {
  if (e.which == 13) {
    e.preventDefault();
  }
});

$("#featureModal").on("hidden.bs.modal", function (e) {
  $(document).on("mouseout", ".feature-row", clearHighlight);
});

/* Typeahead search functionality */
$(document).one("ajaxStop", function () {
  $("#loading").hide();
  sizeLayerControl();
  /* Fit map to boroughs bounds
  map.fitBounds(boroughs.getBounds());
  featureList = new List("features", {valueNames: ["feature-name"]});
  featureList.sort("feature-name", {order:"asc"});
*/
  var boundariesBH = new Bloodhound({
    name: "Boundaries",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: boundarySearch,
    limit: 10

  var naturetrailBH = new Bloodhound({
    name: "Nature Trail",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: naturetrailSearch,
    limit: 10
  });

  var arboretumBH = new Bloodhound({
    name: "Arboretum",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: arboretumSearch,
    limit: 10
  });
  
  var nativeBH = new Bloodhound({
    name: "Native Trees",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: nativeSearch,
    limit: 10
  });

  var geonamesBH = new Bloodhound({
    name: "GeoNames",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
      url: "http://api.geonames.org/searchJSON?username=bootleaf&featureClass=P&maxRows=5&countryCode=US&name_startsWith=%QUERY",
      filter: function (data) {
        return $.map(data.geonames, function (result) {
          return {
            name: result.name + ", " + result.adminCode1,
            lat: result.lat,
            lng: result.lng,
            source: "GeoNames"
          };
        });
      },
      ajax: {
        beforeSend: function (jqXhr, settings) {
          settings.url += "&east=" + map.getBounds().getEast() + "&west=" + map.getBounds().getWest() + "&north=" + map.getBounds().getNorth() + "&south=" + map.getBounds().getSouth();
          $("#searchicon").removeClass("fa-search").addClass("fa-refresh fa-spin");
        },
        complete: function (jqXHR, status) {
          $('#searchicon').removeClass("fa-refresh fa-spin").addClass("fa-search");
        }
      }
    },
    limit: 10
  });
  boundariesBH.initialize();
  naturetrailBH.initialize();
  arboretumBH.initialize();
  nativeBH.initialize();
  geonamesBH.initialize();

  /* instantiate the typeahead UI */
  $("#searchbox").typeahead({
    minLength: 3,
    highlight: true,
    hint: false
  }, {
    name: "Boundaries",
    displayKey: "name",
    source: boundariesBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'>Pest Management Boundaries</h4>"
    }
  }, {
    name: "Nature Trail",
    displayKey: "name",
    source: naturetrailBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/img/naturetrail.png' width='24' height='24'>&nbsp;Nature Trail</h4>",
      suggestion: Handlebars.compile(["{{name}}<br>&nbsp;<small>{{address}}</small>"].join(""))
    }
  }, {
    name: "Arboretum",
    displayKey: "name",
    source: arboretumBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/img/tree.png' width='24' height='28'>&nbsp;Arboretum</h4>",
      suggestion: Handlebars.compile(["{{name}}<br>&nbsp;<small>{{address}}</small>"].join(""))
    }
  }, {
    name: "Native Trees",
    displayKey: "name",
    source: nativeBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/img/circle.png' width='24' height='28'>&nbsp;Native Trees</h4>",
      suggestion: Handlebars.compile(["{{name}}<br>&nbsp;<small>{{address}}</small>"].join(""))
    }
  }, {
    name: "GeoNames",
    displayKey: "name",
    source: geonamesBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/img/globe.png' width='25' height='25'>&nbsp;GeoNames</h4>"
    }
  }).on("typeahead:selected", function (obj, datum) {
    if (datum.source === "Boundaries") {
      map.fitBounds(datum.bounds);
    }
    if (datum.source === "Nature Trail") {
      if (!map.hasLayer(naturetrailLayer)) {
        map.addLayer(naturetrailLayer);
      }
      map.setView([datum.lat, datum.lng], 17);
      if (map._layers[datum.id]) {
        map._layers[datum.id].fire("click");
      }
    }
    if (datum.source === "Arboretum") {
      if (!map.hasLayer(arboretumLayer)) {
        map.addLayer(arboretumLayer);
      }
      map.setView([datum.lat, datum.lng], 17);
      if (map._layers[datum.id]) {
        map._layers[datum.id].fire("click");
      }
    }
     if (datum.source === "Native Trees") {
      if (!map.hasLayer(nativeLayer)) {
        map.addLayer(nativeLayer);
      }
      map.setView([datum.lat, datum.lng], 17);
      if (map._layers[datum.id]) {
        map._layers[datum.id].fire("click");
      }
    }
    if (datum.source === "GeoNames") {
      map.setView([datum.lat, datum.lng], 14);
    }
    if ($(".navbar-collapse").height() > 50) {
      $(".navbar-collapse").collapse("hide");
    }
  }).on("typeahead:opened", function () {
    $(".navbar-collapse.in").css("max-height", $(document).height() - $(".navbar-header").height());
    $(".navbar-collapse.in").css("height", $(document).height() - $(".navbar-header").height());
  }).on("typeahead:closed", function () {
    $(".navbar-collapse.in").css("max-height", "");
    $(".navbar-collapse.in").css("height", "");
  });
  $(".twitter-typeahead").css("position", "static");
  $(".twitter-typeahead").css("display", "block");
});

// Leaflet patch to make layer control scrollable on touch browsers
var container = $(".leaflet-control-layers")[0];
if (!L.Browser.touch) {
  L.DomEvent
  .disableClickPropagation(container)
  .disableScrollPropagation(container);
} else {
  L.DomEvent.disableClickPropagation(container);
}
