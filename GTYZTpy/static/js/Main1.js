var app;

require([
    // ArcGIS
    "esri/config",
    "esri/Map",
    "esri/Basemap",
    "esri/WebMap",
    "esri/layers/VectorTileLayer",
    "esri/layers/GraphicsLayer",
    "esri/layers/MapImageLayer",
    "esri/layers/FeatureLayer",
    "esri/views/MapView",
    "esri/views/SceneView",
    "esri/widgets/Search",
    "esri/widgets/Sketch",
    "esri/widgets/Popup",
    "esri/widgets/Home",
    "esri/widgets/Legend",
    "esri/widgets/ColorPicker",
    "esri/renderers/smartMapping/creators/color",
    "esri/renderers/ClassBreaksRenderer",
    "esri/geometry/Extent",
    "esri/geometry/SpatialReference",
    "esri/core/watchUtils",
    "dojo/query",
    "dojo/dom-class",
    "dojo/dom",
    "dojo/on",

    // Calcite Maps
    "calcite-maps/calcitemaps-v0.10",
    "calcite-maps/calcitemaps-arcgis-support-v0.10",
    //"calcite-maps/calcitemaps",
    "calcite-settings/panelsettings",

    // Boostrap
    "bootstrap/Collapse",
    "bootstrap/Dropdown",
    "bootstrap/Tab",
    "bootstrap/Carousel",
    "bootstrap/Tooltip",
    "bootstrap/Modal",

    // Dojo
    "dojo/domReady!"
], function(esriConfig , Map, Basemap, Webmap, VectorTileLayer, GraphicsLayer,MapImageLayer, FeatureLayer, MapView, SceneView, Search, Sketch, Popup, Home, Legend, ColorPicker, colorRendererCreator , ClassBreaksRenderer ,Extent,SpatialReference,
            watchUtils, query, domClass, dom, on, CalciteMapsSettings, CalciteMapsArcGISSupport, PanelSettings) {
esriConfig.request.proxyUrl="http://localhost/DotNet/proxy.ashx ";

// esriConfig.defaults.io.alwaysUseProxy=false;
app = {
    zoom: 2,
    lonlat: [-40,0],
    mapView: null,
    mapDiv: "mapViewDiv",
    mapFL: null,
    vectorLayer: null,
    sceneView: null,
    sceneDiv: "sceneViewDiv",
    sceneFL: null,
    activeView: null,
    searchWidgetNav: null,
    searchWidgetPanel: null,
    searchWidgetSettings: null,
    basemapSelected: "gray",
    basemapSelectedAlt: "gray",
    webmap: null,
    webmapId: "df5b4bad631d4209b6ef7a88493dac7d",
    padding: {
        top: 50 ,
        right: 0,
        bottom: 0,
        left: 0
    },
    uiPadding: {
        components: ["zoom","attribution"],
        padding: {
            top: 15,
            right: 15,
            bottom: 30,
            left: 15
        }
    },
        popupOptions: {
          autoPanEnabled: true,
          messageEnabled: false,
          spinnerEnabled: false,
          dockEnabled: true,
          dockOptions: {
            buttonEnabled: true,
            //breakpoint: 544 // default
          }
        },
        colorPickerWidget: null,
        panelSettings: null,

};

//----------------------------------
// App
//----------------------------------

initializeMapViews();
initializeAppUI();
initializeAppSettings();
initializeWidgets();

    


//----------------------------------
// Map and Scene View
//----------------------------------

function initializeMapViews() {
    // Webmap
    app.webmap = new Webmap({
        portalItem: {
            id: app.webmapId
        }
    });
    // 2D - MapView
    app.mapView = new MapView({
        container: app.mapDiv,
        map: app.webmap,
        zoom: app.zoom,
        center: app.lonlat,
        padding: app.padding,
        ui: app.uiPadding,
        popup: new Popup(app.popupOptions),
        visible: true
    });
    // Set active view
    app.activeView = app.mapView;
    // 3D - SceneView
    app.sceneView = new SceneView({
        container: app.sceneDiv,
        map: app.webmap,
        zoom: app.zoom,
        center: app.lonlat,
        padding: app.padding,
        ui: app.uiPadding,
        popup: new Popup(app.popupOptions),
        visible: false
    });

    // Listen for view breakpoint changes and update control location
    app.mapView.watch("widthBreakpoint", function(newVal, oldVal) {
        function setPadding(newVal, oldVal) {
            if (!app.panelSettings) {
                return;
            }
            if (newVal === "small" && oldVal === "medium") {
                app.panelSettings.setPadding(app.panelSettings.activeLayout.viewPaddingSmallScreen, app.panelSettings.activeLayout.uiPadding);
            } else if (newVal === "medium" && oldVal === "small") {
                app.panelSettings.setPadding(app.panelSettings.activeLayout.viewPadding, app.panelSettings.activeLayout.uiPadding);
            }
        }
        // Set padding for navs that change height
        if (app.panelSettings.activeLayout.viewPaddingSmallScreen) {
            setPadding(newVal, oldVal);
        }
    });
}

//----------------------------------
// View widgets
//----------------------------------

function initializeWidgets() {
    app.mapView.when(function() {
        app.panelSettings.setWidgetPosition(app.mapView, "home", "top-left", 0);
        //app.panelSettings.setWidgetPosition(app.mapView, "zoom", "top-left", 1);
        app.panelSettings.setWidgetPosition(app.mapView, "compass", "top-left");
    });

    app.sceneView.when(function() {
        app.panelSettings.setWidgetPosition(app.sceneView, "home", "top-left", 0);
        //app.panelSettings.setWidgetPosition(app.sceneView, "zoom", "top-left");
        app.panelSettings.setWidgetPosition(app.sceneView, "compass", "top-left");
        app.panelSettings.setWidgetPosition(app.sceneView, "navtoggle", "top-left");
    });

    // Panel widgets


    app.panelSettings.setWidgetPosition(app.mapView, "print", "top-left", 0, "printDiv");

}

//----------------------------------
// App panel settings
//----------------------------------

function initializeAppSettings() {
    // Panel settings
    app.panelSettings = new PanelSettings( { app: app } );
    app.panelSettings.activeLayout = app.panelSettings.APP_LAYOUTS.TOP;
    app.panelSettings.setLayout(app.panelSettings.activeLayout, false);

    // Set padding for navs that change height
    if (window.innerWidth < app.activeView.breakpoints.small && app.panelSettings.activeLayout.viewPaddingSmallScreen) {
        app.panelSettings.setPadding(app.panelSettings.activeLayout.viewPaddingSmallScreen, app.panelSettings.activeLayout.uiPadding);
    }
}

//----------------------------------
// App UI Handlers
//----------------------------------

function initializeAppUI() {
    // App UI
    setTabEvents();
    setBasemapEvents();
    setSearchWidgets();
    setEditWidgets();
    Dr_measure(app.mapView);
    Dr_Search();
    // Dr_Render(app.mapView);
    Dr_LoadTools(app.mapView);
    setColorPicker();
    CalciteMapsArcGISSupport.setPopupPanelSync(app.mapView);
    CalciteMapsArcGISSupport.setPopupPanelSync(app.sceneView);
    CalciteMapsArcGISSupport.setSearchExpandEvents(app.searchWidgetNav);

}

//----------------------------------
// View Tabs
//----------------------------------

function setTabEvents() {
    // Tab event
    query(".calcite-navbar li a[data-toggle='tab']").on("show.bs.tab", function(e) {
        // Views
        if (e.target.text.indexOf("Map") > -1) {
            syncViews(app.sceneView, app.mapView);
            app.activeView = app.mapView;
        } else {
            syncViews(app.mapView, app.sceneView);
            app.activeView = app.sceneView;
        }
        // Search
        syncSearch();
        // Hide popup - TODO
        app.activeView.popup.set({
        visible: false
        });
    });

    // Views
    function syncViews(fromView, toView) {
        watchUtils.whenTrueOnce(fromView, "ready", function(){
            var viewPt = fromView.viewpoint.clone();
            fromView.container = null;
            if (fromView.type === "3d") {
                toView.container = app.mapDiv;
            } else {
                toView.container = app.sceneDiv;
            }
            toView.viewpoint = viewPt;
            toView.padding = fromView.padding;
        });
    }

    // Search
    function syncSearch() {
        app.searchWidgetNav.view = app.activeView;
        app.searchWidgetPanel.view = app.activeView;
        app.searchWidgetSettings.view = app.activeView;
        // Sync
        if (app.searchWidgetNav.selectedResult) {
            app.searchWidgetNav.search(app.searchWidgetNav.selectedResult.name);
        }
        if (app.searchWidgetPanel.selectedResult) {
            app.searchWidgetPanel.search(app.searchWidgetPanel.selectedResult.name);
        }
    }
}

//----------------------------------
// Basemaps
//----------------------------------

function setBasemapEvents() {
    // Sync basemaps for map and scene
    query("#selectBasemapPanel, #settingsSelectBasemap").on("change", function(e){
        app.basemapSelected = e.target.options[e.target.selectedIndex].dataset.vector;
        app.basemapSelectedAlt = e.target.value;
        if(app.basemapSelectedAlt == "本地资源"){
            setLocateSource();


            //
            app.panelSettings.setWidgetPosition(app.mapView, "layerlist", "top-left", 0, "layerlistDiv",app.mapView.map.layers.getItemAt(1));//

        }else{
            setBasemaps();
        }

    });
    function setLocateSource() {

        app.mapView.center = null;
        const fullextent = new Extent(4.350168691E7, 4737552.525599999, 4.35566068723E7, 4808331.690125, new SpatialReference({ wkid:2367 }) );//2367
        //mapimagelayer
        const layer = new MapImageLayer({
                url: MapConfig.url.xslayerurl,
                id:"maplayer",
        //                visible:true,
                fullExtent:fullextent,
                title:"图层管理",
        //                listMode:true,
        //                visible:true,
                sublayers:[{
                    id:0,
                    visible:false,
                    title:"sy2",
                    // renderer:renderer

                }]
        });
        // const layer = new FeatureLayer({
        //     url:MapConfig.url.xs_featurelayer_url
        // });
        var legend = new Legend({
            view: app.mapView,
            container:"legendDiv",
            layerInfos: [{
                layer: layer,
                title: "图例"
            }]
        });
        // legend.style = {
        //     type: "card",
        //     layout: "auto"
        // };
        // set_sourcelayer_renderer(layer,"gridcode");
        // app.mapView.ui.add(legend, "top-left");

        app.mapView.map.layers.add(layer);


    }
    function set_sourcelayer_renderer(layer,field) {
         var params = {
            layer: layer,
            field: field,
            // normalizationField: "EDUCBASECY",

            classificationMethod: "natural-breaks",
            numClasses: 5,
            legendOptions: {
              title: "% success renderer!"
            }
          };
         console.log("over");
          // generate the renderer and set it on the layer
          colorRendererCreator
            .createClassBreaksRenderer(params)
            .then(function(response) {
              layer.sublayers[0].renderer = response.renderer;
              // app.mapView.map.add(layer);

              if (!map.layers.includes(layer)) {
                app.mapView.map.add(layer);
              }
            });
    }
    function setBasemaps() {
        app.mapView.map.basemap = app.basemapSelected;
        app.sceneView.map.basemap = app.basemapSelectedAlt;
    }
}

// ------------------------------
// Edit Widgets
//------------------------------

function setEditWidgets(){
    const layer = new GraphicsLayer({
        id:"edit_graphicslayer",
        title:"编辑临时图层"
    });
    app.activeView.map.layers.add(layer);
    SetEditTools(app.activeView,layer);

}
//----------------------------------
// Search Widgets
//----------------------------------

function setSearchWidgets() {
    //TODO - Search Nav + Panel (detach/attach)
    app.searchWidgetNav = createSearchWidget("searchNavDiv", true);
    app.searchWidgetPanel = createSearchWidget("searchPanelDiv", true);
    app.searchWidgetSettings = createSearchWidget("settingsSearchDiv", false);

     // Create widget
    function createSearchWidget(parentId, showPopup) {
        var search = new Search({
            viewModel: {
              view: app.activeView,
              showPopupOnSelect: showPopup,
              highlightEnabled: false,
              maxSuggestions: 20
            },
            }, parentId);
        return search;
    }
}

//----------------------------------
// Colorpicker Widget
//----------------------------------

function setColorPicker() {
    app.colorPickerWidget = new ColorPicker({

        required: false,
        showRecentColors: false,
        showTransparencySlider: false
      }, "colorPickerDiv");
}


});