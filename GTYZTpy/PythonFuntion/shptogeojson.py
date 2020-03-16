#!/usr/bin/env python
# -*- coding: utf-8 -*-
import gdal
import osr
import ogr
import json
import zipfile
import os

class shptogeojson:
    def __init__(self,zip):
        self.zip = zip

    def creategeojson(self,shp,is_write):
        gdal.SetConfigOption("GDAL_FILENAME_IS_UTF8", "YES")
        gdal.SetConfigOption("SHAPE_ENCOING", "GBK")
        driver = ogr.GetDriverByName("GeoJSON")
        ds = ogr.Open(shp, is_write)
        driver.CopyDataSource(ds, "uploadfolder/data.geojson")

    def loadgeojson(self):
        # result = eval(repr('uploadshp/data.geojson'))
        with open('uploadfolder/data.geojson', 'r') as f:
            data = json.load(f)
            return data
    #解压文件
    def unzip(self):
        # zpath 待处理zip文件
        # to_dir 目标文件夹
        # 实例化
        zip = zipfile.ZipFile(self.zip)
        # 一次性全部解压
        zip.extractall(path='uploadfolder')
        zip.close()
    def clearfile(self):
        for i in os.listdir('uploadfolder'):
            path_file = os.path.join('uploadfolder', i)
            if os.path.isfile(path_file):
                os.remove(path_file)
