var myMap,mapview;

require([
            "esri/layers/MapImageLayer",
            "esri/Map",
            "esri/views/MapView",
            "esri/geometry/Extent",
            "esri/layers/GraphicsLayer",
            "esri/widgets/Expand",
            "esri/widgets/Sketch/SketchViewModel",
            "esri/Graphic",
            "esri/geometry/SpatialReference",
            
            "dojo/domReady!"

        ], function (MapImageLayer, Map, MapView,Extent,GraphicsLayer,Expand,SketchViewModel,Graphic,SpatialReference) {
                const fullextent = new Extent(4.350168691E7, 4737552.525599999, 4.35566068723E7, 4808331.690125, new SpatialReference({ wkid:2367 }) );//2367
                const layer = new MapImageLayer({
                        url: MapConfig.url.layerurl,
                        id:"maplayer",
                //                visible:true,
                        fullExtent:fullextent,
                        title:"图层管理",
                //                listMode:true,
                //                visible:true,
                        sublayers:MapConfig.sublayers
                });
                const graphicsLayer = new GraphicsLayer({
                    id: "tempGraphics",
                    title:"新建临时图层",
                });

                myMap = new Map({
                    // basemap: "streets-night-vector",
                    layers:layer
                });
                mapview = new MapView({
                    container: "mapDiv",
                    map: myMap,
                    constraints: {
                        rotationEnabled: false//取消旋转
                    },
                    zoom: 5
                });

                //取消双击放大
                mapview.on('double-click',function(e){
                    e.stopPropagation()
                });
                //设置范围
                mapview.extent = fullextent;
                //加载图层
                settools(mapview,mapview.graphics);
                Dr_measure(mapview);





})