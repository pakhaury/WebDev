var locator, map;

      require([
        "esri/map", "esri/tasks/locator",
        "esri/SpatialReference", "esri/graphic",
        "esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleMarkerSymbol",
        "esri/symbols/Font", "esri/symbols/TextSymbol",
        "esri/geometry/Point", "esri/geometry/Extent",
        "esri/geometry/webMercatorUtils",
        "dojo/_base/array", "esri/Color",
        "dojo/number", "dojo/parser", "dojo/dom", "dojo/json", "dijit/registry",

        "dijit/form/Button", "dijit/form/Textarea",
        "dijit/layout/BorderContainer", "dijit/layout/ContentPane", "dojo/domReady!"
      ], function(
        Map, Locator,
        SpatialReference, Graphic,
        SimpleLineSymbol, SimpleMarkerSymbol,
        Font, TextSymbol,
        Point, Extent,
        webMercatorUtils,
        arrayUtils, Color,
        number, parser, dom, JSON, registry
      ) {
        parser.parse();

        map = new Map("map",{
          basemap: "topo-vector",
          center: [-96.311, 43.676],
          zoom: 3
        });

        locator = new Locator("https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer");

        registry.byId("locate").on("click", locate);

        //Draw and zoom to the result when the geocoding is complete
        locator.on("address-to-locations-complete", function(evt) {
          map.graphics.clear();
          arrayUtils.forEach(evt.addresses, function(geocodeResult, index) {
            //create a random color for the text and marker symbol
            var r = Math.floor(Math.random() * 250);
            var g = Math.floor(Math.random() * 100);
            var b = Math.floor(Math.random() * 100);

            var symbol = new SimpleMarkerSymbol(
              SimpleMarkerSymbol.STYLE_CIRCLE,
              20,
              new SimpleLineSymbol(
                SimpleLineSymbol.STYLE_SOLID,
                new Color([r, g, b, 0.5]),
                10
              ), new Color([r, g, b, 0.9]));
            var pointMeters = webMercatorUtils.geographicToWebMercator(geocodeResult.location);
            var locationGraphic = new Graphic(pointMeters, symbol);

            var font = new Font().setSize("12pt").setWeight(Font.WEIGHT_BOLD);
            var textSymbol = new TextSymbol(
              (index + 1) + ".) " + geocodeResult.address,
              font,
              new Color([r, g, b, 0.8])
            ).setOffset(5, 15);
            //add the location graphic and text with the address to the map
            map.graphics.add(locationGraphic);
            map.graphics.add(new Graphic(pointMeters, textSymbol));
          });
          var ptAttr = evt.addresses[0].attributes;
          var minx = parseFloat(ptAttr.Xmin);
          var maxx = parseFloat(ptAttr.Xmax);
          var miny = parseFloat(ptAttr.Ymin);
          var maxy = parseFloat(ptAttr.Ymax);

          var esriExtent = new Extent(minx, miny, maxx, maxy, new SpatialReference({wkid:4326}));
          map.setExtent(webMercatorUtils.geographicToWebMercator(esriExtent));

          showResults(evt.addresses);
        });

        map.on("extent-change", updateExtent);

        function updateExtent() {
          dom.byId("currentextent").innerHTML = "<b>Current Extent JSON:</b> " + JSON.stringify(map.extent.toJson());
          dom.byId("currentextent").innerHTML += "<br/><b>Current Zoom level:</b> " + map.getLevel();
        }

        function showResults(results) {
          var rdiv = dom.byId("resultsdiv");
          rdiv.innerHTML = "<p><b>Results : " + results.length + "</b></p>";

          var content = [];
          arrayUtils.forEach(results, function(result, index) {
            var x = result.location.x.toFixed(5);
            var y = result.location.y.toFixed(5);
            content.push("<fieldset>");
            content.push("<legend><b>" + (index + 1) + ". " + result.address + "</b></legend>");
            content.push("<i>Score:</i> " + result.score);
            content.push("<br/>");
            content.push("<i>Address Found In</i> : " + result.address);
            content.push("<br/><br/>");
            content.push("Latitude (y): " + y);
            content.push("  ");
            content.push("Longitude (x): " + x);
            content.push("<br/><br/>");
            content.push("<b>GeoRSS-Simple</b><br/>");
            content.push("<georss:point>" + y + " " + x + "</georss:point>");
            content.push("<br/><br/>");
            content.push("<b>GeoRSS-GML</b><br/>");
            content.push("<georss:where><gml:Point><gml:pos>" + y + " " + x + "</gml:pos><gml:Point></georss:where>");
            content.push("<br/><br/>");
            content.push("<b>Esri JSON</b><br/>");
            content.push("<b>WGS:</b> " + JSON.stringify(result.location.toJson()));
            content.push("<br/>");

            var location_wm = webMercatorUtils.geographicToWebMercator(result.location);

            content.push("<b>WM:</b> " + JSON.stringify(location_wm.toJson()));
            content.push("<br/><br/>");
            content.push("<b>Geo JSON</b><br/>");
            content.push('"geometry": {"type": "Point", "coordinates": [' + y + ',' + x + ']}');
            content.push("<br/><br/>");
            content.push("<input type='button' value='Center At Address' onclick='zoomTo(" + y + "," + x + ")'/>");
            content.push("</fieldset>");
          });
          rdiv.innerHTML += content.join("");
        }

        //Perform the geocode. This function runs when the "Locate" button is pushed.
        function locate() {
          var address = {
             SingleLine: dom.byId("address").value
          };
          var options = {
            address: address,
            outFields: ["*"]
          };
          //optionally return the out fields if you need to calculate the extent of the geocoded point
          locator.addressToLocations(options);
        }
      });

      function zoomTo(lat, lon) {
        require([
          "esri/geometry/Point", "esri/geometry/webMercatorUtils"
        ], function(Point, webMercatorUtils) {
          var point = new Point(lon, lat, {
            wkid: "4326"
          });
          var wmpoint = webMercatorUtils.geographicToWebMercator(point);
          map.centerAt(wmpoint);
        });
      }