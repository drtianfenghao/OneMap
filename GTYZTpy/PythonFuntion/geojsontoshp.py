#!/usr/bin/env python
# -*- coding: utf-8 -*-
import gdal
import osr
import ogr
import arcpy
class Geojson_Shp:
    def __init__(self,Geojson):
        self.geojson = Geojson
    def create_polygon(self,coords):

        ring = ogr.Geometry(ogr.wkbLinearRing)
        for coord in coords:
            for xy in coord:
                ring.AddPoint(xy[0], xy[1])
                poly = ogr.Geometry(ogr.wkbPolygon)
                poly.AddGeometry(ring)
        return poly.ExportToWkt()
    def GeojsonToShp(self):
        gdal.SetConfigOption("GDAL_FILENAME_IS_UTF8", "YES")
        gdal.SetConfigOption("SHAPE_ENCODING", "GBK")
        driver = ogr.GetDriverByName("ESRI Shapefile")
        polygon_data_source = driver.CreateDataSource('export_datasource')
        num = 1
        #要素集

        try:
            for i in self.geojson:
                geo = i['feature']['geometry']
                print geo
                geo_type = geo.get('type')
                if geo_type == 'polygon':
                    #'export_'+str(i['layerName'])
                    print num
                    num+=1
                    polygon_layer = polygon_data_source.CreateLayer(str(i['layerName']+str('_FID_'+i['feature']['attributes']['FID'])), geom_type=ogr.wkbPolygon)

                    att = i['feature']['attributes']

                    for key in att:
                        field_testfield = ogr.FieldDefn(str(key), ogr.OFTString)
                        field_testfield.SetWidth(254)
                        polygon_layer.CreateField(field_testfield)
                    polygonCOOR = geo.get('rings')

                    poly = self.create_polygon(polygonCOOR)
                    if poly:
                        feature = ogr.Feature(polygon_layer.GetLayerDefn())
                        for k in att:
                            feature.SetField(str(k),str(att[k]))
                        area = ogr.CreateGeometryFromWkt(poly)
                        feature.SetGeometry(area)
                        polygon_layer.CreateFeature(feature)
                        feature = None
        except Exception,e:

            print e


    # def GeojsonToMdb(self):
        # arcpy.CreatePersonalGDB_management('../', 'sy')
        # obj = Geojson_Shp()
        # a = obj.GeojsonToShp()

        # arcpy.CopyFeatures_management(polygon_layer, 'export_' + str(i['layerName'] + str('_FID_' + i['feature']['attributes']['FID'])))


