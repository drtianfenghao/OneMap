/**
 * Created by 59308 on 2017/3/8 0008.
 */
/**
 *
 */
/**
 * Created by TianFenghao on 2017/2/28 0028.
 */
var map,layer7,visible=[];
var returnlayer;
var findTask, findParams,map;
var grid, store;
var select_search_layer;
var point;
var layernode;
var findtaskresults;
var inputxy;
var mapclick;
var zdanalygygeometry;
var zdanalygygraphic;
var returnquerygeographic_set;
var layer0results;
var zdfx;
var geometryService
var measuregeometry;
require(["esri/map","dojo/query","dojo/on","dojo/dom","dojo/data/ItemFileWriteStore","dojox/grid/DataGrid","esri/dijit/InfoWindow",
        "esri/toolbars/navigation",
        "esri/geometry/Point",
        "esri/tasks/FeatureSet",
        "esri/tasks/LinearUnit",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/SpatialReference",
        "esri/geometry/Extent",
        "esri/tasks/Geoprocessor",
        "esri/layers/ArcGISDynamicMapServiceLayer",

        "esri/tasks/QueryTask",
        "esri/tasks/FindTask",
        "esri/tasks/FindParameters",
        "esri/tasks/IdentifyTask",
        "esri/tasks/IdentifyParameters",
        "esri/toolbars/draw",
        "esri/tasks/query",
        "esri/symbols/SimpleLineSymbol",
        "esri/symbols/SimpleFillSymbol",
        "esri/Color",
        "esri/graphic",

        "esri/tasks/LengthsParameters",
        "esri/tasks/AreasAndLengthsParameters",
        "esri/tasks/GeometryService",

        "dojo/domReady!"],

    function (Map,query,on,dom,ItemFileWriteStore,DataGrid,InfoWindow,Navigation,Point,FeatureSet,LinearUnit,SimpleMarkerSymbol,SpatialReference,Extent,Geoprocessor,ArcGISDynamicMapServiceLayer,QueryTask,FindTask,FindParameters,IdentifyTask,IdentifyParameters,Draw,Query,SimpleLineSymbol,SimpleFillSymbol,Color,Graphic) {
        //给DataGrid添加行点击事件
        //dojo.connect(gridWidget, "onRowClick", onRowClickHandler);


		
        map = new Map("mapDiv",{
            logo:false,
            slider: false,
        });
        var startExtent = new Extent(4.350168691E7, 4737552.525599999, 4.35566068723E7, 4808331.690125,
            new SpatialReference({ wkid:2367 }) );
        map.setExtent(startExtent);
        //全图显示 43526829.96, 4773574.14
        //map.setExtent(new Extent(4.3496370920343935E7,4762736.490883933, 4.356192121985406E7, 4811768.1149175),new SpatialReference({wkid:2367}))

		//显示XY坐标//打开XY显示坐标
		dojo.connect(map, "onMouseMove", showCoordinates);
		
		//显示比例尺

        //取消地图双击缩放
        on(map,"dbl-click",function(e){
            map.disableDoubleClickZoom();
        })
        var navToolbar = new Navigation(map);
        on(dom.byId("full_extent"), "click", function(event){//全图
            //navToolbar.zoomToFullExtent();
            map.setExtent(startExtent);

        });
        on(dom.byId("pan"), "click", function(event){//平移
            map.setMapCursor("url(cursor/pan.cur),auto");
            navToolbar.activate(Navigation.PAN);
        });
        on(dom.byId("zoom_in"), "click", function(event){//拉框放大
            map.setMapCursor("url(cursor/zoom-in.cur),auto");
            navToolbar.activate(Navigation.ZOOM_IN);
        });
        on(dom.byId("zoom_out"), "click", function(event){//拉框缩小
            map.setMapCursor("url(cursor/zoom-out.cur),auto");
            navToolbar.activate(esri.toolbars.Navigation.ZOOM_OUT);
        });

        /*设置缩放后恢复平移
         navToolbar.on("extent-history-change", function(){
         map.setMapCursor("default");
         navToolbar.deactivate();
         });
         */

        //=====================================================================================================================================//
        //地图服务的URL
        //var layer = new ArcGISDynamicMapServiceLayer("http://localhost:6080/arcgis/rest/services/shiyan/实验/MapServer");
		

		layer7 = new ArcGISDynamicMapServiceLayer("http://localhost:6080/arcgis/rest/services/yzt/发布1/MapServer");
		//console.log(layer7);
        //=================================读取所有属性===========================================/
		

        //====================================读取属性结束=========================================/

        $('#jqsearch').searchbox({
            searcher:function(value,name) {
                findTask = new FindTask("http://localhost:6080/arcgis/rest/services/yzt/发布1/MapServer");
                findParams = new FindParameters();
                findParams.returnGeometry = true;
                findParams.layerIds = [""+name+""];
                select_search_layer = name;
                //选择图层自动筛选条件字段
                console.log(name);
                if(value){
                    findParams.searchText =  value;
                    if(name == 0){
                        findParams.searchFields = ["JSMJ"];
                    }else if(name == 1){
                        findParams.searchFields = ["JSMJ"];
                    }
                }else{
                    findParams.searchFields = ["JSMJ"];
                    findParams.searchText =  "0";
                    //findParams.outFields = ["*"];
                }

                findTask.execute(findParams, showAllData);
            },
            menu:'#mm',
            width:200,
            prompt:'请输入查询条件'

        });
        /*
		//高级检索
		//点击Button 点击一下开；在点一下关
		var a = 0;
		on(dom.byId("hsearch"), "click", function(event){
			a++;
			if (a % 2 !== 0){
				$('#searchwin').window("open");
			}else{
				$('#searchwin').window("close");
			}
        });*/
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
		on(dom.byId("legend"), "click", function(event){//图例
			$.messager.alert("警告","图例功能暂无法提供");
			/*
			$('#legendwin').window('resize',{top:($('#mapDiv').height()),left:($('#mapDiv').width())});
            $('#legendwin').window('open');
		   */
        });





        on(dom.byId("measuringarea"), "click", function(event){//测量面积
            alert("测量面积");
            var geometryServiceUrl="https://localhost:6443/arcgis/rest/services/Utilities/Geometry/GeometryServer"
            geometryService = new esri.tasks.GeometryService(geometryServiceUrl);
            var toolbar = new Draw(map);
            toolbar.activate(Draw.POLYGON);

            on(toolbar,"draw-end", function(result) {
                var geometry = result.geometry;
                map.enableMapNavigation();
                //toolbar.deactivate();
                doMeasure(geometry);
            })
        });

        on(dom.byId("measuringlength"), "click", function(event){//测量面积
            alert("测量距离");
            var geometryServiceUrl="https://localhost:6443/arcgis/rest/services/Utilities/Geometry/GeometryServer"
            geometryService = new esri.tasks.GeometryService(geometryServiceUrl);
            var toolbar = new Draw(map);
            toolbar.activate(Draw.POLYLINE);

            on(toolbar,"draw-end", function(result) {
                var geometry = result.geometry;
                map.enableMapNavigation();
                //toolbar.deactivate();
                doMeasure(geometry);
            })



        });
        function doMeasure(geometry) {
            //更加类型设置显示样式


            measuregeometry = geometry;
            console.log(measuregeometry);
            var toolbar = new Draw(map);
            toolbar.deactivate();
            switch (geometry.type) {
                case "polyline":
                    var symbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 0, 0]), 2);
                    break;
                case "polygon":
                    var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_NONE, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 255, 0, 0.25]));
                    break; }
            //设置样式
            var graphic = new esri.Graphic(geometry, symbol);
            //清除上一次的画图内容
            // map.graphics.clear();
            map.infoWindow.hide();
            map.graphics.clear();
            map.graphics.add(graphic);
            //map.graphics.add(graphic); //进行投影转换，完成后调用projectComplete
            MeasureGeometry(geometry);
        }
            //投影转换完成后调用方法
        function MeasureGeometry(geometry) {
            //如果为线类型就进行lengths距离测算
            if (geometry.type == "polyline") {
                var lengthParams = new esri.tasks.LengthsParameters();
                lengthParams.polylines = [geometry];
                lengthParams.lengthUnit = esri.tasks.GeometryService.UNIT_METER;
                lengthParams.geodesic = true;
                lengthParams.polylines[0].spatialReference = new esri.SpatialReference(4326);
                geometryService.lengths(lengthParams);
                dojo.connect(geometryService, "onLengthsComplete", outputDistance);
            }
            //如果为面类型需要先进行simplify操作在进行面积测算
            else if (geometry.type == "polygon") {
                var areasAndLengthParams = new esri.tasks.AreasAndLengthsParameters();
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
            map.infoWindow.setTitle("距离测量");
            map.infoWindow.setContent(" 测 量 长 度 ： <strong>" + parseInt(String(result.lengths[0])) + "米</strong>");
            map.infoWindow.show(CurPos); }
        //显示测量面积
        function outputAreaAndLength(result) {
            var extent=measuregeometry.getExtent();
            //获取查找区域的范围
            var center=measuregeometry.getCentroid();
            //获取查询区域的中心点
            var cPoint = new Point([center.x,center.y],new SpatialReference({ wkid:4326 }));
            map.infoWindow.setTitle("面积测量");
            map.infoWindow.setContent(" 面积 ： <strong>" + parseInt(String(result.areas[0])) + "平方米</strong> 周长：" + parseInt(String(result.lengths[0])) + "米");
            map.infoWindow.show(cPoint); }

        on(dom.byId("selectpolygon"), "click", function(event){//选择面
            //单机选择要素
            mapclick  = map.on("click",mapClick);

        });
        on(dom.byId("createpolygon"), "click", function(event){//绘图
            map.graphics.clear();
            //清除map点击事件
            if(mapclick){
                mapclick.remove();
            }else{

            };

            var toolBar = new Draw(map);

            //激活绘图工具：绘制面
            toolBar.activate(esri.toolbars.Draw.POLYGON);


            //给绘图工具绑定绘图完成事件
            on(toolBar, "draw-complete", function (result)
            {
                //获得绘图得到的面
                var geometry=result.geometry;
                //关闭绘图工具
                toolBar.deactivate();
                var lineSymbol=new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,255,255])).setWidth(2);
                //创建面符号
                var fill=new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSymbol,new Color([60,255,255,0]));
                var graphic = new Graphic(geometry,fill);
                //将点对象存储在点几何中
                //将图形存放在地图中，然后得以显示
                map.graphics.add(graphic);

                zdanalygygeometry = geometry;
                zdanalygygraphic = graphic;

                returnquerygeo(zdanalygygeometry);

                //执行空间查询

                //identifyQuery(geometry);
            });

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

		
       //创建GP服务
        //定义点几何对象
        var pointSet = new FeatureSet();
        var psymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CROSS, 12, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 2), new dojo.Color([0, 255, 0, 0.25]));
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


            });
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
        on(map,"onLoad",function(e){

            map.disableDoubleClickZoom();

        })
		if (layer7.loaded){
			buildLayerList(layer7);
		}else{
			dojo.connect(layer7, "onLoad", buildLayerList);
		}

		
        //-------------------------------------------------------------------------//
       
        //----------------------清除选择-------------------------------------------//
        on(dom.byId("Clear"),"click",function(e){

            map.graphics.clear();

        })


        //----------------------------------------------------------------//
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
               features_Input_Features = layer0results;
               features_Clip_Features.push(zdanalygygraphic);

               featureset_Input_Features.features= features_Input_Features;
               featureset_Clip_Features.features = features_Clip_Features;



               gpParams.InputClass   = featureset_Input_Features;

               gpParams.ClipClass    = featureset_Clip_Features;

               //执行GP服务
               zdfx.submitJob(gpParams,jobResult);

           }else{
               //console.log(layer7.layerInfos[9]);
               alert("无可用图");

           }

        })
        function jobResult(result) {
            var jobId = result.jobId;
            var status = result.jobStatus;
            if(status === esri.tasks.JobInfo.STATUS_SUCCEEDED) {
                //成功之后，将其中的结果取出来，当然这也是参数名字。
                //在模型中，想要取出中间结果，需要设置为模型参数
                zdfx.getResultData(jobId, "Output_Feature_Class", showzdanalygyResult);
            }
        }
        function showzdanalygyResult(gpParams) {

            var features = gpParams.value.features;
            for (var i = 0; i < features.length; i++) {
                var graphic = features[i];

                var lineSymbol=new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([255,0,0])).setWidth(2);
                //创建面符号
                var fill=new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSymbol,new Color([60,255,255,0]));
                //设置面符号
                graphic.setSymbol(fill);
                map.graphics.add(graphic);
                alert("宗地分析成功!");
                showAllData( features);

            }

        }
        function returnquerygeo(geometry) {
            var return_graphic_set;
            var identifyTask = new IdentifyTask("http://localhost:6080/arcgis/rest/services/yzt/发布1/MapServer");
            //定义空间查询参数对象
            var params = new IdentifyParameters();
            //容差
            params.tolerance = 5;
            //是否返回几何信息
            params.returnGeometry = true;
            //空间查询的图层，此时是三个图层
            params.layerIds = [9];
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
                returntozd(fs);
            });


        }

        function returntozd(fs){

            layer0results = [];

            for(var i=0;i<fs.length;i++){
                var lineSymbol=new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,255,255])).setWidth(2);
                //创建面符号
                for(var i=0;i<fs.length;i++){
                    var fill=new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSymbol,new Color([60,255,255,0]));
                    var graphic = new Graphic(fs[i].feature.geometry,fill);
                    layer0results.push(graphic);

                }
            }

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

        function showbufferResult(gpParams,messages){
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

        function showAllData(results){
            findtaskresults = results;
            //清空原DIV
            //map.graphics.clear();


            var items = [];
            console.log('returnlayer'+returnlayer);
            if(returnlayer == 9){
                for (var i = 0; i < results.length; i++) {
                    items.push(results[i].attributes);  //append each attribute list as item in store
                };

                var data = {

                    items: items
                };
                $('#dg').datagrid({
                    columns:[[
                        {field:'OBJECTID',title:'OBJECTID'},
                        {field:'BSM',title:'BSM'},
                        {field:'Shape_Length',title:'Shape_Length'}
                    ]]
                });

            }else{
                for (var i = 0; i < results.length; i++) {
                    items.push(results[i].feature.attributes);  //append each attribute list as item in store
                };
                var data = {

                    items: items
                };


                var columns = new Column();
                for(var key in items[0]){
                    console.log('key'+key);
                    arrfields.push([columns.setField(key)])


                }
                $('#dg').datagrid({
                    columns:[[
                        {field:key,title:key},
                        {field:'XZQDM',title:'XZQDM'},
                        {field:'XZQMC',title:'XZQMC'}
                    ]]
                });
                //console.log(field);
                // if(select_search_layer == 0 ){
                //     $('#dg').datagrid({
                //         columns:[[
                //             {field:'OBJECTID',title:'OBJECTID'},
                //             {field:'XZQDM',title:'XZQDM'},
                //             {field:'XZQMC',title:'XZQMC'}
                //         ]]
                //     });
                // }else if(select_search_layer == 1 ){
                //     $('#dg').datagrid({
                //         columns:[[
                //             {field:'OBJECTID',title:'OBJECTID'},
                //             {field:'XZQDM',title:'XZQDM'},
                //             {field:'XZQMC',title:'XZQMC'}
                //         ]]
                //     });
                // }

            }


            $('#dg').datagrid({
                onClickRow: function (index, row) {
                   // console.log("index:"+index+",row:"+row);

                    selectdatagrid();
                }
            });
            $('#dg').datagrid('loadData',data.items);
           // $('#dg').datagrid('reload');

           // $('#dg').datagrid("resize");
            $('#dg').datagrid('resize');

            var pager = $('#dg').datagrid('getPager');    // get the pager of datagrid
            pager.pagination({
                showPageList:false,
                pageList: [5, 10, 15, 20, 25],
                rownumbers: true,//行号
                buttons:[{
                    id:'export',
                    iconCls:'icon-export',
                    text:'导出',
                    handler:function(){

                    }


                },{
                    iconCls:'icon-add',
                    text:'统计字段设置',
                    handler:function(){
                        $('#stat_win').window('open'); // close a window
                        $('#stat_form').combo({
                            required:true,
                            multiple:true
                        });

                    }
                }],

                onBeforeRefresh:function(){
                    alert('before refresh');
                    return true;
                }
            });
        }


        function selectdatagrid() {
            map.graphics.clear();
            var row = $('#dg').datagrid('getSelected');
            if(row){
                //console.log(row);

                var selectedTaxLot;
                for (var i = 0, il = findtaskresults.length; i < il; i++) {
                    var currentGraphic = findtaskresults[i];
                    if(returnlayer == 9){
                        var gridFid = row.OBJECTID;
                        if ((currentGraphic.attributes) && currentGraphic.attributes.OBJECTID == gridFid) {
                            selectedTaxLot = currentGraphic;
                            break;
                        }
                    }else{
                        var gridFid = row.FID;
                        if ((currentGraphic.feature.attributes) && currentGraphic.feature.attributes.FID == gridFid) {
                            selectedTaxLot = currentGraphic;
                            break;
                        }
                    }
                }
                //将选择的属性缩放至图层
                if(returnlayer == 9){
                    var taxLotExtent = selectedTaxLot.geometry.getExtent();
                    var graphic = selectedTaxLot; //表格一行显示一条要素
                }else{
                    var taxLotExtent = selectedTaxLot.feature.geometry.getExtent();
                    var graphic = selectedTaxLot.feature; //表格一行显示一条要素
                }
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
                        htmls = htmls + "<td bgcolor=\"#E0E0E0\" align='center'>"+ key+"<td bgcolor=\"#E0E0E0\" align='center'>"+ss[key]+"</td></tr>";
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
			map.infoWindow.setTitle("查询结果");
			map.infoWindow.setContent(htmls);
            map.infoWindow.resize(400,300);
			map.infoWindow.show(point);
            //document.getElementById("gridDiv").innerHTML = htmls;
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
							{"id":"rootnode","text":"地籍数据库","children":[{"id":"rootnode","text":"使用权","children":[{"id":"rootnode","text":"房屋"},{"id":9,"text":"宗地宗地"}]}],"state":"closed"},
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

                        visible.push(node.id);
						layernode = node.id
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
                    layer7.setVisibleLayers(visible);
					map.addLayer(layer7);
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

		function removeByValue(arr,val){
						for(var i = 0;i<arr.length;i++){
							if (arr[i] == val){
								arr.splice(i,1);
								
							}
						}
					}

		

    });

