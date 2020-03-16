#!/usr/bin/env python
# -*- coding: utf-8 -*-
class txttogeojson:
    def __init__(self,obj):
        self.obj = obj
    def togeojson(self):
        file = open(self.obj)
        f = file.readlines()
        k = []
        for i in f:
            k.append(list(eval(i.replace("\n",""))))

        file.close()
        print k
        json = {

            "type": "FeatureCollection",
            "name":'Export_Output_2',
            "features":[{
                "geometry":{
                    "type":"Polygon",
                    "coordinates":[k]
                },
                "type":"Feature"
            }]
        }
        #
        # {u'crs': {u'type': u'name', u'properties': {u'name': u'urn:ogc:def:crs:OGC:1.3:CRS84'}},
        #  u'type': u'FeatureCollection', u'name': u'Export_Output_2', u'features': [{u'geometry': {
        #     u'type': u'Polygon', u'coordinates': [
        #         [[129.11592144500003, 42.942302881000046], [129.422306778, 43.06693420300007],
        #          [129.81177965900008, 42.79689967200005], [129.5729029590001, 42.61514566000005],
        #          [129.0068690380001, 42.521672169000055], [129.11592144500003, 42.942302881000046]]]},
        #     u'type': u'Feature', u'id': 0,
        #     u'properties': {
        #         u'SHAPE_Leng': 2.11309040836,
        #         u'SHAPE_Area': 0.26019067134,
        #         u'OBJECTID': 1}}]}
        return json

