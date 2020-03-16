#!/usr/bin/env python
# -*- coding: utf-8 -*-
from django.shortcuts import render
from django.http import JsonResponse
from django.http import HttpResponse
import arcpy
import xlwt
from django.views.generic.base import View
from django.core.servers.basehttp import FileWrapper
import shutil
from io import BytesIO
import json
import gdal
import osr
import ogr
import zipfile
import os
import io
import  decimal
from PythonFuntion.filetozip import ZipUtilities
from PythonFuntion.geojsontoshp import Geojson_Shp
from PythonFuntion.shptogeojson import shptogeojson
from PythonFuntion.txttogeojson import txttogeojson
import sys
reload(sys)

sys.setdefaultencoding( "utf-8" )
# Create your views here.
# class mapserver_view(View):
#     form_class = []
#     template_name = 'mapserver.html'
#     def get(self,request):
#         if request.is_ajax():
#         # data =json.loads(request.body.replace("'", "\""))
#             data = json.loads(request.body.replace("'", "\""))
#             self.form_class = data
#             return render(request,'mapserver.html')
#     def post(self,request):
#         return render(request, 'mapserver.html')

def mainview(request):
    return render(request,'mapserver.html')
def mapindexview(request):
    return render(request,'MapIndex.html')
def syindexview(request):
    return render(request,'index1.html')
def sytheme(request):
    return render(request,'index2.html')
def get_attributes(request):
    if request.is_ajax():

        data =json.loads(request.body.replace("'", "\""))
        global datanew
        datanew = data
        response = JsonResponse(datanew,safe=False)
        return response
def post_attributes(request):
    if request.is_ajax():

        response = JsonResponse(datanew,safe=False)
        return response
def post_figure(request):
    if request.is_ajax()and request.method == 'POST':
        code = request.POST.get(u"code")
        print code
        InputField = 'DLBM;Shape_Area;QSXZ;QSDWMC'
        InputFeature = r'C:\Users\59308\Desktop\YZT\syfolder\sy.mdb\DLTB'
        lstfield = InputField.split(";")
        lstdata_DLBM = []
        lstdata_area = []
        lstdata_QSXZ = []
        lstdata_DWMC = []
        dic = {}
        with arcpy.da.SearchCursor(InputFeature, lstfield) as cursor:
            for row in cursor:
                DLBM = row[lstfield.index('DLBM')]
                SHAPE_Area = row[lstfield.index('Shape_Area')]
                QSXZ = row[lstfield.index('QSXZ')]
                QSDWMC = row[lstfield.index('QSDWMC')]
                lstdata_DLBM.append(DLBM)
                lstdata_area.append(SHAPE_Area)
                lstdata_QSXZ.append(QSXZ)
                lstdata_DWMC.append(QSDWMC)
        set_DLBM = set(lstdata_DLBM)
        lstsum = []
        for i in set_DLBM:
            k = []
            for u in range(len(lstdata_DLBM)):
                if lstdata_DLBM[u] == i:
                    k.append(lstdata_area[u])
            lstsum.append(sum(k))
            # dic.update({"%s" % str(i): sum(k)})
        dic.update({"DT":lstsum})
        dic.update({'LB': list(set_DLBM)})
        response = JsonResponse(dic,safe=False)
        return response
def post_swipe_treelist(request):
    if request.is_ajax():

        data_list = [{"id": 0, "text":"取消"},
                     # {"id": 1, "text":"乡镇界线"},
                     # {"id": 2, "text": "地籍子区"},
                     # {"id": 3, "text": "地籍区"},
                     # {"id": 4, "text": "主干道"},
                     # {"id": 5, "text": "城区规划2013"},
                     # {"id": 6, "text": "建设用地供应界线"},
                     {"id": 7, "text": "临时用地"},
                     {"id": 8, "text": "征地界线"},
                     # {"id": 9, "text": "土地储备"},
                     {"id": 10, "text": "宗地"},
                     # {"id": 11, "text": "所有权宗地"},
                     # {"id": 12, "text": "耕地后备资源"},
                     # {"id": 13, "text": "基本农田保护区2013"},
                     # {"id": 14, "text": "建设用地管制区2013"},
                     {"id": 15, "text": "承包经营权"},
                     # {"id": 16, "text": "工业用地级别基准地价2016"},
                     {"id": 17, "text": "地类图斑2016"}
                     # {"id": 18, "text": "民政街道界线"},
                     # {"id": 19, "text": "林斑图2014"}
                     ]
        response = JsonResponse(data_list,safe=False)
        return response
