var return_file_name;
init_FileInput("input_fileinput_LoadTools", "/upload_tools/");
init_analysistoolbox_FileInput("input_analysistoolbox_LoadTools","/upload_tools/");
function ReturnInputFileName() {
    this.Name = return_file_name;
}
function init_FileInput(ctrlName, uploadUrl) {
    var control = $('#'+ ctrlName);
    control.fileinput({
        language: 'zh',
        uploadUrl: uploadUrl, // you must set a valid URL here else you will get an error'/upload_txt/'
        showUpload: true, //是否显示上传按钮
        showRemove : false, //显示移除按钮
        showPreview : true, //是否显示预览
        showCancel:false,
        showBrowse:true,//是否显示浏览按钮
        showCaption: true,//是否显示标题
        browseClass: "btn btn-primary", //按钮样式
        dropZoneEnabled: true,//是否显示拖拽区域
        allowedFileExtensions: ["txt","zip"],
        overwriteInitial: false,
        maxFileSize: 1000,
        maxFilesNum: 10,
        slugCallback: function (filename) {
            return filename.replace('(', '_').replace(']', '_');
        },
        layoutTemplates:{
            actionZoom:'',
            actionUpload: ''
        },
        fileuploaded:$('#'+ ctrlName).on("fileuploaded", function (event, data, previewId, index) {
            if(data.response.status == "success"){

                $("#input_txt").attr("value",data.files[0].name);

                var file_name = data.files[0].name;
                return_file_name =  file_name;
            }
        })

    });
}
function init_analysistoolbox_FileInput(ctrlName, uploadUrl) {
    var control = $('#'+ ctrlName);
    control.fileinput({
        language: 'zh',
        uploadUrl: uploadUrl, // you must set a valid URL here else you will get an error'/upload_txt/'
        showUpload: true, //是否显示上传按钮
        showRemove : false, //显示移除按钮
        showPreview : true, //是否显示预览
        showCancel:false,
        showBrowse:true,//是否显示浏览按钮
        showCaption: true,//是否显示标题
        browseClass: "btn btn-primary", //按钮样式
        dropZoneEnabled: true,//是否显示拖拽区域
        allowedFileExtensions: ["mdb"],
        overwriteInitial: false,
        maxFileSize: 20000,
        maxFilesNum: 10,
        slugCallback: function (filename) {
            return filename.replace('(', '_').replace(']', '_');
        },
        layoutTemplates:{
            actionZoom:'',
            actionUpload: ''
        },


    });
}
