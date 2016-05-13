import base64
import json
from json import encoder  # Used to prevent excessive decimals from being generated when dumping to JSON object
import logging
import os
import uuid

from django.contrib.staticfiles import finders
from django.http import HttpResponse
from django.db import connection
from django.shortcuts import render
from django.template.loader import render_to_string
from django.views.decorators.gzip import gzip_page
from django.views.decorators.csrf import csrf_exempt  # Potential security hole.
from django.views.generic import View

import geojson

from . import utils

logger = logging.getLogger(__name__)

encoder.FLOAT_REPR = lambda o: format(o, '.2f')

DRECP_EXTENT_INPUT = (-118.643362495192, 32.63395859796315, -114.1307816421658, 37.30277594765283)


@gzip_page
@csrf_exempt
def index(request):
    if request.method == 'POST':
        WKT = request.POST.get('wktPOST')
        reporting_units = request.POST.get('reporting_units')

        solar_slider_value = request.POST.get('solar_slider_value')

        ownership_values = request.POST.get('ownership_values')
        if ownership_values == '':
            ownership_values = 'BLM,Military,Native American,Other,Private,State Land,USFS'

        distance_to_transmission = request.POST.get('distance_to_transmission')
        distance_to_transmission_units = request.POST.get('distance_to_transmission_units')
        if distance_to_transmission_units == 'miles':
            distance_conversion_factor = 1609.344
        else:
            distance_conversion_factor = 1000

        enable_environment_settings = request.POST.get('enable_environment_settings') == 'true'
        if enable_environment_settings:
            ti_slider = request.POST.get('ti_slider')
            cv_slider = request.POST.get('cv_slider')
            species_count_slider_value = request.POST.get('species_count_slider_value')
            chat_slider_value = request.POST.get('chat_slider_value')

        exemptions = " and gap_sts NOT IN('1')"

        # corridor_avoidance_slider_value = request.POST.get('corridor_avoidance_slider_value')
        # cdfw_slider_value = request.POST.get('cdfw_slider_value')

        min_area = float(request.POST.get('min_area'))
        min_area_units = request.POST.get('min_area_units')

        if min_area_units == 'meters':
            area_conversion_factor = 1
        elif min_area_units == 'acres':
            area_conversion_factor = 4046.86
        elif min_area_units == 'hectares':
            area_conversion_factor = 10000
        elif min_area_units == 'square_km':
            area_conversion_factor = 1e+6
        elif min_area_units == 'square_mi':
            area_conversion_factor = 2.59e+6
        elif min_area_units == 'square_feet':
            area_conversion_factor = 0.092903
        else:
            area_conversion_factor = 1

    else:
        WKT = request.GET.get('user_wkt')
        reporting_units = request.GET.get('reporting_units', "onekm")

    template = request.GET.get('template')
    if not template:
        template = 'index'

    query_layer = "energy_scenario_1km_query_grid"

    stats_fields = None

    if reporting_units == "counties":
        reporting_units_table = "drecp_reporting_units_county_boundaries_no_simplify"
        name_field = "name_pcase"

    if reporting_units == "ecoregion_subareas":
        reporting_units_table = "drecp_reporting_units_ecoregion_subareas_no_simplify"
        name_field = "sa_name"

    if reporting_units == "blm_field_offices":
        reporting_units_table = "drecp_reporting_units_blm_field_offices_no_simplify"
        name_field = "fo_name"

    if reporting_units == "deto_recovery_units":
        reporting_units_table = "drecp_reporting_units_deto_recovery_units_no_simplify"
        name_field = "unit_name"

    if reporting_units == "huc5_watersheds":
        reporting_units_table = "drecp_reporting_units_huc5_watersheds_1_5_simplify"
        name_field = "Name"

    elif reporting_units == "onekm":
        reporting_units_table = "drecp_reporting_units_1km_poly_v2"
        name_field = "''"

    # California
    # initial_lat=37.229722
    # initial_lon=-121.509444

    # DRECP
    initial_lat = 34.8
    initial_lon = -116.7

    zoomLevel = int(request.POST.get('zoomLevel', 8))

    cursor = connection.cursor()

    ########################################### INITIALIZATION RESPONSE ################################################
    if not WKT:
        WKT = "SRID=4326;POINT(-115.7 34.8)"
        context = {'template': template,
                   'zoomLevel': zoomLevel,
                   'reporting_units': reporting_units,
                   'WKT_SelectedPolys': WKT,
                   'initial_lat': initial_lat,
                   'initial_lon': initial_lon,
                   'count': 0}

    #################################### OR DATABASE QUERY (SELECT FEATURES) ###########################################
    ############################################ BUILD SQL EXPRESSION ##################################################

    else:
        ################################### BUILD SELECT LIST (FIELDS & TABLES) ########################################
        select_list = "SELECT "

        if stats_fields:

            for field in stats_fields.split(','):
                select_list += "sum(" + field + " * shape_area)/sum(shape_area)" + " as " + field + "_" + "avg" + ","

        # Aggregates: Count, Unique CSV from name field, Outline of selected features.
        select_list += "count(*) as count, "

        select_list += "string_agg(" + name_field + ", ',') as features_names, "
        # Sum of the area of selected features for area weighted average. Maybe report later.
        # select_list+="sum(shape_area) as sum_area, "

        select_list += "ST_AsText(ST_SnapToGrid(ST_Force_2D(ST_Union(geom)), .0001)) as outline_of_selected_features"

        table_list = " FROM " + reporting_units_table

        select_fields_from_table = select_list + table_list

        ############################ "WHERE" (ADD ASPATIAL SEARCH CONDITIONS) ##########################################
        if WKT == 'aspatial':

            query_field = request.GET.get('queryField')
            operator = request.GET.get('operator').strip()
            string_or_value = request.GET.get('stringOrValue').lower().strip()

            if operator == "LIKE":
                select_statement = select_fields_from_table + " where LOWER(" + query_field + ") " + operator + "%s"
            elif operator == ">" or operator == "<":
                select_statement = select_fields_from_table + " where " + query_field + operator + string_or_value
            else:
                select_statement = select_fields_from_table + " where LOWER(" + query_field + ") " + operator + " '" + \
                                   string_or_value + "'"

        ########################## or "WHERE" (ADD SPATIAL SEARCH CONDITIONS) ##########################################
        else:

            WKT = WKT.replace('%', ' ')
            WKT = "SRID=4326;" + WKT
            select_statement = select_fields_from_table + " where ST_Intersects('" + WKT + "', " + reporting_units_table + ".geom)"

            operator = None

        ######################################## EXECUTE DATABASE QUERY ################################################

        if operator == "LIKE":
            cursor.execute(select_statement, ['%' + string_or_value + '%'])
        else:
            cursor.execute(select_statement)

        # print select_statement
        ################################# STORE COLUMN, VALUE PAIRS IN A DICT ##########################################

        results_dict = {}

        # Get field names
        columns = [colName[0] for colName in cursor.description]

        for row in cursor:
            for i in range(len(row)):
                if isinstance(row[i], basestring):
                    results_dict[columns[i]] = row[i].strip()
                else:
                    results_dict[columns[i]] = (float(round(row[i], 2)))

        # return HttpResponse(results_dict['sum_area'])

        WKT_search_area = results_dict['outline_of_selected_features']
        WKT_search_area = WKT_search_area.replace('%', ' ')
        WKT_search_area = "SRID=4326;" + WKT_search_area

        features_names = []
        features_names.extend(results_dict['features_names'].split(','))
        features_names = list(set(features_names))
        features_names.sort()

        # Remove these from the Dictionary before dumping to a JSON object (causing error & no need to send twice).
        results_dict.pop('outline_of_selected_features', 0)
        results_dict.pop('features_names', 0)

        count = int(results_dict["count"])

        # Take fieldname,value pairs from the dict and dump to a JSON string.
        results_json = json.dumps(results_dict)

        ################################## GRID CELL Query (Find suitable polygons) ####################################

        cursor = connection.cursor()

        # initial query. Find suitable polygons
        query1 = "create temp table temp1 as SELECT ST_Union(geom) as the_geom from " + query_layer + " where dniann >=" + solar_slider_value + " and ownership = ANY('" + "{" + ownership_values + "}" + "'::text[]) "

        if enable_environment_settings:
            query1 += " and intactness <=" + ti_slider + "and hi_linkage <=" + cv_slider + " and speciescou <=" + species_count_slider_value + " and ch_rank >=" + chat_slider_value
        if distance_to_transmission:
            query1 += " and dist_trans <= " + str(float(distance_to_transmission) * distance_conversion_factor)
        if WKT:
            query1 += "and ST_Intersects('" + WKT_search_area + "', " + query_layer + ".geom)" + exemptions

        cursor.execute(query1)

        # explode to isolate smaller shapes
        query2 = "create temp table temp2 as select (st_dump(the_geom)).geom as geom2 from temp1;"
        cursor.execute(query2)

        # remove smaller shapes
        query3 = "alter table temp2 add area float; " \
                 "update temp2 set area = st_area(geom2::geography); " \
                 "delete from temp2 where area < " + str(min_area * area_conversion_factor) + ";"

        cursor.execute(query3)

        query4 = "create temp table temp3 as select (st_dump(ST_Union(geom2))).geom as the_geom from temp2;"
        cursor.execute(query4)

        onekm_query = "SELECT ST_AsText(ST_SnapToGrid(ST_Force_2D(ST_Union(the_geom)), .0001)) as outline_of_selected_features from temp3"

        cursor.execute(onekm_query)

        onekmDict = {}

        # Get field names
        columns = [colName[0] for colName in cursor.description]

        for row in cursor:
            for i in range(len(row)):
                if isinstance(row[i], basestring):
                    onekmDict[columns[i]] = row[i].strip()
                else:
                    onekmDict[columns[i]] = (float(round(row[i], 2)))

        WKT_selected_polys = onekmDict['outline_of_selected_features']
        # The version of PostGIS on Webfaction was returning SRID=4326 in the multipolygon (check the console for last_poly). It was causing Leaflet to Break. t is null. This was the solution.
        WKT_selected_polys = WKT_selected_polys.replace('SRID=4326;', '')

        area_query = "SELECT ST_Area(ST_GeogFromText(" + "'" + WKT_selected_polys + "'" + ")) as total_area"
        cursor.execute(area_query)
        area_meters = cursor.fetchone()[0]
        area_acres = area_meters * 0.0002471044
        # area_km=area_meters*1000000.0

        if reporting_units == 'onekm':
            WKT_search_area = WKT

        # report = generate_report(WKT, WKT_selected_polys)

        context = {'template': template,
                   'WKT_SelectedPolys': WKT_selected_polys,
                   'WKT_SearchArea': WKT_search_area,
                   'reporting_units': reporting_units,
                   'totalArea': area_acres,
                   'zoomLevel': zoomLevel, 'count': count,
                   'initial_lat': initial_lat,
                   'initial_lon': initial_lon,
                   'resultsJSON': results_json,
                   'categoricalValues': features_names,
                   # 'report': report,
                   'error': 0,
                   }

    if request.method == 'POST':
        return HttpResponse(json.dumps(context))
    else:
        return render(request, template + '.html', context)


