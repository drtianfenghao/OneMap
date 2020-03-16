function Dr_Render(mapview){
   require([
    "esri/renderers/ClassBreaksRenderer"
    ],function (ClassBreaksRenderer) {
        console.log("到renderer文件了");
        var renderer = {
            type: "simple",  // autocasts as new SimpleRenderer()
            symbol: {
                type: "simple-fill",  // autocasts as new SimpleFillSymbol()
                outline: {  // makes the outlines of all features consistently light gray
                  color: "lightgray",
                  width: 0.5
                }
            }
        };
        var renderer = {
            type: "simple",  // autocasts as new SimpleRenderer()
            symbol: defaultSym,  // the default symbol defined in step 1
            label: "% population in poverty by county",  // label for the legend
            visualVariables: [{
            type: "color",  // indicates this is a color visual variable
            field: "POP_POVERTY",  // total population in poverty
            normalizationField: "TOTPOP_CY",  // total population
            stops: [
            {
              value: 0.1,  // features where < 10% of the pop in poverty
              color: "#FFFCD4",  // will be assiged this color (beige)
              label: "10% or lower"  // label to display in the legend
            }, {
              value: 0.3,  // features where > 30% of the pop in poverty
              color: "#350242", // will be assigned this color (purple)
              label: "30% or higher"  // label to display in the legend
            }]

            // features with values between 0.1 - 0.3 will be assigned
            // a color on a ramp between beige and purple proportional
            // to where the value falls between 0.1 and 0.3

            }]
        };
   })
}
