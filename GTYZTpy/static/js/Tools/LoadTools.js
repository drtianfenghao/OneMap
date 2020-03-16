function Dr_LoadTools(mapview){
    require([
        "esri/tasks/FindTask",
        "esri/tasks/support/FindParameters",
        "esri/Graphic",
        "esri/geometry/Polygon"
    ],function (FindTask,FindParameters,Graphic,Polygon) {
        var file_input_execute = document.getElementById("settings_LoadTools_execute");
        file_input_execute.onclick = function () {
            var filename = new ReturnInputFileName();
            var name = filename.Name.split(".");
            var input_filename = {"filename":filename.Name};
            Load_file(input_filename);
        };
        function Load_file(filename) {
            $.ajax({
                 url: '/upload_execute/',
                 type: 'POST',
                 data: JSON.stringify(filename),
                 success: function (callback) {
                     var result = callback;
                     var jsonf = geoJsonConverter();
                     var json = jsonf.toEsri(result);
                     var features = json.features;
                     for (var i = 0; i < features.length; i++) {
                         var feature = features[i];
                         var polygon = new Polygon({
                             type:"polygon",
                             rings:feature.geometry.rings,
                             spatialReference:feature.geometry.spatialReference,
                         });

                         console.log(JSON.stringify(feature.geometry.rings));
                         var graphic = new Graphic({
                             symbol:{
                                type: "simple-fill", // autocasts as new SimpleFillSymbol()
                                color: "rgba(138,43,226, 0.8)",
                                style: "solid",
                                outline: {
                                    color: "white",
                                    width: 1
                                }
                                },
                             geometry:polygon
                         });
                         var graghicslayer =  mapview.map.findLayerById("edit_graphicslayer");
                         graghicslayer.graphics.add(graphic);
                     }

                     alert('加载shp成功！');
                 }
             })
        }
    });
}