def export_excel(request):

    # 设置HTTPResponse的类型
    response = HttpResponse(content_type='application/vnd.ms-excel')
    response['Content-Disposition'] = 'attachment;filename=order.xls'
    # 创建一个文件对象
    wb = xlwt.Workbook(encoding='utf8')
    # 创建一个sheet对象
    sheet = wb.add_sheet('order-sheet',cell_overwrite_ok=True)
    # 设置文件头的样式,这个不是必须的可以根据自己的需求进行更改
    style_heading = xlwt.easyxf("""
                font:
                    name Arial,
                    colour_index white,
                    bold on,
                    height 0xA0;
                align:
                    wrap off,
                    vert center,
                    horiz center;
                pattern:
                    pattern solid,
                    fore-colour 0x19;
                borders:
                    left THIN,
                    right THIN,
                    top THIN,
                    bottom THIN;
                     """)
    # 写入文件标题
    title = []


    for key in datanew[0]:
        title.append(key)
    # title = datanew["field"]

    # 写入数据
    # data = datanew["data"][0]
    #读取数据量
    row = len(datanew)
    #第一位 行数 第二位列数(除了第一列 itemid列) 第三位 值
    for j in range(row):
        for i in range(len(title)):

            sheet.write(0, i,title[i], style_heading)
            sheet.write(j+1, i, datanew[j][title[i]])

    # 写出到IO
    output = BytesIO()
    wb.save(output)
    # 重新定位到开始
    output.seek(0)
    response.write(output.getvalue())
    return response

def post_datagrid_page(request):
    page = int(request.GET.get('page', ''))-1
    rows = int(request.GET.get('rows', ''))
    allList = datanew
    total = len(allList)
    rowPageList = []  # 存储分页数据：一个页面的数据
    #  分页处理
    if (page == 0):  # 第1页
        page = 1
        if (rows > len(allList)):  # 第1页  数据未达到1页行数
            json_data_list = {'rows': allList, 'total': total}
        else:  # 第1页  数据超到1页行数
            for s in range(page * rows):
                rowPageList.append(allList[s])
                json_data_list = {'rows': rowPageList, 'total': total}
    else:  # 非第1页

        ss = allList[page * rows:]
        if (len(ss) < rows):  # 非第1页  剩余数据未达到1页行数
            json_data_list = {'rows': ss, 'total': total}

        else:  # 非第1页  剩余数据超过1页行数
            for i in range(rows):#page *

                rowPageList.append(ss[i])
                json_data_list = {'rows': rowPageList, 'total': total}

    return HttpResponse(json.dumps(json_data_list), content_type='application/json; charset=utf-8')

def shptoGeojson(file):

    scratch_name = arcpy.CreateScratchName("temp",data_type="json",workspace="in_memory")
    arcpy.FeaturesToJSON_conversion(file, scratch_name)
    return_json = {}
    with open(scratch_name, "w") as f:
        json.dump(return_json, f)
    return return_json

def Geojsontoshp(request):
    #读取传过来的json数据datanew['geojson']
    geojson = datanew['geojson']
    print datanew
    #获取geojson转shp对象
    obj = Geojson_Shp(geojson)
    #获取返回文件夹
    obj.GeojsonToShp()
    # 导出压缩包
    utilities = ZipUtilities()
    rootdir = 'export_datasource'
    file_objs = os.listdir(rootdir)  # 列出文件夹下所有的目录与文件


    for file_obj in file_objs:
        tmp_dl_path = os.path.join(rootdir, file_obj)
        utilities.toZip(tmp_dl_path, file_obj)

    # utilities.close()

    response = HttpResponse(utilities.zip_file, content_type='application/zip')
    response['Content-Disposition'] = 'attachment;filename="{0}"'.format("导出ShapeFile.zip")
    # 删除生成的文件
    shutil.rmtree(rootdir)
    return response
def upload_tools(request):
    file_obj = request.FILES.get('file_LoadTools')

    f = open(os.path.join('uploadfolder', file_obj.name), 'wb')
    for chunk in file_obj.chunks():
        f.write(chunk)
    f.close()
    ret = {'status': "success"}
    return HttpResponse(json.dumps(ret))
def upload_execute(request):
    if request.method == 'POST':

        file_name = json.loads(request.body.replace("'", "\"")).get(u"filename")
        print file_name
        file = 'uploadfolder/' + file_name
        if file_name.split(".")[1] == "txt":
            print "load_txt"
            obj = txttogeojson(file)

            geojson = obj.togeojson()
            print geojson
            response = JsonResponse(geojson, safe=False)
            return response
        elif file_name.split(".")[1] == "zip":
            print "load_zip"
            # f = open(os.path.join('uploadshp', file_obj.name), 'wb')
            # for chunk in file_obj.chunks():
            #     f.write(chunk)
            # f.close()
            # shpzip = 'uploadshp/'+file_obj.name
            obj = shptogeojson(file)
            obj.unzip()

            pathlist = os.listdir('uploadfolder/')
            for filename in pathlist:
                if filename.endswith('shp'):
                    shapename = filename.decode("gbk").encode("utf-8")
                    obj.creategeojson('uploadfolder/' + shapename, 0)

            geojson = obj.loadgeojson()
            print geojson
            response = JsonResponse(geojson, safe=False)
            os.remove('uploadfolder/'+file_name)
            os.remove('uploadfolder/data.geojson')
            obj.clearfile()
            return response



