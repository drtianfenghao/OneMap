function settools(mapview,graphicsLayer){
    require([
        "dojo/on","dojo/dom", 'dojo/dom-construct',
        "esri/widgets/Fullscreen",
        "esri/widgets/Expand",
        "dijit/form/Button",
        "esri/widgets/Popup",
        "esri/Graphic",
        "esri/widgets/LayerList",
        "esri/widgets/Sketch/SketchViewModel",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/renderers/SimpleRenderer",
        "dojo/domReady!"
    ],function (on,dom,domConstruct,Fullscreen,Expand,Button,Popup,Graphic,LayerList,SketchViewModel,SimpleMarkerSymbol,SimpleRenderer) {

        let layerList_expand,edit_expand,search_expand,measure_expand;

        AddLayers();
        SetEditTools();
        SetSearchTools();
        SetMeasureTools();
        //添加图层工具
        function AddLayers(){
            var num,LayerWidgets,list;
            num = 0;
            LayerWidgets = document.getElementById("layer_widgets");
            list = new LayerList({
                view: mapview,
                listItemCreatedFunction: function (event) {
                    var item = event.item;

                    if(item.title !== "新建临时图层"){
                        // set an action for zooming to the full extent of the layer
                        item.actionsSections = [[{
                            title: "Go to full extent",
                            className: "esri-icon-zoom-out-fixed",
                            id: "full-extent"
                        },{
                            title: "增加透明度",
                            className: "esri-icon-up",
                            id: "increase-opacity"
                        },{
                            title: "降低透明度",
                            className: "esri-icon-down",
                            id: "decrease-opacity"
                        }]];
                    }

                }
            });
            list.on("trigger-action", function(event) {

                // The layer visible in the view at the time of the trigger.
            //                var visibleLayer = layer1.visible ? layer1 : censusLayer;

                // Capture the action id.
                var id = event.action.id;

            //                if (id === "full-extent") {
            //
            //                    // If the full-extent action is triggered then navigate
            //                    // to the full extent of the visible layer.
            //                    view.goTo(visibleLayer.fullExtent);
            //
            //                } else if (id === "information") {
            //
            //                    // If the information action is triggered, then
            //                    // open the item details page of the service layer.
            //                    window.open(visibleLayer.url);
            //
            //                } else
                    if (id === "increase-opacity") {

                    // If the increase-opacity action is triggered, then
                    // increase the opacity of the GroupLayer by 0.25.

                        if (layer.opacity < 1) {
                            layer.opacity += 0.25;
                        }

                    } else if (id === "decrease-opacity") {

                    // If the decrease-opacity action is triggered, then
                    // decrease the opacity of the GroupLayer by 0.25.

                    if (layer.opacity > 0) {
                        layer.opacity -= 0.25;
                    }
                }
            });
            layerList_expand = new Expand({
                expandIconClass: "esri-icon-layers",  // see https://developers.arcgis.com/javascript/latest/guide/esri-icon-font/
                view: mapview,
                expandTooltip:"图层控制",
                content: list,
                group:"top-right"
            });
            LayerWidgets.onclick = function () {
              if(num%2==0){
                  mapview.ui.add([{
                        component:layerList_expand,
                        position:"top-right",
                        index:0
                    }]);
              }else{
                  mapview.ui.remove(layerList_expand);
              }
              num = num +1;
            };


        }
        //添加全图工具
        function SetFullscreenTools(){
            var fullscreen = new Fullscreen({
                view: mapview
            });
            mapview.ui.add(fullscreen, "top-left");
        }
        //添加编辑工具
        function SetEditTools(){
            var editGraphic,sketchViewModel,num,EditWidgets;
            num = 0;
            edit_expand = new Expand({
                        expandIconClass: "esri-icon-edit",
                        view: mapview,
                        expandTooltip:"编辑工具",
                        iconNumber:6,
                        group:"top-right",
                        content: document.getElementById("edit_toolbar")
            });
            mapview.when(function () {
                // create a new sketch view model
                sketchViewModel = new SketchViewModel({
                    view:mapview,
                    layer: graphicsLayer,
                    pointSymbol:{
                        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
                        style: "square",
                        color: "#8A2BE2",
                        size: "16px",
                        outline: { // autocasts as new SimpleLineSymbol()
                            color: [255, 255, 255],
                            width: 3
                        }
                },
                polylineSymbol:{
                    type: "simple-line", // autocasts as new SimpleLineSymbol()
                    color: "#8A2BE2",
                    width: "4",
                    style: "dash"
                },
                polygonSymbol:{
                    type: "simple-fill", // autocasts as new SimpleFillSymbol()
                    color: "rgba(138,43,226, 0.8)",
                    style: "solid",
                    outline: {
                        color: "white",
                        width: 1
                    }
            }
            });


            setUpClickHandler();

            // Listen to create-complete event to add a newly created graphic to view
            sketchViewModel.on("create-complete", addGraphic);

            // Listen the sketchViewModel's update-complete and update-cancel events
            sketchViewModel.on("update-complete", updateGraphic);
            sketchViewModel.on("update-cancel", updateGraphic);
             // activate the sketch to create a point
            var drawPointButton = document.getElementById("pointButton");
            drawPointButton.onclick = function () {
                // set the sketch to create a point geometry
                sketchViewModel.create("point");
                setActiveButton(this);
            };

            // activate the sketch to create a polyline
            var drawLineButton = document.getElementById("polylineButton");
            drawLineButton.onclick = function () {
                // set the sketch to create a polyline geometry
                sketchViewModel.create("polyline");
                setActiveButton(this);
            };

            // activate the sketch to create a polygon
            var drawPolygonButton = document.getElementById("polygonButton");
            drawPolygonButton.onclick = function () {
                // set the sketch to create a polygon geometry
                sketchViewModel.create("polygon");
                setActiveButton(this);
            };

            // activate the sketch to create a rectangle
            var drawRectangleButton = document.getElementById(
                "rectangleButton");
            drawRectangleButton.onclick = function () {
                // set the sketch to create a polygon geometry
                sketchViewModel.create("rectangle");
                setActiveButton(this);
            };

            // activate the sketch to create a circle
            var drawCircleButton = document.getElementById("circleButton");
            drawCircleButton.onclick = function () {
                // set the sketch to create a polygon geometry
                sketchViewModel.create("circle");
                setActiveButton(this);
            };

            // reset button
            document.getElementById("resetBtn").onclick = function () {
                sketchViewModel.reset();
                graphicsLayer.removeAll();
                setActiveButton();
            };
            // called when sketchViewModel's create-complete event is fired.
            function addGraphic(event) {
                // Create a new graphic and set its geometry to
                // `create-complete` event geometry.
                const graphic = new Graphic({
                    geometry: event.geometry,
                    symbol: sketchViewModel.graphic.symbol
                });
                graphicsLayer.add(graphic);
            }

            // Runs when sketchViewModel's update-complete or update-cancel
            // events are fired.
            function updateGraphic(event) {
                // Create a new graphic and set its geometry event.geometry
                var graphic = new Graphic({
                    geometry: event.geometry,
                    symbol: editGraphic.symbol
                });
                graphicsLayer.add(graphic);

                // set the editGraphic to null update is complete or cancelled.
                editGraphic = null;
            }

            // set up logic to handle geometry update and reflect the update on "graphicsLayer"
            function setUpClickHandler() {
                mapview.on("click", function (event) {
                    mapview.hitTest(event).then(function (response) {
                        var results = response.results;
                        if (results.length > 0) {
                            for (var i = 0; i < results.length; i++) {
                                // Check if we're already editing a graphic
                                if (!editGraphic && results[i].graphic.layer.id === "tempGraphics") {
                                    // Save a reference to the graphic we intend to update
                                    editGraphic = results[i].graphic;

                                    // Remove the graphic from the GraphicsLayer
                                    // Sketch will handle displaying the graphic while being updated
                                    graphicsLayer.remove(editGraphic);
                                    sketchViewModel.update(editGraphic);
                                    break;
                                }
                            }
                        }
                    });
                });
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
        });
            EditWidgets = document.getElementById("edit_widgets");
            EditWidgets.onclick = function (){
                if(num%2==0){
                    mapview.ui.add([{
                        component:edit_expand,
                        position:"top-right",
                        index:1
                    }]);
                }else{
                    mapview.ui.remove(edit_expand);
                }
                num = num +1;
            };
        }
        //添加属性工具
        function SetSearchTools() {
            var table_window,num;
            num = 0;
            table_window = document.getElementById("open_table_window");
            table_window.onclick = function(){
                if(num%2==0){
                    $('#table_window').window("open");
                    Dr_Search();
                }else{
                    $('#table_window').window("close");
                }
                num = num + 1;

            };
        }
        //添加测量工具
        function SetMeasureTools() {
            var num,MeasureWidgets;
            measure_expand = new Expand({
                        expandIconClass: "esri-icon-edit",
                        view: mapview,
                        expandTooltip:"测量工具",
                        group:"top-right",
                        content: document.getElementById("measuringtools")
            });
            num = 0;
            MeasureWidgets = document.getElementById("measure_widgets");
            MeasureWidgets.onclick = function () {
                if(num%2==0){

                }else{

                }
                num = num + 1;
            }
            
        }




    })
}


