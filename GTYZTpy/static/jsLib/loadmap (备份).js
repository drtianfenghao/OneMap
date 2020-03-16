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
var findTask, findParams,map;
var grid, store;
var point;
var layernode;
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
        "dojo/domReady!"],

    function (Map,query,on,dom,ItemFileWriteStore,DataGrid,InfoWindow,Navigation,Point,FeatureSet,LinearUnit,SimpleMarkerSymbol,SpatialReference,Extent,Geoprocessor,ArcGISDynamicMapServiceLayer,QueryTask,FindTask,FindParameters,IdentifyTask,IdentifyParameters,Draw,Query,SimpleLineSymbol,SimpleFillSymbol,Color,Graphic) {
        //给DataGrid添加行点击事件
        //dojo.connect(gridWidget, "onRowClick", onRowClickHandler);
		
		
		
        map = new Map("mapDiv",{
            logo:false,
            slider: false,
        });
		map.infoWindow.resize(245,125);
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
            navToolbar.zoomToFullExtent();

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

        //=================================读取所有属性===========================================/
		

        //====================================读取属性结束=========================================/
        $('#jqsearch').searchbox({
            searcher:function(value,name) {
                findTask = new FindTask("http://localhost:6080/arcgis/rest/services/yzt/发布1/MapServer");
                findParams = new FindParameters();
                findParams.returnGeometry = true;
                findParams.layerIds = [""+name+""];
				
				
                
                findParams.searchFields = ["FID"];
                findParams.searchText =  value;
                findTask.execute(findParams, showAllData);
            },
            menu:'#mm',
            width:200,
            prompt:'请输入查询条件'

        });
		//高级检索
		on(dom.byId("hsearch"), "click", function(event){
			$('#searchwin').window("open");   
        });
		
		on(dom.byId("legend"), "click", function(event){//平移
			$('#legendwin').window('resize',{top:($('#mapDiv').height()),left:($('#mapDiv').width())});
            $('#legendwin').window('open');
		   
        });

		
		 // -------------------选择一个图层-----------------------------------------//
        //双击选择要素

        map.on("dbl-click",mapClick);
		
        //-------------------------------------------------------------------------//

        $('#view').menubutton({
            menu:'#maptools'
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
        on(dom.byId("buffer"),"click",function(e){
            //定义GP服务对象

            var buffer = new Geoprocessor("http://localhost:6080/arcgis/rest/services/buffer/GPServer/GPServer/buffer");
            //构建GP服务参数
            var gpParams={};
            //添加fields字段，为了和后台服务字段匹配
            pointSet.fields=[];
            //GP服务的Input参数
            gpParams.Input=pointSet;

            //GP服务的dis参数
            //设置参数===================================================
            var getdis = dom.byId("shiyantext").value;
            var dis=new LinearUnit({
                "distance":getdis,
                "units": "esriMeters"
            },getdis);
            gpParams.Dis=dis;
            //执行GP服务
            buffer.execute(gpParams, showbufferResult);


        });



        //创建属性查询对象
        //打开图层
        on(map,"dbl-click",function(e){

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
            //执行空间查询
            identifyQuery(geometry);
        });

		function showCoordinates(evt){
			
			var mp = evt.mapPoint;
			
			var pointx = mp.x;
			var pointy = mp.y;
			//打开XY显示坐标
			document.getElementById('x').innerText = pointx;
			document.getElementById('y').innerText = pointy;
			
			
		
		}

        function showbufferResult(results, messages){

            var features = results[0].value.features;
            for (var i = 0; i < features.length; i++) {
                var graphic = features[i];
                //定义线符号
                var lineSymbol=new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color([255, 0, 0]), 1);
                //定义面符号
                var PolygonSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSymbol, new dojo.Color([255, 255, 0, 0.25]));
                //设置面符号
                graphic.setSymbol(PolygonSymbol);
                map.graphics.add(graphic);
            }
        }

        function showAllData(results){
            //清空原DIV
            map.graphics.clear();
            $('#gridDiv').empty();

            var lineSymbol=new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,255,255])).setWidth(2);
            //创建面符号
            var fill=new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSymbol,new Color([60,255,255,0]));
            var items = [];

            for (var i = 0; i < results.length; i++) {
                items.push(results[i].feature.attributes);  //append each attribute list as item in store
                var graphic = results[i].feature; //表格一行显示一条要素
                graphic.setSymbol(fill);
                map.graphics.add(graphic);
            }

            var data = {
                identifier: "FID",  //This field needs to have unique values
                label: "FID", //Name field for display. Not pertinent to a grid but may be used elsewhere.
                items: items
            };

            //document.write(data);
            store = new ItemFileWriteStore({ data: data }); //ItemFileReadStore:适合处理小数据源，处理大数据源使用：JsonRestStore
            var layout = [[
                {'name': 'FID', 'field': 'FID', 'width': '40%'},
                {'name': 'YDND', 'field': 'YDND', 'width': '30%'},
                {'name': 'FQ', 'field': 'FQ', 'width': '30%'}
            ]];


            grid = new DataGrid({
                store:store,
                query:{FID: '*' },
                structure:layout,
                rowSelector: '20px'
            });
            grid.placeAt("gridDiv");
            grid.startup();

            on(grid,"click",function(e){

                var gridFid = grid.getItem(e.rowIndex).FID;
                var selectedTaxLot;
                for (var i = 0, il = map.graphics.graphics.length; i < il; i++) {
                    var currentGraphic = map.graphics.graphics[i];
                    if ((currentGraphic.attributes) && currentGraphic.attributes.FID == gridFid) {
                        console.log(currentGraphic.attributes.FID);
                        selectedTaxLot = currentGraphic;
                        break;
                    }
                }
                //将选择的属性缩放至图层
                var taxLotExtent = selectedTaxLot.geometry.getExtent();
                map.setExtent(taxLotExtent);

            })


        }
        function mapClick(e){
            //map.disableDoubleClickZoom();
            //获得用户点击的地图坐标
            point=e.mapPoint;
			
			
            //实例化查询参数
            query=new Query();
            query.geometry = point;
            query.outFields = ["*"];

            query.outSpatialReference = map.spatialReference;
            query.spatialRelationship = Query.SPATIAL_REL_INTERSECTS;
            query.returnGeometry = true;
            //实例化查询对象
			console.log(query.geometry );
            var queryTask1 = new QueryTask("http://localhost:6080/arcgis/rest/services/yzt/发布1/MapServer/"+layernode);
			
            //进行查询
            queryTask1.execute(query,showFindResult)


        }
        function showFindResult(queryResult)
		
        {
            //1.定义面的边界线符号

            var outline= new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,255,255])).setWidth(2);

            //2.定义面符号
            var PolygonSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, outline,new Color([60,255,255,0]));
            //一次只选择一个要素
            map.graphics.clear();
            if (queryResult.features == 0) {
                alert("没有该元素");
                return;
            }
            //var items = [];
            var htmls = "<table style=\"width: 100%\">";
            htmls = htmls + "<tr><td> 批准用地文号 </td><td> 原用地单位</td><td> 现用地单位</td></tr>";
            for (var i = 0; i < queryResult.features.length; i++) {
                //获得该图形的形状
                var feature = queryResult.features[i];
				console.log(feature);
				
                var geometry = feature.geometry;
				
                //创建客户端图形
                var graphic = new Graphic(geometry, PolygonSymbol);
                map.graphics.add(graphic);

                // feature.setSymbol(fill);
                
                //所有属性  如果是单条属性》》feature.attributes.["字段名称"]
                var YYDDW = feature.attributes["YYDDW"];
                var PZYDWH = feature.attributes["PZYDWH"];
                var XYDDW = feature.attributes["XYDDW"];

                htmls = htmls + "<tr bgcolor=\"#E0E0E0\"><td>" + PZYDWH + "</td><td>" + YYDDW + "</td>"+"<td>"+XYDDW+"</td></tr>";
                // items.push(queryResult.features[i].attributes);

            }
            htmls = htmls + "</table>";
			map.infoWindow.setTitle("查询结果");
			map.infoWindow.setContent(htmls);
			
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
            params.layerIds = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14];
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
                document.getElementById("gridDiv").innerHTML = htmls;
            }
            else {
                document.getElementById("gridDiv").innerHTML = "";
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
            //var layerinfos = layer.layerInfos;
			
			var layerinfos = [
								{'id':0,'name':'城区规划2013','parentLayerId':-1,'defaultVisibility':true},
								{'id':1,'name':'建设用地供地界线','parentLayerId':-1,'defaultVisibility':true},
								{'id':2,'name':'地籍宗地','parentLayerId':-1,'defaultVisibility':true},
								{'id':3,'name':'建设用地管制区','parentLayerId':-1,'defaultVisibility':true},
								{'id':4,'name':'土地规划地类','parentLayerId':-1,'defaultVisibility':true},				  
								{'id':5,'name':'全国第二次土地调查','parentLayerId':-1,'defaultVisibility':true}					  
								
							  		  
							  ]

			
            var treeList = [];//jquery-easyui的tree用到的tree_data.json数组
            var parentnodes = [];//保存所有的父亲节点
            var root = [{"id": "rootnode", "text": "基础地理要素", "children": [],"state":"closed"},
						{"id": 0, "text": "延吉市城区规划", "children": [{"id":0,"text":"城区规划","children":[{"id":0,"text":"城区规划2013"}],"state":"closed"}],"state":"closed"},
						{"id": "rootnode", "text": "建设用地审批", "children": [{"id":1,"text":"建设用地供应界线", "children":[{"id":1,"text":"建设用地供应界线"}],"state":"closed"}],"state":"closed"},
						{"id": "rootnode", "text": "专项工作", "children": [],"state":"closed"},
						
						
						{"id": "rootnode", "text": "专题数据库", "children": [
							{"id":"rootnode","text":"地籍数据库","children":[{"id":"rootnode","text":"使用权","children":[{"id":"rootnode","text":"房屋"},{"id":2,"text":"宗地"}]}],"state":"closed"},
							
							{"id":3,"text":"土地利用现状数据库","children":[{"id":3,"text":"建设用地管制区"}],"state":"closed"},
							
							],"state":"closed"},
						
						
						
						
						{"id": "rootnode", "text": "土地利用现状数据库", "children": [{"id":"rootnode","text":"全国第二次土地调查","children": [{"id":5,"text":"2014年度"}],"state":"closed"}],"state":"closed"},
						{"id": "rootnode", "text": "关系单位", "children": [],"state":"closed"},
						{"id": "rootnode", "text": "遥感影像", "children": [{"id":15,"text":"2016年度","children": [{"id":15,"text":"影像2016年"}],"state":"closed"}],"state":"closed"}
						
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

    });

