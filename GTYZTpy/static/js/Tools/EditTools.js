function SetEditTools(view,layer){
    require([
      "esri/widgets/Sketch"
    ], function(
      Sketch
    ) {
        const sketch = new Sketch({
            container:document.getElementById("settingsEditDiv"),
            layer: layer,
            view: view
        });


    });
}
