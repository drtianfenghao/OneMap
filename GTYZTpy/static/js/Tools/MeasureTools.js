function Dr_measure(mapview) {
     require([
        "esri/widgets/DistanceMeasurement2D",
        "esri/widgets/AreaMeasurement2D"
    ],function (DistanceMeasurement2D,AreaMeasurement2D) {
         var activeWidget = null;



      // add the toolbar for the measurement widgets
      // mapview.ui.add("measure_topbar", "top-right");

        document.getElementById("distanceButton").addEventListener("click",
            function () {
                setActiveWidget(null);
                setActiveWidget('distance');

        });

        document.getElementById("areaButton").addEventListener("click",
            function () {
                setActiveWidget(null);
                setActiveWidget('area');

        });
        document.getElementById("clearGraphic").addEventListener("click",
            function () {
                setActiveWidget(null);
                setActiveWidget('clear');

        });

        function setActiveWidget(type) {
            switch (type) {
                case "distance":
                    activeWidget = new DistanceMeasurement2D({
                      view: mapview,
                        container:document.getElementById("measure_container")
                    });
                    // skip the initial 'new measurement' button
                    activeWidget.viewModel.newMeasurement();
                    break;
                case "area":
                    activeWidget = new AreaMeasurement2D({
                      view: mapview,
                        container:document.getElementById("measure_container")
                    });
                    // skip the initial 'new measurement' button
                    activeWidget.viewModel.newMeasurement();
                    break;
                case "clear":
                    var graghicslayer =  mapview.map.findLayerById("MeasureGraphics");
                    mapview.map.layers.remove(graghicslayer);
                    break;
                case null:
                    document.getElementById('measure_container').innerHTML = '';
                    //   $("#measure_container").empty();
                    //    $("#measure_container").html('');
                    // activeWidget.destroy();
                    activeWidget = null;

                    break;
        }
      }

        function setActiveButton(selectedButton) {
            // focus the view to activate keyboard shortcuts for sketching
            mapview.focus();
            var elements = document.getElementsByClassName("active");
            for (var i = 0; i < elements.length; i++) {
                elements[i].classList.remove("active");
            }
            if (selectedButton) {
                selectedButton.classList.add("active");
            }
        }
     })
}