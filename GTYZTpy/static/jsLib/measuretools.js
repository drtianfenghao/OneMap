/**
 * Created by 59308 on 2018/7/5 0005.
 */
require([
    "esri/map",
    "esri/layers/ArcGISDynamicMapServiceLayer",
    "esri/toolbars/navigation",
    "esri/toolbars/draw",
    "esri/tasks/GeometryService",
    "esri/symbols/Font",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/TextSymbol",
    "esri/Color",
    "dojo/number",
    "esri/graphic",
    "esri/tasks/LengthsParameters",
    "esri/geometry/Point",
    "esri/geometry/Polyline",
    "esri/tasks/AreasAndLengthsParameters",
    "dojo/dom-attr",
    "dojo/domReady!"
],function(Map,ArcGISDynamicMapServiceLayer,Navigation,Draw,GeometryService,Font,SimpleMarkerSymbol,SimpleLineSymbol,TextSymbol,Color,number,Graphic,LengthsParameters,
           Point,Polyline,AreasAndLengthsParameters,domAttr){
    var chinaCollagelayer = new ArcGISDynamicMapServiceLayer("http://localhost:6080/arcgis/rest/services/yzt/发布1/MapServer");
    var map = new Map("map");
    map.addLayer(chinaCollagelayer);
//创建地图操作对象
    var navToolbar = new Navigation(map);
//toolbar工具条
    var toolbar = new Draw(map);
    //调用esri自带的服务（在arcgis server Manger中，记得开启服务）
    var geometryService =new GeometryService("http://localhost:6080/arcgis/rest/services/Utilities/Geometry/GeometryServer");
    var totleDistance = 0.0;//总距离
    var totalGraphic = null;//存储点集合
    var disFun =false;//距离测量
    var areaFun = false;//面积测量
    var inputPoints = [];//存储生成点的集合
    var startFont = new Font('12px').setWeight(Font.WEIGHT_BOLD);//定义文字样式
    var makerSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE,8,
        new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([204,102,51]),1),
        new Color([158.184,71,0.65]));//定义标记点样式
