/**
 * Created by 59308 on 2018/8/7 0007.
 */
function btadepter() {
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
    console.log("引用buttonadepter.js");
}

