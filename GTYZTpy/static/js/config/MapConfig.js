var MapConfig={};
//配置图层

MapConfig.url = {
    layerurl:"https://localhost:6443/arcgis/rest/services/XSDT/%E5%8F%91%E5%B8%831/MapServer",
    xslayerurl:"https://localhost:6443/arcgis/rest/services/XSDT/Untitled1/MapServer",
    xs_featurelayer_url:"https://192.168.10.102:6443/arcgis/rest/services/XSDT/sydt/FeatureServer/0",
    xs_sylayer1:"https://localhost:6443/arcgis/rest/services/XSDT/disRoad/MapServer",
    overlay: "http://localhost:6080/arcgis/rest/services/yztgp/ZDAnalygy/GPServer/ZDAnalygy",
    arrtopolygon:"http://localhost:6080/arcgis/rest/services/yztgp/xyarrtopolygon/GPServer/xyarrtopolygon",
    geometryServiceUrl:"http://localhost:6080/arcgis/rest/services/Utilities/Geometry/GeometryServer",
    printSeverUrl:"https://localhost:6443/arcgis/rest/services/webserver/DrtianPrintServer/GPServer/Export%20Web%20Map"
};


MapConfig.xs_sublayers = [{
    id:0,
    visible:false,
    title:"延边州2009年土地利用",

}]
MapConfig.sublayers = [{
                    id:"rootnode",
                    title:"延吉市城区规划",
                    visible:true,
                    sublayers:[{
                        id:"rootnode",
                        title:"道路",
                        visible:false,
                        sublayers:[{
                            id:3,
                            title:"主干道",
                            visible:false
                        },{
                            id:"rootnode",
                            title:"次干道",
                            visible:false
                        },{
                            id:"rootnode",
                            title:"支路",
                            visible:false
                        }]
                    },{
                        id:"rootnode",
                        title:"城区规划",
                        visible:true,
                        sublayers:[{
                            id:4,
                            title:"城区规划2013",
                            visible:false

                        },{
                            id:"rootnode",
                            title:"城区规划2016",
                            visible:false
                        }]
                    }]

                },{
                    id:"rootnode",
                    title:"基础数据库",
                    visible:true,
                    sublayers:[{
                        id:"rootnode",
                        title:"图幅索引",
                        visible:false
                    },{
                        id:2,
                        title:"地籍区",
                        visible:false
                    },{
                        id:1,
                        title:"地籍子区",
                        visible:false
                    },{
                        id:0,
                        title:"乡镇界线",
                        visible:false
                    }]

                }];
