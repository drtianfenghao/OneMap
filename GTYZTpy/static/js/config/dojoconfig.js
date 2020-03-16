var dojoConfig = {
      has: {
          "esri-promise-compatibility-deprecation-warnings": 0 // TODO
      },
      packages: [{
        name: "bootstrap",
        location: "/static/CalciteMap/vendor/dojo-bootstrap"
      },
      {
        name: "calcite-maps",
        location: "/static/CalciteMap/js/dojo"
        //location: location.pathname.replace(/\/[^/]+$/, "") + "./../../lib/js/dojo"
      },
      {
        name: "calcite-settings",
        location:"/static/CalciteMap/setting"
      }]
    };