"""
def errorHandler(reporting_units, template, initial_lat, initial_lon, error, selectionWarning):
    WKT = "SRID=4326;POLYGON((-180 0,-180 0,-180 0,-180 0,-180 0))"
    context = {'template': template,
               'zoomLevel': 8,
               'reporting_units': reporting_units,
               'WKT_SelectedPolys': WKT,
               'initial_lat': initial_lat,
               'initial_lon': initial_lon,
               # Need this Below
               #'resultsJSON': results_json,
               'count': 0,
               'error': error,
               'selectionWarning': selectionWarning,
               'totalArea': 0,
               }
    return context
"""


class ReportView(View):
    report_template = 'report_template.html'

    def get(self, request, *args, **kwargs):
        ctx = self.generate_report()
        return render(request, self.report_template, ctx)

    def get_cwd(self):
        """
        :return: current working directory for the current session
        """
        working_dir = self.request.session.get('working_dir')

        if working_dir and os.path.exists(working_dir):
            return working_dir

        working_dir = os.path.join('tmp', str(uuid.uuid4()))

        if not os.path.exists(working_dir):
            os.makedirs(working_dir)

        self.request.session['working_dir'] = working_dir

        return working_dir

    def get_basemap(self, extent):
        if self.request.session.get('original_extent') == extent and self.request.session.get('updated_extent') and \
                self.request.session.get('basemap'):
            return self.request.session['basemap'], self.request.session['updated_extent']

        basemap, updated_extent, h_err_ratio = utils.Basemap(
            extent, 'http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            width=150, height=95, output_file=os.path.join(self.cwd, 'study_area.png')
        ).render()
        print(h_err_ratio)

        self.request.session['original_extent'] = extent
        self.request.session['updated_extent'] = updated_extent
        self.request.session['basemap'] = basemap

        return basemap, updated_extent

    def generate_report(self):
        ctx = {}

        self.cwd = self.get_cwd()

        drecp_png, drecp_extent = self.get_drecp()

        selected_wkt = self.request.GET['wktPOST']
        study_area_bbox = utils.get_bbox(selected_wkt)

        ctx.update(self.get_header(study_area_bbox, drecp_extent))

        basemap, study_area_bbox_updated = self.get_basemap(study_area_bbox)

        selected_geojson = utils.wkt_to_geojson(selected_wkt)
        json_path = os.path.join(self.cwd, 'selected.json')
        f = open(json_path, 'w')
        f.write(geojson.dumps(geojson.FeatureCollection([selected_geojson])))
        f.close()

        return ctx

    def get_drecp(self):
        style_path = finders.find('style')
        drecp_png_path = str(os.path.join(style_path, 'drecp.png'))
        drecp_bbox_path = str(os.path.join(style_path, 'drecp_bbox'))

        if os.path.exists(drecp_png_path) and os.path.exists(drecp_bbox_path):
            drecp_bbox = json.loads(open(drecp_bbox_path, 'r').read())
            return drecp_png_path, drecp_bbox

        basemap, extent_updated, h_err_ratio = utils.Basemap(
            DRECP_EXTENT_INPUT,
            'http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            width=100, height=120, output_file=os.path.join(style_path, 'drecp_basemap.png')
        ).render()

        extent_plain = list(extent_updated)
        extent_plain.pop()  # Basemap class return a namedtuple, which contains srid. Mapnik class only needs a bbox, so srid is removed from extent.

        w, h = utils.get_image_size(basemap)

        utils.Mapnik(w, h, extent_plain, str(os.path.join(style_path, 'drecp.xml'))).render_to_file(drecp_png_path)

        f = open(drecp_bbox_path, 'w')
        f.write(json.dumps(extent_plain))
        f.close()

        return os.path.join(style_path, 'drecp.png'), extent_plain

    def get_header(self, study_area_bbox, drecp_bbox):
        study_area_marker = ((study_area_bbox[2] + study_area_bbox[0]) / 2.0,
                             (study_area_bbox[3] + study_area_bbox[1]) / 2.0)
        study_area_marker = geojson.Point(study_area_marker)
        f = open(os.path.join(self.cwd, 'thumbnail.json'), 'w')
        f.write(geojson.dumps(geojson.FeatureCollection([geojson.Feature(geometry=study_area_marker)])))
        f.close()

        thumbnail_xml_path = os.path.join(self.cwd, 'thumbnail.xml')

        f = open(thumbnail_xml_path, 'w')
        f.write(render_to_string('mapnik/thumbnail.xml', {'style_path': finders.find('style')}))
        f.close()

        t = utils.Mapnik(100, 120, drecp_bbox, thumbnail_xml_path).render_to_byte()
        return {'header_thumbnail': base64.b64encode(t)}