//给按钮添加绑定事件
    query(".functionWrap").on("click",function(event){
        //获得按钮的文本信息
        var value=domAttr.get(this,"title");
        switch(value){
            case "平移":
                navToolbar.activate(Navigation.PAN);
                break;
            case "拉框缩小":
                navToolbar.activate(Navigation.ZOOM_OUT);
                break;
            case "拉框放大":
                navToolbar.activate(Navigation.ZOOM_IN);
                break;
            case "全图":
                map.centerAndZoom(([110,38.5]),5);
                break;
            case "距离测量":
                distanceMeasure();
                break;
            case "面积测量":
                areaMeasure();
                break;
            case "清除标记":
                clearAction();
                break;
        }
    }
    //长度量算
    function distanceMeasure() {
        map.enableScrollWheelZoom();
        disFun=true;
        areaFun=false;
        toolbar.activate(Draw.POLYLINE);
    }
    //面积量算
    function areaMeasure() {
        map.enableScrollWheelZoom();
        disFun=false;
        areaFun=true;
        toolbar.activate(Draw.POLYGON);
    }
    // 量算功能触发
    map.on("click",function (evt) {
        mapClick(evt);
    });
    //触发完成的事件
    toolbar.on("draw-end",function (evt) {
        addToMap(evt);
    });
    //生成两点之间的连线
    toolbar.setLineSymbol(new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([255,0,0]),2));
    //量算函数
    function mapClick(evt) {
        if(disFun){
            inputPoints.push(evt.mapPoint);
            var  textSymbol;
            if(inputPoints.length ===1){
                textSymbol = new TextSymbol("起点",startFont,new Color([204,102,51]));
                textSymbol.setOffset(0,-20);
                map.graphics.add(new Graphic(evt.mapPoint,textSymbol));
            }
            map.graphics.add(new Graphic(evt.mapPoint,makerSymbol));
            if(inputPoints.length >=2){
                //    设置距离测量的参数
                var  lengthParams = new LengthsParameters();
                lengthParams.distanceUnit = GeometryService.UNIT_METER;
                lengthParams.calculationType = "preserveShape";
                var p1 = inputPoints[inputPoints.length-2];
                var p2 = inputPoints[inputPoints.length-1];
                if(p1.x ===p2.x &&p1.y===p2.y){
                    return;
                }
                //    z在两点之间划线将两点链接起来
                var polyline = new Polyline(map.spatialReference);
                polyline.addPath([p1,p2]);
                lengthParams.polylines=[polyline];
                // 根据参数，动态的计算长度
                geometryService.lengths(lengthParams,function(distance){
                    var _distance = number.format(distance.lengths[0]/1000);
                    totleDistance+=parseFloat(_distance);//计算总长度
                    var beetwentDistances = _distance+"千米";
                    var tdistance = new TextSymbol(beetwentDistances,startFont,new Color([204,102,51]));
                    tdistance.setOffset(40,-3);
                    map.graphics.add(new Graphic(p2,tdistance));
                    if(totalGraphic){
                        map.graphics.remove(totalGraphic);
                    }
                    var total=number.format(totleDistance,{
                        pattern:"#.000"
                    });
                    //    设置总长度的显示样式，并添加到地图上
                    var totalSymbol=new TextSymbol("总长度："+total+"千米",startFont,new Color([204,102,51]));
                    totalSymbol.setOffset(40,-15);
                    totalGraphic= map.graphics.add(new Graphic(p2,totalSymbol));
                });
            }
        }
    }
    // 添加图形函数
    function addToMap(evt) {
        if(disFun||areaFun){
            var geometry = evt.geometry;//绘制图形的geometry
            //将绘制的图形添加到地图上去
            var symbol = null;
            switch (geometry.type){
                case "point":
                    symbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE,10,
                        new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([255,0,0]),1),
                        new Color([0,255,0,0.25]));
                    break;
                case "polyline":
                    symbol  = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                        new Color([255,0,0,0.8]),2);
                    break;
                case "polygon":
                    symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                        new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([255,0,0]),2),
                        new Color([255,255,0,0.25]));
                    break;
                case "extent":
                    symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                        new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([255,0,0]),2),
                        new Color([255,255,0,0.25]));
                    break;
            }
            map.graphics.add(new Graphic(geometry,symbol));
            if(disFun){
                inputPoints.splice(0,inputPoints.length);//删除数组中的所有元素
                totleDistance =0.0;
                totalGraphic = null;
            }
            else if(areaFun){
                //设置面积和长度的参数
                var areasAndLengthsParameters =new AreasAndLengthsParameters();
                areasAndLengthsParameters.lengthUnit = GeometryService.UNIT_METER;//设置距离单位
                areasAndLengthsParameters.areaUnit = GeometryService.UNIT_SQUARE_KILOMETERS;//设置面积单位
                geometryService.simplify([geometry],function (simplifiedGeometries) {
                    areasAndLengthsParameters.polygons = simplifiedGeometries;
                    geometryService.areasAndLengths(areasAndLengthsParameters,function (result) {
                        var font =new Font("16px",Font.STYLE_NORMAL,Font.VARIANT_NORMAL,Font.WEIGHT_BOLDER);
                        var areaResult = new TextSymbol(number.format(result.areas[0],{
                                pattern:'#.000'
                            })+"平方公里",font,new Color([204,102,51]));
                        var spoint = new Point(geometry.getExtent().getCenter().x,geometry.getExtent().getCenter().y,map.spatialReference);
                        map.graphics.add(new Graphic(spoint,areaResult));//在地图上显示测量的面积
                    });

                });
            }

        }
    }
    //清空函数
    function clearAction() {
        toolbar.deactivate();//撤销地图绘制功能
        disFun = false;
        areaFun = false;
        map.enableScrollWheelZoom();
        map.graphics.clear();
        var graphicLayerIds = map.graphicsLayerIds;
        var len = graphicLayerIds.length;
        for(var i=0; i<len;i++){
            var gLayer = map.getLayer(graphicLayerIds[i]);
            gLayer.clear();
        }
    }
});