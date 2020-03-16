/**
 * Created by 59308 on 2017/3/8 0008.
 */
/**
 *
 */
/**
 * Created by TianFenghao on 2017/2/28 0028.
 */
var mapview;
var map,layer7,visible=[];
var returnlayer;

var grid, store;
var select_search_layer;
var point;
var layernode;

var inputxy;
var mapclick;
var zdanalygygeometry;
var zdanalygygraphic;
var returnquerygeographic_set;
var layer0results;
var zdfx;
var geometryService;
var measuregeometry;
var return_length_id = null;
var return_area_id = null;

require(["esri/map",
        "esri/views/MapView",
        "dojo/on","dojo/dom","dojo/data/ItemFileWriteStore","dojox/grid/DataGrid","esri/widgets/Popup",
        "esri/views/navigation/Navigation",

        "esri/tasks/support/FeatureSet",
        "esri/tasks/support/LinearUnit",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/geometry/SpatialReference",
        "esri/geometry/Extent",
        "esri/tasks/Geoprocessor",
        "esri/layers/MapImageLayer",
        "esri/tasks/QueryTask",
        "esri/tasks/FindTask",
        "esri/tasks/support/FindParameters",
        "esri/tasks/IdentifyTask",
        "esri/tasks/support/IdentifyParameters",
        "esri/views/2d/draw/Draw",

        "esri/symbols/SimpleLineSymbol",
        "esri/symbols/SimpleFillSymbol",
        "esri/Color",
        "esri/graphic",
        "esri/layers/GraphicsLayer",
        "esri/tasks/support/LengthsParameters",
        "esri/tasks/support/AreasAndLengthsParameters",
        "esri/tasks/GeometryService",

        "dojo/domReady!static/js/loadmap"],

    function (Map,MapView,on,dom,ItemFileWriteStore,DataGrid,Popup,Navigation,FeatureSet,LinearUnit,SimpleMarkerSymbol,SpatialReference,Extent,Geoprocessor,MapImageLayer,QueryTask,FindTask,FindParameters,IdentifyTask,IdentifyParameters,Draw,Query,SimpleLineSymbol,SimpleFillSymbol,Color,Graphic,LengthsParameters,AreasAndLengthsParameters) {
        //给DataGrid添加行点击事件
        //dojo.connect(gridWidget, "onRowClick", onRowClickHandler);

         //地图服务的URL



		layer7 = new MapImageLayer("http://localhost:6080/arcgis/rest/services/yzt/发布1/MapServer");
		//console.log(layer7);
        $("input:checkbox").prop("checked",false);
        //3.19
        // map = new Map("mapDiv",{
        //     logo:false,
        //     slider: false,
        // });
        map = new Map({
            logo:false,
            slider: false,
        });
        mapview = new MapView({
//                center: [129.332606 ,43.103744], // long, lat
                container: "mapDiv",
                map: map,
                zoom: 5
        });
         var startextent = new Extent(4.350168691E7, 4737552.525599999, 4.35566068723E7, 4808331.690125,
            new SpatialReference({ wkid:2367 }) );
         mapview.extent = startextent;
         AddLayer(mapview,layer7);
        //全图显示 43526829.96, 4773574.14
        //map.setExtent(new Extent(4.3496370920343935E7,4762736.490883933, 4.356192121985406E7, 4811768.1149175),new SpatialReference({wkid:2367}))

		//显示XY坐标//打开XY显示坐标
		dojo.connect(mapview, "onMouseMove", showCoordinates);

		//显示比例尺

        //取消地图双击缩放
        on(mapview,"dbl-click",function(e){
           mapview.constraints.snapToZoom = false;
        })
        var navToolbar = new Navigation(map);
        on(dom.byId("full_extent"), "click", function(event){//全图
            //navToolbar.zoomToFullExtent();
             mapview.extent = startextent;

        });
        document.getElementById("pan").addEventListener("click", click_pan, false);
        document.getElementById("zoom_in").addEventListener("click", click_zoom_in, false);
        document.getElementById("zoom_out").addEventListener("click", click_zoom_out, false);

        function click_pan(){
            console.log('clickpan');

            map.setMapCursor("url(cursor/pan.cur),auto");
            navToolbar.activate(Navigation.PAN);
        }

        function click_zoom_in(){
            console.log('zoom_in');
            map.setMapCursor("url(cursor/zoom-in.cur),auto");
            navToolbar.activate(Navigation.ZOOM_IN);
        }
        function click_zoom_out(){
            console.log('zoom_out');
             map.setMapCursor("url(cursor/zoom-out.cur),auto");
            navToolbar.activate(Navigation.ZOOM_OUT);
        }
        //设置缩放后恢复平移
        //  navToolbar.on("extent-history-change", function(){
        //      map.setMapCursor("default");
        //     navToolbar.deactivate();
        //  });

        //=====================================================================================================================================//

        //=================================读取所有属性===========================================/
		

        //====================================读取属性结束=========================================/
        //打开属性窗口
        on(dom.byId("querytool"), "click", function(event){//工具箱

            $('#querytool_win').window("open");
            $('#select_layer').combobox({
                 url:'/post_swipe_treelist/',
                 valueField:'id',
                 textField:'text'
            });
            var G=null;
            var field = null;
            var layer = null;
            var findTask = null;
            var findParams = null;
            var id = null;
            var label = null;
            $("#select_layer").combobox({

               onSelect: function (returnid) {
                   id = returnid.id;

                   switch (id) {
                       case 0:
                           label = [{"id":0,"text":"None"}];
                           break;
                       case 10:
                           label = [{"id":0,"text":"LDJH"},{"id":1,"text":"ZDDM"}];
                           break;
                       case 7:
                           label = [{"id":0,"text":"批准文号"}];
                           break;
                       case 8:
                           label = [{"id":0,"text":"上级批准文"}];
                           break;
                       case 15:
                           label = [{"id":0,"text":"DKBM"}];
                           break;
                       case 17:
                           label = [{"id":0,"text":"QSDWMC"}];
                           break;


                   }
                    $('#select_fields').combobox({
                             data:label,
                             valueField:'id',
                             textField:'text'
                        });
               }
             });
             on(dom.byId("search_ok"), "click", function(event){

                            G=document.getElementById('select_values').value;
                            field = label[0].text;
                            layer = id-1;
                            findTask = new FindTask("http://localhost:6080/arcgis/rest/services/yzt/发布1/MapServer");

                            findParams = new FindParameters();
                            findParams.returnGeometry = true;
                            findParams.layerIds = [""+layer+""];

                            select_search_layer = name;
                            findParams.searchFields = [""+field+""];
                            findParams.searchText =  G;
                            findParams.outFields = ["*"];
                            findTask.execute(findParams, showAllData);

                     });
            });


         //工具箱==shp文件
        on(dom.byId("shp_to_polygon"), "click", function(event){//工具箱
             $('#shp_to_polygon_win').window("open");

        });
            //  var getFileContent = function (fileInput, callback) {
            //
            //     if (fileInput.files && fileInput.files.length > 0 && fileInput.files[0].size > 0) {
            //         //下面这一句相当于JQuery的：var file =$("#upload").prop('files')[0];
            //         var file = fileInput.files[0];
            //         if (window.FileReader) {
            //             var reader = new FileReader();
            //             reader.onloadend = function (evt) {
            //                 if (evt.target.readyState == FileReader.DONE) {
            //                     callback(evt.target.result);
            //                 }
            //             };
            //             // 包含中文内容用gbk编码
            //             reader.readAsText(file, 'gbk');
            //         }
            //     }
            // };
            //  document.getElementById('upload').onchange = function () {
            // //var content = document.getElementById('data');
            //
            //     getFileContent(this, function (str) {
            //
            //     })
            //  };

        //工具箱==导入坐标文件
        on(dom.byId("txt_to_polygon"), "click", function(event){//工具箱
            $('#txt_to_polygon_win').window("open");
            var getFileContent = function (fileInput, callback) {

                if (fileInput.files && fileInput.files.length > 0 && fileInput.files[0].size > 0) {
                    //下面这一句相当于JQuery的：var file =$("#upload").prop('files')[0];
                    var file = fileInput.files[0];
                    if (window.FileReader) {
                        var reader = new FileReader();
                        reader.onloadend = function (evt) {
                            if (evt.target.readyState == FileReader.DONE) {
                                callback(evt.target.result);
                            }
                        };
                        // 包含中文内容用gbk编码
                        reader.readAsText(file, 'gbk');
                    }
                }

            };

            /**
             * upload内容变化时载入内容
             */

            document.getElementById('upload').onchange = function () {
                //var content = document.getElementById('data');
                console.log("过着了");
                getFileContent(this, function (str) {

                    $("#data").html(""+str);

                    if(str.indexOf("\n") != -1 ){
                        var arr=str.split("\n");


                    } else{
                        console.log("不含空格");
                    }
                    console.log(arr);
                    var newarr = []
                    for(var i=0;i<arr.length;i++){
                        if(arr[i].length == 0){
                            break;
                        }else{
                            newarr.push(arr[i]);
                        }
                    }

                    inputxy = newarr;

                });
            };

        });

		// on(dom.byId("legend"), "click", function(event){//图例
		// 	$.messager.alert("警告","图例功能暂无法提供");
		// 	/*
		// 	$('#legendwin').window('resize',{top:($('#mapDiv').height()),left:($('#mapDiv').width())});
        //     $('#legendwin').window('open');
		//    */
        // });


		// $("#measuringarea").one('click',function(){
		//     measuring_area();
        // });
		// $("#measuringlength").one('click',function(){
		//     measuring_length();
        // });
        document.getElementById("measuringarea").addEventListener("click", measuring_area, false);
        document.getElementById("measuringlength").addEventListener("click", measuring_length, false);


        function measuring_area(){
            if(mapclick){
                mapclick.remove();
            }
            mapview.graphics.removeAll();
            var polygon_draw = new Draw();
            var polygon_action = polygon_draw.create("polygon");
            // focus the view to activate keyboard shortcuts for drawing polygons
            mapview.focus();
            polygon_action.on("draw-complete", doMeasure);
            // on(toolbar,"draw-end", function(result) {
            //     var geometry = result.geometry;
            //     map.enableMapNavigation();
            //     //toolbar.deactivate();
            //     doMeasure(geometry);
            //     toolbar.deactivate();
            // });


        }
        function measuring_length(){
            if(mapclick){
                 mapclick.remove();
            }
            mapview.graphics.removeAll();
            var polyline_draw = new Draw();
            var polyline_action = polyline_draw.create("polyline");
            // focus the view to activate keyboard shortcuts for drawing polygons
            mapview.focus();
            polyline_action.on("draw-complete", doMeasure);

            // on(toolbar,"draw-end", function(result) {
            //     console.log("drawpolyline");
            //     var geometry = result.geometry;
            //     // map.enableMapNavigation();
            //     //toolbar.deactivate();
            //     doMeasure(geometry);
            //     toolbar.deactivate();
            // });


        }
        function doMeasure(geometry) {
            console.log(geometry);
            //更加类型设置显示样式
            var geometryServiceUrl="http://localhost:6080/arcgis/rest/services/Utilities/Geometry/GeometryServer";
            geometryService = new esri.tasks.GeometryService(geometryServiceUrl);

            measuregeometry = geometry;
            // var toolbar = new Draw(map);
            // toolbar.deactivate();
            var symbol;
            switch (geometry.type) {

                case "polyline":

                    // var symbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 0, 0]), 2);
                    symbol = {
                        type: "simple-line",  // autocasts as new SimpleLineSymbol()
                        color: "lightblue",
                        width: "2px",
                        style: "short-dot"
                    };
                    break;
                case "polygon":
                    // var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_NONE, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 255, 0, 0.25]));
                      symbol = {
                        type: "simple-fill",  // autocasts as new SimpleFillSymbol()
                        color: [ 51,51, 204, 0.9 ],
                        style: "solid",
                        outline: {  // autocasts as new SimpleLineSymbol()
                            color: "white",
                            width: 1
                        }
                    };
                    break; }
            //设置样式
            var graphic = new esri.Graphic(geometry, symbol);
            //清除上一次的画图内容
            // map.graphics.clear();
            mapview.popup.visible = false;
            mapview.graphics.clear();
            mapview.graphics.add(graphic);
            //map.graphics.add(graphic); //进行投影转换，完成后调用projectComplete
            MeasureGeometry(geometry);
        }
            //投影转换完成后调用方法
        function MeasureGeometry(geometry) {
            //如果为线类型就进行lengths距离测算
            if (geometry.type == "polyline") {
                var lengthParams = new LengthsParameters();
                lengthParams.polylines = [geometry];
                lengthParams.lengthUnit = esri.tasks.GeometryService.UNIT_METER;
                lengthParams.geodesic = true;
                lengthParams.polylines[0].spatialReference = new esri.SpatialReference(4326);
                geometryService.lengths(lengthParams);
                dojo.connect(geometryService, "onLengthsComplete", outputDistance);
            }
            //如果为面类型需要先进行simplify操作在进行面积测算
            else if (geometry.type == "polygon") {
                var areasAndLengthParams = new AreasAndLengthsParameters();
                areasAndLengthParams.lengthUnit = esri.tasks.GeometryService.UNIT_METER;
                areasAndLengthParams.areaUnit = esri.tasks.GeometryService.UNIT_SQUARE_METERS;
                this.outSR = new esri.SpatialReference({wkid: 102113});
                geometryService.project([geometry], this.outSR, function (geometry) {
                    geometryService.simplify(geometry, function (simplifiedGeometries) {
                        areasAndLengthParams.polygons = simplifiedGeometries;
                        areasAndLengthParams.polygons[0].spatialReference = new esri.SpatialReference(102113);
                        geometryService.areasAndLengths(areasAndLengthParams); }); });
                dojo.connect(geometryService, "onAreasAndLengthsComplete", outputAreaAndLength); } }
                //显示测量距离
        function outputDistance(result) {
            var CurX = measuregeometry.paths[0][measuregeometry.paths[0].length - 1][0];
            var CurY = measuregeometry.paths[0][measuregeometry.paths[0].length - 1][1];
            console.log('CurX'+CurX);
            console.log('CurY'+CurY);
            var CurPos = new esri.geometry.Point(CurX, CurY, map.spatialReference);
            var title = "距离测量";
            var data;
            var DW;
            switch (return_length_id) {
                case null:
                    data = " 测 量 长 度 ： <strong>" + parseInt(String(result.lengths[0])) + "米</strong>";
                    break;
                case 0:
                    data = " 测 量 长 度 ： <strong>" + parseInt(String(result.lengths[0])) + "米</strong>";
                    break;
                case 1:
                    data = " 测 量 长 度 ： <strong>" + parseInt(String(result.lengths[0]/1000)) + "千米</strong>"
                    break;
            }
            mapview.popup.title = title;
            mapview.popup.content = data;

            // map.infoWindow.setTitle(title);
            // map.infoWindow.setContent(data);
            // map.infoWindow.show(CurPos);


        }
        //显示测量面积
        function outputAreaAndLength(result) {
            var extent=measuregeometry.getExtent();
            //获取查找区域的范围
            var center=measuregeometry.getCentroid();
            //获取查询区域的中心点
            var cPoint = new Point([center.x,center.y],new SpatialReference({ wkid:4326 }));
            var title = "测量面积";
            var data;
            var DW;
            console.log(return_area_id);
            switch (return_area_id) {
                case null:
                    data = " 面积 ： <strong>" + parseInt(String(result.areas[0])) + "平方米</strong> ";
                    break;
                case 0:
                    data = " 面积 ： <strong>" + parseInt(String(result.areas[0])) + "平方米</strong> ";
                    break;
                case 1:
                    data = " 面积 ： <strong>" + parseInt(String(result.areas[0]/1000000)) + "平方千米</strong> ";
                    break;
                case 2:
                    data = " 面积 ： <strong>" + parseInt(String(result.areas[0]/10000)) + "公顷</strong> ";
                    break;
                case 3:
                    data = " 面积 ： <strong>" + parseInt(String(result.areas[0]*0.0015)) + "亩</strong> ";
                    break;
            }
            mapview.popup.title = title;
            mapview.popup.content = data;
            // map.infoWindow.setTitle(title);
            // map.infoWindow.setContent(data);
            // map.infoWindow.show(cPoint);

            // map.infoWindow.setTitle("面积测量");
            // map.infoWindow.setContent(" 面积 ： <strong>" + parseInt(String(result.areas[0])) + "平方米</strong> 周长：" + parseInt(String(result.lengths[0])) + "米");
            // map.infoWindow.show(cPoint);
            }

        on(dom.byId("selectpolygon"), "click", function(event){//选择面
            //单机选择要素
            mapclick  = mapview.on("click",mapClick);

        });
        on(dom.byId("createpolygon"), "click", function(event){//绘图
            mapview.graphics.clear();
            //清除map点击事件
            if(mapclick){
                mapclick.remove();
            }else{

            }

            var polygon_draw = new Draw();
            mapview.focus();
            var polygon_action = polygon_draw.create("polygon")
            polygon_action.on("draw-complete", function (result)
            {
                //获得绘图得到的面
                var geometry=result.geometry;
                //关闭绘图工具
                toolBar.deactivate();
                var symbol = {
                    type: "simple-fill",  // autocasts as new SimpleFillSymbol()
                    color: "red",
                    outline: {  // autocasts as new SimpleLineSymbol()
                        color: [128, 128, 128, 0.5],
                        width: "0.5px"
                    }
                };
                var graphic = new Graphic(geometry,symbol);
                //将点对象存储在点几何中
                //将图形存放在地图中，然后得以显示
                mapview.graphics.add(graphic);

                zdanalygygeometry = geometry;
                zdanalygygraphic = graphic;

                returnquerygeo(zdanalygygeometry);
                toolBar.deactivate();
                //执行空间查询

                //identifyQuery(geometry);
            });

            // //给绘图工具绑定绘图完成事件
            // on(toolBar, "draw-complete", function (result)
            // {
            //     //获得绘图得到的面
            //     var geometry=result.geometry;
            //     //关闭绘图工具
            //     toolBar.deactivate();
            //     var lineSymbol=new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,255,255])).setWidth(2);
            //     //创建面符号
            //     var fill=new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSymbol,new Color([60,255,255,0]));
            //     var graphic = new Graphic(geometry,fill);
            //     //将点对象存储在点几何中
            //     //将图形存放在地图中，然后得以显示
            //     map.graphics.add(graphic);
            //
            //     zdanalygygeometry = geometry;
            //     zdanalygygraphic = graphic;
            //
            //     returnquerygeo(zdanalygygeometry);
            //     toolBar.deactivate();
            //     //执行空间查询
            //
            //     //identifyQuery(geometry);
            // });

        });
		 // -------------------选择一个图层-----------------------------------------//

		
        //-------------------------------------------------------------------------//
        //document.write("<script type='text/javascript' src='jsLib/mainsrc/buttonadepter.js'></script>");
        //var btadepter = new btadepter();
       // btadepter.btadepter();

        $('#view').menubutton({
            menu:'#maptools'
        })
        $('#measure').menubutton({
            menu:'#measuringtools'
        })
        $('#select').menubutton({
            menu:'#selecttools',
            hideOnUnhover:false
        })
        //设置卷帘对比
        on(dom.byId("swipe"), "click", function(event) {//绘图
             $('#swipe_win').window("open");
             $('#swipe_check').combobox({
                url:'/post_swipe_treelist/',
                valueField:'id',
                textField:'text'
        });
        });
        //设置测量单位窗口

        on(dom.byId("set_measure"), "click", function(event) {
             $('#set_win').window("open");
             var data_length = [{'id':0,'text':'米'},{'id':1,'text':'千米'}];
             var data_area = [{'id':0,'text':'平方米'},{'id':1,'text':'平方千米'},{'id':2,'text':'公顷'},{'id':3,'text':'亩'}];

             $('#set_length_measure').combobox({
                 data:data_length,
                 valueField:'id',
                 textField:'text',
                 onSelect: function (returnid) {
                     return_length_id = returnid.id;
                 }
             });
             $('#set_area_measure').combobox({
                 data:data_area,
                 valueField:'id',
                 textField:'text',
                 onSelect: function (returnid) {
                     return_area_id = returnid.id;
                 }
             });
        });
        on(dom.byId("set_measure_ok"), "click", function(event) {

                $('#set_win').window("close");
        });
		
       //创建GP服务
        //定义点几何对象

        var pointSet = new FeatureSet();
        var psymbol ={
              type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
              style: "square",
              color: "blue",
              size: "8px",  // pixels
              outline: {  // autocasts as new SimpleLineSymbol()
                color: [ 255, 255, 0 ],
                width: 3  // points
              }
        };

        on(dom.byId("Btn1"),"click",function(e){

            //定义绘图对象
            var toolBar= new Draw(map, { showTooltips: true });
            //激活绘图对象
            toolBar.activate(esri.toolbars.Draw.POINT);

            on(toolBar, "draw-complete", function(result){
                //获得绘图结束的点对象

                var geometry = result.geometry;

                //根据点对象生成相应的图形
                var graphic = new Graphic(geometry,psymbol);
                //将点对象存储在点几何中
                pointSet.features.push(graphic);
                //将图形存放在地图中，然后得以显示
                map.graphics.add(graphic);
                toolBar.deactivate();


            });
        });
        //导入shp文件窗口
        on(dom.byId("shp_to_polygon_ok"),"click",function(e){
            var form_data = new FormData();
            var file_info =$( '#shpzip_upload')[0].files[0];
            form_data.append('file',file_info);
            //if(file_info==undefined)暂且不许要判断是否有附件 //alert('你没有选择任何文件'); //return false
             $.ajax({
                 url:'/upload_shp/',
                 type:'POST',
                 data: form_data,
                 processData: false, // tell jquery not to process the data
                 contentType: false, // tell jquery not to set contentType
                 success: function(callback) {

                        //var geojsonLayer = new GraphicsLayer();

                        var result = callback;
                        var jsonf = geoJsonConverter();
                        var json = jsonf.toEsri(result);
                        var features = json.features;
                        for(var i=0;i<features.length;i++){
                            var feature = features[i];

                            feature.symbol = {"color":[0,0,0,64],
                                "outline":{"color":[0,0,0,255],
                                    "width":1,
                                    "type":"esriSLS",
                                    "style":"esriSLSSolid"},
                                "type":"esriSFS","style":"esriSFSSolid"};
                                var graphic  = new Graphic(feature);
                                map.graphics.add(graphic);
                                // geojsonLayer.add(graphic);
                        }

                        // map.addLayer(geojsonLayer);
                        alert('加载shp成功！');
                        $("#shp_to_polygon_win").window("close");
                 }

             });
        });
         // 43540159.273,4750304.514;43540194.325,4750305.149;43540198.135,4750262.095;43540160.924,4750264.381
        on(dom.byId("shp_to_polygon_cancel"),"click",function(e){
            $("#shp_to_polygon_win").window("close");
        });

        //导入txt文件窗口
        on(dom.byId("ok"),"click",function(e){

            //定义GP服务对象

            var xyserver = new Geoprocessor("http://localhost:6080/arcgis/rest/services/yztgp/xyarrtopolygon/GPServer/xyarrtopolygon");
            //构建GP服务参数
            var gpParams={};

            gpParams.Input_arr =inputxy;


            //执行GP服务
            xyserver.execute(gpParams,showbufferResult);

        });
        on(dom.byId("cancel"),"click",function(e){

          //取消服务
            $('#txt_to_polygon_win').window("close");

        });



        //创建属性查询对象
        //打开图层

        on(mapview,"onLoad",function(e){

            mapview.disableDoubleClickZoom();

        });
        // buildLayerList(layer7);
		// if (layer7.loaded){
        //
		// 	buildLayerList(layer7);
		// }else{
		//     console.log("过着了");
		// 	dojo.connect(layer7, "onLoad", buildLayerList);
		// }



        //-------------------------------------------------------------------------//
       
        //----------------------清除选择-------------------------------------------//
        on(dom.byId("Clear"),"click",function(e){

            map.graphics.clear();

        })


        //----------------------------------------------------------------//




        //--------------------卷帘对比效果--------------------------------//
        swipe();
        function swipe(){

            var map1toplayer=new MapImageLayer("http://localhost:6080/arcgis/rest/services/yzt/发布1/MapServer",{id:'toplayer'});
            $("#swipe_check").combobox({

               onSelect: function (returnid) {

                   var id = returnid.id
                   if(id!==0){

                        map1toplayer.setVisibleLayers([id-1]);
                        map.addLayer(map1toplayer,1);
                   }else{

                       map.removeLayer(map1toplayer,1);
                       $("input:checkbox").prop("checked",false);
                   }

            　　  }

            });
            $('#swipe_win').window({
                onBeforeClose:function(){
                    map.removeLayer(map1toplayer,1);
                    $("input:checkbox").prop("checked",false);
            }
            });

            var  map1toplayerid=map.id+'_toplayer';
            var map1toplayerdiv=null;
            // console.log(map.id+'_toplayer');
            var isverticalswipe=false;
            var ishorizontalswipe=false;
            on(dom.byId('verticalswipe'),"click",function(){
                isverticalswipe=!isverticalswipe;
           });
            on(dom.byId('horizontalswipe'),"click",function(){
                ishorizontalswipe=!ishorizontalswipe;
           });
            //因为地图在缩放或者平移过程中，承载layer的 div会发生水平或者垂直方向的transform。所以计算出来
            on( map1toplayer,'load',function(){
              on(map,'mouse-move',function(e){
                 map1toplayerdiv=map1toplayerdiv?map1toplayerdiv:document.getElementById(map.id+'_toplayer');
              var  offsetX=e.screenPoint.x;
              var  offsetY=e.screenPoint.y;
              if(map1toplayerdiv){
                  var  mapheightpx=map1toplayerdiv.style.height;
                  var  mapwidthpx=map1toplayerdiv.style.width;
                  var  mapheight=parseInt(mapheightpx.substring(0,mapheightpx.lastIndexOf('px')));//去掉单位px 取出数值
                  var  mapwidth=parseInt(mapwidthpx.substring(0,mapwidthpx.lastIndexOf('px')));
                  var  origin=getLayerTransform(map1toplayerdiv);
                  var  cliptop=-origin.y+"px";
                  var  clipleft=-origin.x+"px";//clip的左上起点
                  var clipbottom,cliplright;
                  clipbottom=ishorizontalswipe?(offsetY-origin.y)+'px':(mapheight-origin.y)+'px';
                  clipright=isverticalswipe?(offsetX-origin.x)+"px":(mapwidth-origin.x)+"px";
                  // console.log('rect('+cliptop+','+clipright+','+clipbottom+','+clipleft+')');
                  map1toplayerdiv.style.clip='rect('+cliptop+','+clipright+','+clipbottom+','+clipleft+')';
              }

              });
            });

            //获取图层右上角的坐标
            function getLayerTransform(layer) {
               // var layer = document.getElementById(layerid);

                var xorigin, yorigin, layerstyle = layer.style;
            //chrome
                if (layerstyle['-webkit-transform']) {
                    var s = layerstyle['-webkit-transform'];//格式为"translate(0px, 0px)"
                    var xyarray = s.replace(/translate\(|px|\s|\)/, '').split(',');
                    xorigin = parseInt(xyarray[0]);
                    yorigin = parseInt(xyarray[1]);
                }
            //firefox
                else if (layerstyle['transform']) {
                    //layer.style['transform'] 格式为"translate3d(xpx,ypx,zpx)" 这样的字符串，现在通过匹配转为[z,y,z]的数组,分别将 px,translate3d,空格
                    // var xyzarray=layerstyle.replace(/px/g,'').replace(/ /g,'').replace('translate3d(','').replace(')','').split(',')
                    var layertransforstring=layerstyle['transform'];
                    var xyz = layertransforstring.replace(/px|\s|translate3d\(|px|\)/g, '').split(',');
                    xorigin = parseInt(xyz[0]);
                    yorigin = parseInt(xyz[1]);
                }
            //ie 8+
                else {
                    xorigin = parseInt(layer.style.left.replace('px', ''));
                    yorigin = parseInt(layer.style.top.replace('px', ''));
                }
                return {
                    x: xorigin,
                    y: yorigin
                }
        }
        }

        //----------------------现状分析----------------------------------//
        on(dom.byId("spatial_xz"),"click",function(e){
            showFigure();

               // var xzfx = new Geoprocessor("http://localhost:6080/arcgis/rest/services/yztgp/ZDAnalygy/GPServer/ZDAnalygy");
               //
               // //构建GP服务参数
               // var gpParams={};
               //
               // var featureset_Input_Features = new FeatureSet();
               // var featureset_Clip_Features = new FeatureSet();
               // var features_Input_Features = [];
               //
               //
               // var features_Clip_Features = [];
               // features_Clip_Features.push(zdanalygygraphic);
               //
               //
               // //返回的图层Id
               //
               //  var layeridlst = [];
               //  //定义显示panel
               //  var panel = null;
               //  var features_Input_Fields_lst = [];
               //  for(var i=0;i<layer0results.length;i++){
               //      var features_Input_Fields = [];
               //      var features_Input_Feat = []
               //      var layerid = layer0results[i].layerId;
               //      layeridlst.push(layerid);
               //      layer0results[i].feature.attributes["layerName"] = layer0results[i].layerName;
               //      layer0results[i].feature.attributes["layerId"] = layer0results[i].layerId;
               //      features_Input_Feat.push(layer0results[i].feature);
               //      features_Input_Features.push(features_Input_Feat);
               //      var fields = layer0results[i].feature.attributes;
               //
               //      $.each(fields, function(key) {
               //          if(key != "Shape_STLe" && key != "Shape_STAr" && key != "Shape" ){
               //              features_Input_Fields.push({ "name":key, "type": "esriFieldTypeString", "alias": key});
               //          }
               //
               //      });
               //
               //      features_Input_Fields_lst.push(features_Input_Fields);
               //
               //  }
               //  features_Input_Fields.push({ "name":"layerName", "type": "esriFieldTypeString", "alias": "layerName"});
               //  features_Input_Fields.push({ "name":"layerId", "type": "esriFieldTypeString", "alias": "layerId"});
               //
               //
               //  var formatData = Overlay_GP_Feautes_format(layeridlst,features_Input_Features,features_Input_Fields_lst);
               //  MaskUtil.mask();
               //  for(var i=0;i<formatData.length;i++) {
               //
               //      featureset_Input_Features.fields = formatData[i].fields;
               //      featureset_Input_Features.features = formatData[i].features;
               //      // featureset_Input_Features.layerid= formatData[i].layerid;
               //      featureset_Clip_Features.features = features_Clip_Features;
               //
               //      gpParams.InputFeatures = featureset_Input_Features;
               //      gpParams.ClipFeatures = featureset_Clip_Features;
               //      // console.log(gpParams);
               //      xzfx.execute(gpParams, showzdanalygyResult)
               //  }
            // $('#showfigure').window("open");

            // $.ajax({
            //         type:'POST',
            //         url : '/post_figure/',
            //         data:{"code":0},
            //         dataType:"json",
            //         success : function(data) {
            //             console.log('here!');
            //             // console.log(data);
            //             // $('#showfigure').window("open");
            //             // showfigure(data.LB,data.DT);
            //
            //         },
            //         error : function() {
            //             alert('error');
            //         }
            //     });
        });
        function showfigure(Label,data){
            var ctx = document.getElementById("myChart").getContext('2d');
            var myChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    // labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
                    labels: Label ,
                    datasets: [{
                        label: '# of Votes',
                        data: data ,
                        // data: [12, 19, 3, 5, 2, 3],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)'
                        ],
                    }]
                },
                options: {
                    responsive: false
                }
            });

        }
        //叠加分析

        //----------------宗地分析----------------------------------------//
        on(dom.byId("spatial_zd"),"click",function(e){

           if(zdanalygygeometry){

               zdfx = new Geoprocessor("http://localhost:6080/arcgis/rest/services/yztgp/ZDAnalygy/GPServer/ZDAnalygy");

               //构建GP服务参数
               var gpParams={};

               var featureset_Input_Features = new FeatureSet();
               var featureset_Clip_Features = new FeatureSet();
               var features_Input_Features = [];


               var features_Clip_Features = [];
               features_Clip_Features.push(zdanalygygraphic);


               //返回的图层Id

                var layeridlst = [];
                //定义显示panel
                var panel = null;
                var features_Input_Fields_lst = [];
                for(var i=0;i<layer0results.length;i++){
                    var features_Input_Fields = [];
                    var features_Input_Feat = []
                    var layerid = layer0results[i].layerId;
                    layeridlst.push(layerid);
                    layer0results[i].feature.attributes["layerName"] = layer0results[i].layerName;
                    layer0results[i].feature.attributes["layerId"] = layer0results[i].layerId;
                    features_Input_Feat.push(layer0results[i].feature);
                    features_Input_Features.push(features_Input_Feat);
                    var fields = layer0results[i].feature.attributes;

                    $.each(fields, function(key) {
                        if(key != "Shape_STLe" && key != "Shape_STAr" && key != "Shape" ){
                            features_Input_Fields.push({ "name":key, "type": "esriFieldTypeString", "alias": key});
                        }

                    });

                    features_Input_Fields_lst.push(features_Input_Fields);

                }
                features_Input_Fields.push({ "name":"layerName", "type": "esriFieldTypeString", "alias": "layerName"});
                features_Input_Fields.push({ "name":"layerId", "type": "esriFieldTypeString", "alias": "layerId"});


                var formatData = Overlay_GP_Feautes_format(layeridlst,features_Input_Features,features_Input_Fields_lst);
                MaskUtil.mask();
                for(var i=0;i<formatData.length;i++){

                    featureset_Input_Features.fields =  formatData[i].fields;
                    featureset_Input_Features.features= formatData[i].features;
                    // featureset_Input_Features.layerid= formatData[i].layerid;
                    featureset_Clip_Features.features = features_Clip_Features;

                    gpParams.InputFeatures   = featureset_Input_Features;
                    gpParams.ClipFeatures    = featureset_Clip_Features;
                    // console.log(gpParams);
                    zdfx.execute(gpParams,showzdanalygyResult);

                }
           }else{
               alert("无可用图");

           }

        });


        function showzdanalygyResult(gpParams) {

            var features = gpParams[0].value.features;

            var newfeatures = [];
            for (var i = 0; i < features.length; i++) {
                var graphic = features[i];
                var att = features[i].attributes;
                var geo = features[i].geometry;

                newfeatures.push({"feature":{"attributes":att,"geometry":geo}});

                var lineSymbol=new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([255,0,0])).setWidth(2);
                //创建面符号
                var fill=new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSymbol,new Color([60,255,255,0]));
                //设置面符号
                graphic.setSymbol(fill);
                map.graphics.add(graphic);
            }

            showAllData( newfeatures);
            MaskUtil.unmask();




        }
        function returnquerygeo(geometry) {
            var return_graphic_set;
            var identifyTask = new IdentifyTask("http://localhost:6080/arcgis/rest/services/yzt/发布1/MapServer");
            //定义空间查询参数对象
            var params = new IdentifyParameters();
            //容差
            params.tolerance = 2;
            //是否返回几何信息
            params.returnGeometry = true;
            //空间查询的图层returnlayer
            params.layerIds = returnlayer;
            //空间查询的条件
            params.layerOption = IdentifyParameters.LAYER_OPTION_ALL;
            params.width = map.width;
            params.height = map.height;
            //空间查询的几何对象
            params.geometry = geometry;
            params.mapExtent = map.extent;
            //console.log(params);
            //query.where="FID=0,1,2";
            identifyTask.execute(params,function(fs){
                layer0results = fs;

            });


        }


        //-------------------------------------------------------------------//
        //绘图选择
        //定义绘图对象
        var toolBar = new Draw(map);
        //绑定点击事件
        on(dom.byId("Btn"),"click",function(e){
            //激活绘图工具：绘制面
            toolBar.activate(esri.toolbars.Draw.POLYGON);

        })
        //给绘图工具绑定绘图完成事件
        on(toolBar, "draw-complete", function (result)
        {
            //获得绘图得到的面
            var geometry=result.geometry;
            //关闭绘图工具
            toolBar.deactivate();

            var psymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CROSS, 12, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 2), new dojo.Color([0, 255, 0, 0.25]));
            var graphic = new Graphic(geometry,psymbol);
            //将点对象存储在点几何中
            //将图形存放在地图中，然后得以显示
            map.graphics.add(graphic);
            //执行空间查询

            //identifyQuery(geometry);
        });

		function showCoordinates(evt){
			
			var mp = evt.mapPoint;
			
			var pointx = mp.x;
			var pointy = mp.y;
			//打开XY显示坐标
			document.getElementById('x').innerText = pointx;
			document.getElementById('y').innerText = pointy;
			
			
		
		}

        function showbufferResult(gpParams){
		    console.log(gpParams);
            var features = gpParams[0].value.features;
            for (var i = 0; i < features.length; i++) {
                var graphic = features[i];

                var lineSymbol=new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,255,255])).setWidth(2);
                //创建面符号
                var fill=new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSymbol,new Color([60,255,255,0]));
                //设置面符号
                graphic.setSymbol(fill);
                map.graphics.add(graphic);
                alert("导入坐标成功！");
                $('#txt_to_polygon_win').window("close");
                zdanalygygeometry = graphic.geometry;
                zdanalygygraphic = graphic;
                returnquerygeo(zdanalygygeometry);
            }
        }
        function showFigure(){
		     var tabId_1,tabId_2,tabId_3,tabId_4,tabId_1_1,tabId_1_2,tabId_1_3,tabId_1_4,producttitle,product_1_title,product_2_title,product_3_title,product_4_title,product_1_1_title,product_1_2_title,product_1_3_title,product_1_4_title;
		     tabId_1 = "tab_1";
		     tabId_2 = "tab_2";
             tabId_3 = "tab_3";
             tabId_4 = "tab_4";
             tabId_1_1 = "tab_1_1";
		     tabId_1_2 = "tab_1_2";
             tabId_1_3 = "tab_1_3";
             tabId_1_4 = "tab_1_4";
		     // producttitle = results[0].feature.attributes.layerName+"分析结果";
             producttitle = "分析结果";
             product_1_title = "汇总";
             product_2_title = "现状图斑分析";
             product_3_title = "零星地物分析";
             product_4_title = "线状地物分析";
             product_1_1_title = "三大类统计";
             product_1_2_title = "图斑分类统计";
             product_1_3_title = "按权属统计";
             product_1_4_title = "按权属单位统计";
             var productcontents_1 = "<div id='"+tabId_1+"' class=\"easyui-tabs\" style=\"width: 100%; height:100%;\"data-options=\"fit:true\"></div>";
             var productcontents_2 = "<div id='"+tabId_2+"' class=\"easyui-tabs\" style=\"width: 100%; height:100%;\"data-options=\"fit:true\"></div>";

		     var product_2_1_contents = "<div id='"+tabId_1_1+"></div>";
		     var product_2_2_contents = "<div id='"+tabId_1_2+"></div>";
		     var product_2_3_contents = "<div id='"+tabId_1_3+"></div>";
		     var product_2_4_contents = "<div id='"+tabId_1_4+"></div>";
		      $('#Table_Tab').tabs('add',{
                      title:producttitle,
                      showHeader:true,
                      closable:true,
                      content:productcontents_1
		      });

               $('#'+tabId_1).tabs('add',{
                  title:product_1_title,
                  showHeader:true,
                  closable:false,
                  content:productcontents_2
		      });
               $('#'+tabId_1).tabs('add',{
                  title:product_2_title,
                  showHeader:true,
                  closable:false,
                  content:productcontents_2
		      });
               $('#'+tabId_1).tabs('add',{
                  title:product_3_title,
                  showHeader:true,
                  closable:false,
                  content:productcontents_2
		      });
               $('#'+tabId_1).tabs('add',{
                  title:product_4_title,
                  showHeader:true,
                  closable:false,
                  content:productcontents_2
		      });


               $('#'+tabId_2).tabs('add',{
                  title:product_1_1_title,
                  showHeader:true,
                  closable:false,
                  content:product_2_1_contents
		      });
               $('#'+tabId_2).tabs('add',{
                  title:product_1_2_title,
                  showHeader:true,
                  closable:false,
                  content:product_2_2_contents
		      });
               $('#'+tabId_2).tabs('add',{
                  title:product_1_3_title,
                  showHeader:true,
                  closable:false,
                  content:product_2_3_contents
		      });
               $('#'+tabId_2).tabs('add',{
                  title:product_1_4_title,
                  showHeader:true,
                  closable:false,
                  content:product_2_4_contents
		      });



        }
        function showAllData(results){

		    //图层查询结果
             var tableId,producttitle;
             console.log(results);
		     if(results[0].layerId){
		          tableId = "dg_search"+results[0].layerId;
		          producttitle = results[0].layerName+"查询结果";
             }else{
		          tableId = "dg_analygy"+results[0].feature.attributes.layerId;
		          producttitle = results[0].feature.attributes.layerName+"分析结果";

             }
             console.log(tableId);

		     var productcontents = "<table id='"+tableId+"' data-options=\"fitColumns:true,singleSelect:true,rownumbers:true\" pagination=\"true\"  fit=\"true\"></table>";

		     var num = 0;
		     if ($('#Table_Tab').tabs('exists', producttitle)) {
                 $('#Table_Tab').tabs('select', producttitle+num);
             } else {
		         $('#Table_Tab').tabs('add',{
                  title:producttitle,
                  showHeader:true,
                  closable:true,
                  content:productcontents
                 });
             }
             num = num + 1;


		     loadData(results,tableId);
		}
        function loadData(results,tableId,layerName){

            // console.log("results")
            // console.log(results);
            var shpdata = [];
            //清空原DIV
            //map.graphics.clear();

            if(results.length!==0){
                var items = [];

                for (var i = 0; i < results.length; i++) {

                    items.push(results[i].feature.attributes);//append each attribute list as item in store
                    shpdata.push(results[i]);


                }

                var data = {items: items};

                var arr=[];
                arr.push({field:"ck",checkbox : true});
                for(var key in items[0]){


                    arr.push({field:key,title:key})
                    }

                var varusers = {"field":arr,"data":data.items};

                // $('#dg').datagrid('reload');

                //选择数据
                $("#"+tableId).datagrid({
                    //选择行 定位
                    onClickRow: function (index, row) {
                        selectdatagrid(tableId,results);
                    }
                });


                // console.log(curSelectRow);
                // 传递服务器查询到的所有数据
                 $.ajax({
                        type:'POST',
                        data:JSON.stringify(varusers.data),
                        contentType :'application/json',
                        dataType:'json',
                        url :'/get_attributes/',
                        success :function(data) {
                            console.log('postdata success!')
                        },
                        error :function(e) {
                            alert("error");
                        }
                 });
                 // $('#dg').datagrid({singleSelect:(this.value==0)});
                 //从服务器读取加载数据和分页
                 $("#"+tableId).datagrid({
                     url:'/post_datagrid_page/',

                     singleSelect:false,
                     async:false,//同步
                     method:'get',
                     columns: [varusers.field],   //动态取标题
                     idField:'FID',
                     toolbar:[{
                         text:'导出shp文件',
                         iconCls:'icon-export',
                        handler:function () {
                             var row = $("#"+tableId).datagrid('getSelections');
                             var selectedfeatures = [];
                             if(row){

                                 for (var i = 0, il = results.length; i < il; i++) {

                                    var currentGraphic = results[i];

                                    for(var k=0;k<row.length;k++){
                                         var gridFid = row[k].FID;
                                         if ((currentGraphic.feature.attributes) && currentGraphic.feature.attributes.FID == gridFid) {
                                             selectedfeatures.push(currentGraphic) ;

                                         }
                                    }

                                 }

                                 if(results[0].layerId){

                                 }else{
                                     //加入layerid和layername两个key
                                      var layerName = results[0].feature.attributes.layerName;
                                      var layerId = results[0].feature.attributes.layerId;
                                      selectedfeatures[0].layerName = layerName;
                                      selectedfeatures[0].layerId = layerId


                                 }
                                 var postfeatures = {};
                                 postfeatures["geojson"]=selectedfeatures;
                                 $.ajax({
                                    type:'POST',
                                    data:JSON.stringify(postfeatures),
                                    contentType :'application/json',
                                    dataType:'json',
                                    url :'/get_attributes/',
                                    success :function(data) {
                                        window.location.href='/Geojsontoshp/';
                                        console.log('getdata success!');
                                    },
                                    error :function(e) {
                                        alert("error");
                                    }
                                });



                            }



                        }
                     },{
                        text:'导出属性表',
                        iconCls:'icon-export',
                        handler:function () {
                           //IE浏览器使用
                             // var rows = $('#dg').datagrid('getRows');
                             //  var columns = $("#dg").datagrid("options").columns[0];
                             //  var oXL = new ActiveXObject("Excel.Application"); //创建AX对象excel
                             //  var oWB = oXL.Workbooks.Add(); //获取workbook对象
                             //  var oSheet = oWB.ActiveSheet; //激活当前sheet
                             //  //设置工作薄名称
                             //  oSheet.name = "导出Excel报表";
                             //  //设置表头
                             //  for (var i = 0; i < columns.length; i++) {
                             //    oSheet.Cells(1, i+1).value = columns[i].title;
                             //  }
                             //  //设置内容部分
                             //  for (var i = 0; i < rows.length; i++) {
                             //    //动态获取每一行每一列的数据值
                             //    for (var j = 0; j < columns.length; j++) {
                             //      oSheet.Cells(i + 2, j+1).value = rows[i][columns[j].field];
                             //    }
                             //  }
                             //  oXL.Visible = true; //设置excel可见属性

                            var current_page_rows =  $("#"+tableId).datagrid("getSelections");
                            console.log(current_page_rows)
                            //浏览器专用
                             $.ajax({
                                    type:'POST',
                                    data:JSON.stringify(current_page_rows),
                                    contentType :'application/json',
                                    dataType:'json',
                                    url :'/get_attributes/',
                                    success :function(data) {
                                        console.log('postdata success!')
                                        window.location.href='/export_excel/';
                                    },
                                    error :function(e) {
                                        alert("error");
                                    }
                                });


                        }//动态取标题
                     }],
                     pagination:true
                });
                $("#"+tableId).datagrid('reload');

            }else{
                 $.messager.alert("警告","未查询到结果！");
            }
		}



        function selectdatagrid(tableId,results) {
            map.graphics.clear();
            var row = $('#'+tableId).datagrid('getSelected');
            if(row){
                var selectedTaxLot;
                for (var i = 0, il = results.length; i < il; i++) {
                    var currentGraphic = results[i];

                    var gridFid = row.FID;
                    if ((currentGraphic.feature.attributes) && currentGraphic.feature.attributes.FID == gridFid) {
                        selectedTaxLot = currentGraphic;
                        break;
                    }
                }
                var taxLotExtent = selectedTaxLot.feature.geometry.getExtent();
                var graphic = selectedTaxLot.feature; //表格一行显示一条要素
                //将选择的属性缩放至图层
                map.setExtent(taxLotExtent);
                var lineSymbol=new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,255,255])).setWidth(2);
                //创建面符号
                var fill=new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSymbol,new Color([60,255,255,0]));

                graphic.setSymbol(fill);
                map.graphics.add(graphic);
            }else{
                alert("无点击要素");
            }

        }
        function mapClick(e){
            //map.disableDoubleClickZoom();
            //获得用户点击的地图坐标
            point=e.mapPoint;
			
			
            //实例化查询对象

            
			
			//定义空间查询对象，注意他的参数是整个地图服务，而不是单个图层
            var identifyTask = new IdentifyTask("http://localhost:6080/arcgis/rest/services/yzt/发布1/MapServer");
            //定义空间查询参数对象
            var params = new IdentifyParameters();
            //容差
            params.tolerance = 1;
            //是否返回几何信息
            params.returnGeometry = true;
            //空间查询的图层，此时是返回的图层
			//去掉显示图层ID的重复值
			Array.prototype.unique=function(){
				var newArr = [this[0]];
				for(var i=0,len=this.length;i<len;i++){
					var repeat=false;
					for(var j=0,len2=newArr.length;j<len2;j++){
						if(this[i]==newArr[j]){
							repeat=true;
							break;
						}
					}
					if(!repeat){
						newArr.push(this[i]);
					}
				}
				return newArr;
			};
			
            params.layerIds = returnlayer.unique(returnlayer);

			
            //空间查询的条件
            params.layerOption = IdentifyParameters.LAYER_OPTION_ALL;
			
            params.width = map.width;
            params.height = map.height;
            //空间查询的几何对象
            params.geometry = point;
            params.mapExtent = map.extent;
            //执行空间查询
            identifyTask.execute(params,showFindResult);

        }
        function showFindResult(queryResult)
		
        {
            //1.定义面的边界线符号

            var outline= new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,255,255])).setWidth(2);

            //2.定义面符号
            var PolygonSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, outline,new Color([60,255,255,0]));
            //一次只选择一个要素
            map.graphics.clear();
            if (queryResult.length == 0) {
                $.messager.alert("警告","未发现任何要素");
                return;
            }
            //var items = [];
            var htmls = "<table width='100%'>";

            for (var i = 0; i < queryResult.length; i++) {
                //获得该图形的形状
				
                var result = queryResult[i];
				
				
                var graphic = result.feature;
                    //设置图形的符号
                graphic.setSymbol(PolygonSymbol);
				
               
				map.graphics.add(graphic);
                // feature.setSymbol(fill);
                
                //所有属性  如果是单条属性》》feature.attributes.["字段名称"]
                //根据图层设置显示查询属性的样式
				var layfrom = result.layerName;
				var ss = result.feature.attributes;


                htmls = htmls + "<tr bgcolor=\"#E0E0E0\" ><td bgcolor=\"#E0E0E0\" align='center'> 图层来源 </td>"+"<td bgcolor=\"#E0E0E0\" align='center'>"+layfrom+"</td></tr>"

                for(var key in ss){
                    //去掉影像图层读取
                    if (layfrom.length !== 0){
                        htmls = htmls + "<td  align='center'>"+ key+"<td  align='center'>"+ss[key]+"</td></tr>";
                    }else{
                    }
                   // console.log(key,ss[key])
                }

                //htmls = htmls + "< bgcolor=\"#E0E0E0\" align='center'><td align='center'>"+layfrom+"</td>"
                /*
                if(layfrom == "城区规划2013"){
                    htmls = htmls + "<tr><td align='center'> 图层来源 </td><td align='center'> 类别代 </td><td align='center'> 行政区名称</td><td align='center' > 土地利用现</td><td align='center' > 土地利用总</td></tr>";
                    var XZQDM = result.feature.attributes["XZQDM"];
                    var XZQMC = result.feature.attributes["XZQMC"];
                    var TDLIX = result.feature.attributes["土地利用现"];
                    var TDLIZ = result.feature.attributes["土地利用总"];
                    //去掉影像图层读取
                    if (layfrom.length !== 0){
                        htmls = htmls + "<tr bgcolor=\"#E0E0E0\" align='center'><td align='center'>"+layfrom+"</td><td align='center'>" + XZQDM + "</td><td align='center'>" + XZQMC + "</td>"+"<td align='center'>"+TDLIX+"</td><td align='center'>"+TDLIZ+"</td></tr>";
                    }else{

                    }
                } else if(layfrom == "建设用地供地界限"){
                    htmls = htmls + "<tr><td align='center'> 图层来源 </td><td align='center'> 供地编码 </td><td align='center'> 供地名称</td></tr>";
                    var GDBM = result.feature.attributes["供地编码"];
                    var GDMC = result.feature.attributes["供地名称"];

                    //去掉影像图层读取
                    if (layfrom.length !== 0){
                        htmls = htmls + "<tr bgcolor=\"#E0E0E0\" align='center'><td align='center'>"+layfrom+"</td><td align='center'>" + GDBM + "</td><td align='center'>" + GDMC + "</td></tr>";
                    }else{

                    }
                }*/

                
                // items.push(queryResult.features[i].attributes);

            }
            htmls = htmls + "</table>";
            var $win_showsearchdata;
            $win_showsearchdata =  $('#showsearchdata').window({
                title: '查询结果',

                width: 400,
                height: 400,

                resizable:false,
            });

            document.getElementById("showhtmldata").innerHTML = htmls;
            $win_showsearchdata.window("open");


			// map.infoWindow.setTitle("查询结果");
			// map.infoWindow.setContent(htmls);
            // map.infoWindow.resize(400,300);
			// map.infoWindow.show(point);

            mapclick.remove()

        }

        //-------------------------------------------------------------------//
        //------------------单选结束-----------------------------------------//




        //-------------------------------------------------------------------//
        //------------------绘图选择-----------------------------------------//
        function identifyQuery(geometry) {
            //定义空间查询对象，注意他的参数是整个地图服务，而不是单个图层
            var identifyTask = new IdentifyTask("http://localhost:6080/arcgis/rest/services/yzt/发布1/MapServer");
            //定义空间查询参数对象
            var params = new IdentifyParameters();
            //容差
            params.tolerance = 5;
            //是否返回几何信息
            params.returnGeometry = true;
            //空间查询的图层，此时是三个图层
            params.layerIds = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18];
            //空间查询的条件
            params.layerOption = IdentifyParameters.LAYER_OPTION_ALL;
            params.width = map.width;
            params.height = map.height;
            //空间查询的几何对象
            params.geometry = geometry;
            params.mapExtent = map.extent;
            //执行空间查询
            identifyTask.execute(params,showQueryResult);
        }
        //通过此函数处理查询之后的信息
        function showQueryResult(idResults) {
            map.graphics.clear();
            //创建线符号
            var lineSymbol=new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,255,255])).setWidth(2);
            //创建面符号
            var fill=new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSymbol,new Color([60,255,255,0]));
            if (idResults.length > 0) {
                var htmls = "<table style=\"width: 100%\">";
                htmls = htmls + "<tr><td> 图层 </td><td> FID</td><td> XZQMC</td></tr>";
                for (var i = 0; i < idResults.length; i++) {
                    var result = idResults[i];
                    //获得图形graphic
                    var graphic = result.feature;
                    //设置图形的符号
                    graphic.setSymbol(fill);
                    //获得FID----属性的名称信息
                    var namevalue1 = result.feature.attributes.FID;
                    var namevalue = result.feature.attributes.XZQMC;
                    if (i % 2 == 1) {
                        htmls = htmls + "<tr  bgcolor=\"#E0E0E0\"><td>" +
                            result.layerName + "</td><td>" + namevalue1 + "</td>"+"<td>"+namevalue+"</td></tr>";
                    }
                    else {
                        htmls = htmls + "<tr><td>" + result.layerName + "</td><td>" + namevalue1 + "</td>"+"<td>"+namevalue+"</td></tr>";
                    }

                    map.graphics.add(graphic);
                }
                htmls = htmls + "</table>";
                document.getElementById("dg").innerHTML = htmls;
            }
            else {
                document.getElementById("dg").innerHTML = "";
            }
        }
        //-----------------------绘图结束------------------------------------//

















        //-------------------------------------------------------------------//
        //string.format
        String.format = function ()
            {
                var param = [];
                for (var i = 0, l = arguments.length; i < l; i++)
                {
                    param.push(arguments[i]);
                }
                var statment = param[0]; // get the first element(the original statement)
                param.shift(); // remove the first element from array
                return statment.replace(/\{(\d+)\}/g, function(m, n)
                {
                    return param[n];
                });
            }
        //------------------------树图层-------------------------------------//
		
        function getChildrenNodes(parentnodes, node) {
            for (var i = parentnodes.length - 1; i >= 0; i--) {

                var pnode = parentnodes[i];
                //如果是父子关系，为父节点增加子节点，退出for循环
                if (pnode.id == node.pid) {
                    pnode.state = "closed";//关闭二级树
                    pnode.children.push(node);
                    return;
                } else {
                    //如果不是父子关系，删除父节点栈里当前的节点，
                    //继续此次循环，直到确定父子关系或不存在退出for循环
                    parentnodes.pop();
                }
            }
        }

        function buildLayerList(layer) {
            //构建图层树形结构

            var layerinfos = layer.layerInfos;

			//图层控制通过MXD控制
			/*var layerinfos = [
								{'id':0,'name':'乡镇界线','parentLayerId':-1,'defaultVisibility':true},
								{'id':1,'name':'建设用地供地界线','parentLayerId':-1,'defaultVisibility':true},
								{'id':2,'name':'地籍宗地','parentLayerId':-1,'defaultVisibility':true},
								{'id':3,'name':'建设用地管制区','parentLayerId':-1,'defaultVisibility':true},
								{'id':4,'name':'土地规划地类','parentLayerId':-1,'defaultVisibility':true},
								{'id':5,'name':'全国第二次土地调查','parentLayerId':-1,'defaultVisibility':true}
							  ]*/

			
            var treeList = [];//jquery-easyui的tree用到的tree_data.json数组
            var parentnodes = [];//保存所有的父亲节点
            var root = [{"id": "rootnode", "text": "基础地理要素", "children": [{"id":"rootnode","text":"乡镇界线","children":[{"id":0,"text":"乡镇界线"}],"state":"closed"},
                                                                                    {"id":"rootnode","text":"地籍子区","children":[{"id":1,"text":"地籍子区"}],"state":"closed"},
                                                                                    {"id":"rootnode","text":"地籍区","children":[{"id":2,"text":"地籍区"}],"state":"closed"},
                                                                                    {"id":"rootnode","text":"图幅索引","children":[{"id":"rootnode","text":"图幅索引"}],"state":"closed"}],"state":"closed"},

						{"id": 0, "text": "延吉市城区规划", "children": [{"id":"rootnode","text":"道路","children":[{"id":"rootnode","text":"支路","children":[{"id":"rootnode","text":"支路"}],"state":"closed"},
                                                                                                                            {"id":"rootnode","text":"次干道","children":[{"id":"rootnode","text":"次干道"}],"state":"closed"},
                                                                                                                            {"id":3,"text":"主干道","children":[{"id":"rootnode","text":"主干道"}],"state":"closed"}],"state":"closed"},
                                                                            {"id":"rootnode","text":"城区规划","children":[{"id":"rootnode","text":"城区规划2016"},
                                                                                                                                {"id":4,"text":"城区规划2013"}],"state":"closed"}],"state":"closed"},


						{"id": "rootnode", "text": "建设用地审批", "children": [{"id":"rootnode","text":"集体建设用地审批", "children":[{"id":"rootnode","text":"集体建设用地审批"}],"state":"closed"},
                                                                                    {"id":"rootnode","text":"建设用地供应界线", "children":[{"id":5,"text":"建设用地供应界线"}],"state":"closed"}],"state":"closed"},


						{"id": "rootnode", "text": "专项工作", "children": [{"id":"rootnode","text":"农用地调查库", "children":[{"id":"rootnode","text":"农用地调查相关数据"}],"state":"closed"},
                                                                                {"id":"rootnode","text":"省厅备案界线", "children":[{"id":"rootnode","text":"省厅备案界线"}],"state":"closed"},
                                                                                {"id":"rootnode","text":"拟征地界线", "children":[{"id":"rootnode","text":"拟征地界线"}],"state":"closed"},
                                                                                {"id":"rootnode","text":"国有供地勘测数据", "children":[{"id":"rootnode","text":"国有供地勘测数据"}],"state":"closed"},
                                                                                {"id":"rootnode","text":"设施农用地", "children":[{"id":"rootnode","text":"设施农用地"}],"state":"closed"},
                                                                                {"id":"rootnode","text":"临时用地", "children":[{"id":6,"text":"临时用地"}],"state":"closed"},
                                                                                {"id":"rootnode","text":"征地界线", "children":[{"id":7,"text":"征地界线"}],"state":"closed"},
                                                                                {"id":"rootnode","text":"农用地分等定级", "children":[{"id":"rootnode","text":"农用地分等定级"}],"state":"closed"},
                                                                                {"id":"rootnode","text":"土地储备", "children":[{"id":8,"text":"土地储备"}],"state":"closed"}],"state":"closed"},
						
						
						{"id": "rootnode", "text": "专题数据库", "children": [
							{"id":"rootnode","text":"地籍数据库","children":[{"id":"rootnode","text":"使用权","children":[{"id":"rootnode","text":"房屋"},{"id":9,"text":"宗地"}]}],"state":"closed"},
                                                                                {"id":"rootnode","text":"所有权","children":[{"id":10,"text":"所有权宗地"}],"state":"closed"},
                                                                                {"id":"rootnode","text":"耕地资源","children":[{"id":11,"text":"耕地资源"}],"state":"closed"},
                                                                                {"id":"rootnode","text":"基本农田划定","children":[{"id":"rootnode","text":"基本农田划定"}],"state":"closed"},
                                                                                {"id":"rootnode","text":"基本农田数据库","children":[{"id":12,"text":"基本农田保护区2013"}],"state":"closed"},
                                                                                {"id":"rootnode","text":"土地利用总体规划数据库","children":[{"id":"rootnode","text":"2016年建设用地管制区"},
                                                                                                                                                    {"id":13,"text":"2013年建设用地管制区"}],"state":"closed"},
                                                                                {"id":"rootnode","text":"农村土地承包经营权","children":[{"id":14,"text":"农村土地承包经营权"}],"state":"closed"},
                                                                                {"id":"rootnode","text":"基准地价数据库","children":[{"id":15,"text":"工业用地级别基准地价2016"},
                                                                                                                                            {"id":"rootnode","text":"商服用地级别基准地价2016"},
                                                                                                                                            {"id":"rootnode","text":"住宅用地级别基准地价2016"},
                                                                                                                                            {"id":"rootnode","text":"基准地价图2016"},
                                                                                                                                            {"id":"rootnode","text":"基准地价图2010"}],"state":"closed"}],"state":"closed"},
						{"id": "rootnode", "text": "土地利用现状数据库", "children": [{"id":"rootnode","text":"全国第二次土地调查","children": [{"id":16,"text":"地类图斑2016"}],"state":"closed"},
                                                                                            {"id":"rootnode","text":"全国第一次次土地调查","children": [],"state":"closed"}],"state":"closed"},
						{"id": "rootnode", "text": "关系单位", "children": [{"id":"rootnode","text":"民政","children": [{"id":"rootnode","text":"民政社区界线","children": [{"id":"rootnode","text":"民政社区界线"}],"state":"closed"},
                                                                                                                                {"id":"rootnode","text":"民政街道界线","children": [{"id":17,"text":"民政街道界线"}],"state":"closed"}],"state":"closed"},
                                                                                {"id":"rootnode","text":"林业","children": [ {"id":18,"text":"林斑图2014"}],"state":"closed"}],"state":"closed"},
						{"id": "rootnode", "text": "遥感影像", "children": [{"id":"rootnode","text":"2016年度","children": [{"id":"rootnode","text":"影像2016年"}],"state":"closed"}],"state":"closed"}
						
						];//增加一个根节点
			//
            var node = {};
			
			if (layerinfos != null && layerinfos.length > 0) {
				for (var i = 0, j = layerinfos.length; i < j; i++) {
					var info = layerinfos[i];
					if (info.defaultVisibility) {

						//visible.push(info.id);

						//node为tree用到的json数据
						/*
						if (info.id == 0){
							node = {
							"id": info.id,
							"text": info.name,
							"pid": info.parentLayerId,
							"checked": false,
							"children": []
							};
							parentnodes.push(node);
							root[1].children.push(node);

						}
						else if (info.id == 1){
							node = {
							"id": info.id,
							"text": info.name,
							"pid": info.parentLayerId,
							"checked": false,
							"children": []
							};
							parentnodes.push(node);
							root[2].children.push(node);

						}

						else if (info.id ==3 || info.id ==2 || info.id ==4){
							node = {
							"id": info.id,
							"text": info.name,
							"pid": info.parentLayerId,
							"checked": false,
							"children": []
							};
							parentnodes.push(node);
							root[4].children.push(node);

						}

						else if (info.id == 5 ){
							node = {
							"id": info.id,
							"text": info.name,
							"pid": info.parentLayerId,
							"checked": false,
							"children": []
							};

							parentnodes.push(node);
							root[5].children.push(node);

						}
						*/
						/*
						else{
							node = {
								"id": info.id,
								"text": info.name,
								"pid": info.parentLayerId,
								"checked": false,
								"children": []
							};

							if (info.parentLayerId == -1) {
								parentnodes.push(node);

								root[1].children.push(node);
								root[2].children.push(node);
								root[3].children.push(node);
								root[4].children.push(node);
								root[5].children.push(node);
								root[6].children.push(node);
								root[7].children.push(node);
							} else {
								getChildrenNodes(parentnodes, node);
								parentnodes.push(node);
							}
						}
						*/
					}
				}
			}
			
			
			
			for (var i=0,j=root.length;i<j;i++){
				treeList.push(root[i]);
			}


            //jquery-easyui的树
            $('#toc').tree({
                data: treeList,
				lines:true,//是否显示线条
				animate:true,//是否显示动画效果
                checkbox: true, //使节点增加选择框
				dnd:true,//是否启用拖放
				
                onCheck: function (node, checked) {//更新显示选择的图层
                    var visible = [];
                    var nodes = $('#toc').tree("getChecked");
					
                    dojo.forEach(nodes, function (node) {
						function removeByValue(arr,val){
						for(var i = 0;i<arr.length;i++){
							if (arr[i] == val){
								arr.splice(i,1);
								
							}
						}
					}
					
					removeByValue(visible,"rootnode");

                        visible.push({"id":node.id,"visible":true});
						layernode = node.id;


						return layernode
						
                    });
                    //if there aren't any layers visible set the array to be -1
					
                    if (visible.length === 0) {
                        visible.push(-1);
                    }
					function removeByValue(arr,val){
						for(var i = 0;i<arr.length;i++){
							if (arr[i] == val){
								arr.splice(i,1);
								
							}
						}
					}
					
					removeByValue(visible,"rootnode");
                    // layer7.sublayers setVisibleLayers(visible);
                    layer7.sublayers = visible;
					map.add(layer7,0);
					returnlayer = visible;


					return returnlayer;
					
					/*
					map.addLayer(layer2);
					map.addLayer(layer3);
					map.addLayer(layer4);
					map.addLayer(layer5);
					*/
					//map.addLayers(layer1,layer2,layer3);
                }
				
            });
		
            //layer.setVisibleLayers(visible);
			
            //map.addLayer(layer1);
			

			
        }
        // //定义删除列表内指定元素
        // Array.prototype.indexOf = function(val) {
        //                     for (var i = 0; i < this.length; i++) {
        //                     if (this[i] == val) return i;
        //                     }
        //                     return -1;
        //                     };
        // Array.prototype.remove = function(val) {
        //     var index = this.indexOf(val);
        //     if (index > -1) {
        //     this.splice(index, 1);
        //     }
        //     };
        function Overlay_GP_Feautes_format(arr,features,fields) {
            var c = [];

            for(var i =0;i<arr.length;i++){
                var e = {};
                e["layerid"] = arr[i];
                e["fields"] = fields[i];
                e["features"] = features[i];
                c.push(e);
            }
            function returnnewdata(arr){
                var map = {},
                    dest = [];
                for(var i = 0; i < arr.length; i++){
                    var ai = arr[i];
                    if(!map[ai.layerid]){
                        dest.push({
                            layerid: ai.layerid,
                            fields: ai.fields,
                            features: [ai.features[0]]
                        });
                        map[ai.layerid] = ai;x
                    }else{
                        for(var j = 0; j < dest.length; j++){
                            var dj = dest[j];
                            if(dj.layerid == ai.layerid){
                                dj.features.push(ai.features[0]);
                                break;
                            }
                        }
                    }
                }
                return dest;

            }
            return returnnewdata(c)
        }

                // MaskUtil Start
        var MaskUtil = (function(){

                var $mask,$maskMsg;

                var defMsg = '正在处理，请稍待。。。';

                function init(){
                    if(!$mask){
                        $mask = $("<div></div>")
                        .css({
                          'position' : 'absolute'
                          ,'left' : '0'
                          ,'top' : '0'
                          ,'width' : '100%'
                          ,'height' : '100%'
                          ,'opacity' : '0.3'
                          ,'filter' : 'alpha(opacity=30)'
                          ,'display' : 'none'
                          ,'background-color': '#ccc'
                        })
                        .appendTo("body");
                    }
                    if(!$maskMsg){
                        $maskMsg = $("<div></div>")
                            .css({
                              'position': 'absolute'
                              ,'top': '50%'
                              ,'margin-top': '-20px'
                              ,'padding': '5px 20px 5px 20px'
                              ,'width': 'auto'
                              ,'border-width': '1px'
                              ,'border-style': 'solid'
                              ,'display': 'none'
                              ,'background-color': '#ffffff'
                              ,'font-size':'14px'
                            })
                            .appendTo("body");
                    }

                    $mask.css({width:"100%",height:$(document).height()});

                    var scrollTop = $(document.body).scrollTop();

                    $maskMsg.css({
                        left:( $(document.body).outerWidth(true) - 190 ) / 2
                        ,top:( ($(window).height() - 45) / 2 ) + scrollTop
                    });

                }

                return {
                    mask:function(msg){
                        init();
                        $mask.show();
                        $maskMsg.html(msg||defMsg).show();
                    }
                    ,unmask:function(){
                        $mask.hide();
                        $maskMsg.hide();
                    }
                }

            }());

            // MaskUtil End

    });

