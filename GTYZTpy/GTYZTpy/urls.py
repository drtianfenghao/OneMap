"""GTYZTpy URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.8/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Add an import:  from blog import urls as blog_urls
    2. Add a URL to urlpatterns:  url(r'^blog/', include(blog_urls))
"""
from django.conf.urls import include, url
from django.contrib import admin
from index import indexviews
# from mapserver.mapserverviews import mapserver_view
from mapserver.mapserverviews import *

urlpatterns = [
    # url(r'^admin/', include(admin.site.urls)),
    url(r'^index', indexviews.index),
    # url(r'^mapserver', mapserver_view.as_view(),name='mapserver')
    url(r'^mapserver', mainview),
    url(r'^MapIndex', mapindexview),
    url(r'^syindex', syindexview),
    url(r'^OneMapIndex', sytheme),
    url(r'^get_attributes',get_attributes),
    url(r'^post_attributes',post_attributes),
    url(r'^post_figure', post_figure),
    url(r'^post_swipe_treelist', post_swipe_treelist),
    url(r'^export_excel', export_excel),
    url(r'^post_datagrid_page', post_datagrid_page),
    url(r'^Geojsontoshp', Geojsontoshp),
    url(r'^upload_execute', upload_execute),
    url(r'^upload_tools', upload_tools)



]
