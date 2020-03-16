function Dr_Search(){
    require([
        "esri/tasks/FindTask",
        "esri/tasks/support/FindParameters",
    ],function (FindTask,FindParameters) {

        $.ajax({
            url:'/post_swipe_treelist/',
            dataType: "json",
            success: function (data) {
                for(var i=0;i<data.length;i++){
                    $('#settingsSelectLayer').append("<option value=" + data[i].id +">"+ data[i].text + "</option>");
                }
                // $('#settingsSelectLayer').selectpicker('refresh');//刷新插件
                // $('#settingsSelectLayer').selectpicker('render');
                var G=null;
                var field = null;
                var layer = null;
                var findTask = null;
                var findParams = null;
                var id = null;
                var label = null;
                $('#settingsSelectLayer').on("change", function (e) {
                    var changeindex = $('#settingsSelectLayer').val();
                    if(changeindex){
                        switch (parseInt(changeindex)) {
                            case 0:
                                label = [{"id": 0, "text": "None"}];
                                break;
                            case 10:
                                label = [{"id": 0, "text": "LDJH"}, {"id": 1, "text": "ZDDM"}];
                                break;
                            case 7:
                                label = [{"id": 0, "text": "批准文号"}];
                                break;
                            case 8:
                                label = [{"id": 0, "text": "上级批准文"}];
                                break;
                            case 15:
                                label = [{"id": 0, "text": "DKBM"}];
                                break;
                            case 17:
                                label = [{"id": 0, "text": "QSDWMC"}];
                                break;
                        }
                        $('#settingsSelectFields').empty();//重置
                        for(var i=0;i<label.length;i++){

                            $('#settingsSelectFields').append("<option value=" + label[i].id +">"+ label[i].text + "</option>");
                        }

                        var search_ok_Button = document.getElementById("Searchok");
                        search_ok_Button.onclick = function () {
                            $("#table_window").window("open");
                            G=document.getElementById('settingSearchValues').value;
                            field = label[0].text;
                            layer = parseInt(changeindex)-1;
                            findTask = new FindTask("https://localhost:6443/arcgis/rest/services/XSDT/%E5%8F%91%E5%B8%831/MapServer");

                            findParams = new FindParameters();
                            findParams.returnGeometry = true;
                            findParams.layerIds = [""+layer+""];

                            select_search_layer = name;
                            findParams.searchFields = [""+field+""];
                            findParams.searchText =  G;
                            findParams.outFields = ["*"];
                            console.log(findTask);
                            findTask.execute(findParams)
                                .then(showAllData)
                                .catch(rejectedPromise);
                        };
                    }

                });






            }
        });


        function rejectedPromise(error) {
            console.error("Promise didn't resolve: ", error.message);
        }

        function showAllData(results){
		    //图层查询结果
             var tableId,producttitle;
		     if(results.results[0].layerId){
		          tableId = "dg_search"+results.results[0].layerId;
		          producttitle = results.results[0].layerName+"查询结果";

             }else{
		          tableId = "dg_analygy"+results.results[0].feature.attributes.layerId;
		          producttitle = results.results[0].feature.attributes.layerName+"分析结果";

             }

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
            // console.log("loaddata");
            var shpdata = [];
            //清空原DIV
            //map.graphics.clear();

            if(results.results.length!==0){
                var items = [];

                for (var i = 0; i < results.results.length; i++) {

                    items.push(results.results[i].feature.attributes);//append each attribute list as item in store
                    shpdata.push(results.results[i]);


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

                                 for (var i = 0, il = results.results.length; i < il; i++) {

                                    var currentGraphic = results.results[i];

                                    for(var k=0;k<row.length;k++){
                                         var gridFid = row[k].FID;
                                         if ((currentGraphic.feature.attributes) && currentGraphic.feature.attributes.FID == gridFid) {
                                             var format = {"layerId":currentGraphic.layerId,"layerName":currentGraphic.layerName,"feature":{"attributes":currentGraphic.feature.attributes,"geometry":{"rings":currentGraphic.feature.geometry.rings,"type":currentGraphic.feature.geometry.type}}};

                                             // format["layerId"] = currentGraphic.layerId;
                                             // format["layerName"] = currentGraphic.layerName;
                                             // format.feature.geometry.rings = currentGraphic.feature.geometry.rings;
                                             // format.feature.geometry.type = currentGraphic.feature.geometry.type;
                                             selectedfeatures.push(format) ;

                                         }
                                    }

                                 }

                                 // if(results.results[0].layerId){
                                 //
                                 // }else{
                                 //     //加入layerid和layername两个key
                                 //      var layerName = results.results[0].feature.attributes.layerName;
                                 //      var layerId = results.results[0].feature.attributes.layerId;
                                 //      // selectedfeatures[0].layerName = layerName;
                                 //      // selectedfeatures[0].layerId = layerId
                                 //
                                 //
                                 // }

                                 var postfeatures = {};
                                 postfeatures["geojson"]=selectedfeatures;
                                 // console.log(postfeatures);
                                 // console.log(JSON.stringify(postfeatures));
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
                            console.log(JSON.stringify(current_page_rows))
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

    })
}