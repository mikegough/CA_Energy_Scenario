from django.http import HttpResponse
import urllib

from django.shortcuts import render
from django.db import connection
import json
#The encoder module is used to prevent excessive decimals from being generated when dumping to JSON object
from json import encoder
encoder.FLOAT_REPR = lambda o: format(o, '.2f')

from django.views.decorators.gzip import gzip_page

#Potential security hole.
from django.views.decorators.csrf import csrf_exempt

@gzip_page
@csrf_exempt
def index(request):

    if request.method == 'POST':
        WKT = request.POST.get('wktPOST')
        reporting_units=request.POST.get('reporting_units')
        solar_slider_value = request.POST.get('solar_slider_value')
        ownership_values = request.POST.get('ownership_values')

        enable_environment_settings = request.POST.get('enable_environment_settings')

        if enable_environment_settings == '0':
            ti_slider='99999999'
            cv_slider='99999999'
            species_count_slider_value='99999999'
            chat_slider_value = '-99999999'

        else:
            ti_slider = request.POST.get('ti_slider')
            cv_slider = request.POST.get('cv_slider')
            species_count_slider_value = request.POST.get('species_count_slider_value')
            chat_slider_value = request.POST.get('chat_slider_value')

        if ownership_values == '':
            ownership_values='BLM,Military,Native American,Other,Private,State Land,USFS'

        exemptions=" and gap_sts NOT IN('1')"

        corridor_avoidance_slider_value = request.POST.get('corridor_avoidance_slider_value')
        cdfw_slider_value = request.POST.get('cdfw_slider_value')

        min_area = float(request.POST.get('min_area'))
        min_area_units = request.POST.get('min_area_units')
        #1 square km = 247.105 acres.

        if min_area_units == 'meters':
            area_conversion_factor=1
        elif min_area_units == 'acres':
            area_conversion_factor=4046.86
        elif min_area_units == 'hectares':
            area_conversion_factor=10000
        elif min_area_units == 'square_km':
            area_conversion_factor=1e+6
        elif min_area_units == 'square_mi':
            area_conversion_factor=2.59e+6
        elif min_area_units == 'square_feet':
            area_conversion_factor=0.092903
        else:
            area_conversion_factor=1

    else:
        WKT=request.GET.get('user_wkt')
        reporting_units=request.GET.get('reporting_units', "counties")

    ############################################# INPUT PARAMETERS #####################################################

    template=request.GET.get('template')
    if not template:
        template='index'

    query_layer="energy_scenario_1km_query_grid"

    #statsFields="intactness"
    statsFields=None

    if reporting_units == "counties":
        table="drecp_reporting_units_county_boundaries_no_simplify"
        featureName="County"
        featureNamePlural="Counties"
        categoricalFields="name_pcase"

    if reporting_units == "ecoregion_subareas":
        table="drecp_reporting_units_ecoregion_subareas_no_simplify"
        featureName="Ecoregion Subarea"
        featureNamePlural="Ecoregion Subareas"
        categoricalFields="sa_name"

    if reporting_units == "blm_field_offices":
        table="drecp_reporting_units_blm_field_offices_no_simplify"
        featureName="BLM Field Office"
        featureNamePlural="BLM Field Offices"
        categoricalFields="fo_name"

    if reporting_units == "deto_recovery_units":
        table="drecp_reporting_units_deto_recovery_units_no_simplify"
        featureName="Desert Tortoise Recovery Unit"
        featureNamePlural="Desert Tortoise Recovery Units"
        categoricalFields="unit_name"

    if reporting_units == "huc5_watersheds":
        table="drecp_reporting_units_huc5_watersheds_1_5_simplify"
        featureName="HUC5 Watersheds"
        featureNamePlural="HUC5 Watersheds"
        categoricalFields="Name"

    elif reporting_units == "onekm":
        table="drecp_reporting_units_1km_poly_v2"
        featureName="1km Reporting Unit"
        featureNamePlural="1km Reporting Units"
        categoricalFields="''"

    #areaField="shape_area" #Dataset needs an area field in a PCS (not Lat,Lon).
    #areaConversionDivisor=1000000 #m2 to km2

    totalArea=1

    #California
    initial_lat=37.229722
    initial_lon=-121.509444

    #DRECP
    initial_lat=34.8
    initial_lon=-116.7

    zoomLevel = int(request.POST.get('zoomLevel',8))

    #Not used in AWA calculation
    #PostgresStatsToRetrieve=['avg']

    cursor = connection.cursor()

    ########################################### INITIALIZATION RESPONSE ################################################
    if not WKT:
        initialize=1
        WKT="SRID=4326;POINT(-115.7 34.8)"
        context={'template': template,
                 'zoomLevel': zoomLevel,
                 'reporting_units': reporting_units,
                 'initialize': initialize,
                 'WKT_SelectedPolys': WKT,
                 'initial_lat':initial_lat,
                 'initial_lon': initial_lon,
                 'count': 0}

    #################################### OR DATABASE QUERY (SELECT FEATURES) ###########################################
    ############################################ BUILD SQL EXPRESSION ##################################################

    else:
        initialize=0

        ################################### BUILD SELECT LIST (FIELDS & TABLES) ########################################
        selectList="SELECT "

        if statsFields:

            for field in statsFields.split(','):
                    selectList+= "sum(" + field + " * shape_area)/sum(shape_area)" + " as " + field + "_" + "avg" + ","

        #Aggregates. Count, Unique CSV from categorical fields, Outline of selected features.
        selectList+="count(*) as count, "

        selectList+="string_agg(" + categoricalFields + ", ',') as categorical_values, "
        #Sum of the area of selected features for area weighted average. Maybe report later.
        #selectList+="sum(shape_area) as sum_area, "

        selectList+="ST_AsText(ST_SnapToGrid(ST_Force_2D(ST_Union(geom)), .0001)) as outline_of_selected_features"

        tableList=" FROM " + table

        selectFieldsFromTable = selectList + tableList

        ############################ "WHERE" (ADD ASPATIAL SEARCH CONDITIONS) ##########################################
        if WKT=='aspatial':

            queryField=request.GET.get('queryField')
            operator=request.GET.get('operator').strip()
            stringOrValue=request.GET.get('stringOrValue').lower().strip()

            if operator == "LIKE":
                selectStatement=selectFieldsFromTable + " where LOWER(" + queryField + ") " +  operator  + "%s"
            elif operator == ">" or operator == "<":
                selectStatement=selectFieldsFromTable + " where " + queryField + operator + stringOrValue
            else:
                selectStatement=selectFieldsFromTable + " where LOWER(" + queryField + ") " + operator + " '" + \
                                stringOrValue + "'"

        ########################## or "WHERE" (ADD SPATIAL SEARCH CONDITIONS) ##########################################
        else:

            WKT=WKT.replace('%', ' ')
            WKT="SRID=4326;"+WKT

            operator=None
            selectStatement=selectFieldsFromTable + " where ST_Intersects('"+ WKT + "', " + table + ".geom)"

        ######################################## EXECUTE DATABASE QUERY ################################################

        if operator == "LIKE":
            try:
                cursor.execute(selectStatement,['%' + stringOrValue + '%'] )
            except:
                return render(request, template+'.html', errorHandler(reporting_units, template, initial_lat, initial_lon, 1,0))
                #cursor.execute(selectStatement,['%' + stringOrValue + '%'] )
        else:
            cursor.execute(selectStatement)
            try:
               cursor.execute(selectStatement)
            except:
               return render(request, template+'.html', errorHandler(reporting_units, template, initial_lat, initial_lon, 1,0))
               #cursor.execute(selectStatement)

        print selectStatement
        ################################# STORE COLUMN, VALUE PAIRS IN A DICT ##########################################

        resultsDict={}

        #Get field names
        columns = [colName[0] for colName in cursor.description]

        try:
            for row in cursor:
                for i in range(len(row)):
                    if isinstance(row[i], basestring):
                        resultsDict[columns[i]] = row[i].strip()
                    else:
                        resultsDict[columns[i]] =(float(round(row[i],2)))
        except:
            return render(request, template+'.html', errorHandler(reporting_units, template, initial_lat, initial_lon, 0,1))

        #return HttpResponse(resultsDict['sum_area'])

        WKT_SearchArea=resultsDict['outline_of_selected_features']
        WKT_SearchArea=WKT_SearchArea.replace('%', ' ')
        WKT_SearchArea="SRID=4326;"+WKT_SearchArea

        categoricalValues=[]
        categoricalValues.extend(resultsDict['categorical_values'].split(','))
        categoricalValues=list(set(categoricalValues))
        categoricalValues.sort()

        #Remove these from the Dictionary before dumping to a JSON object (causing error & no need to send twice).
        resultsDict.pop('outline_of_selected_features',0)
        resultsDict.pop('categorical_values',0)

        count=int(resultsDict["count"])

        #Take fieldname,value pairs from the dict and dump to a JSON string.
        resultsJSON=json.dumps(resultsDict)

        ##################################### SET ADDITIONAL VARIABLES #################################################

        if count > 1 :
            featureName=featureNamePlural

        if not featureName:
            featureName="Counties"

        ################################## GRID CELL Query (Find suitable polygons) ####################################

        cursor = connection.cursor()

        #initial query. Find suitable polygons
        query1="create temp table temp1 as SELECT ST_Union(geom) as the_geom from " +  query_layer + " where intactness <=" + ti_slider + "and hi_linkage <=" + cv_slider + " and speciescou <=" + species_count_slider_value + " and ch_rank >=" + chat_slider_value + " and dniann >=" + solar_slider_value  + " and ownership = ANY('" + "{" + ownership_values + "}" + "'::text[]) " + "and ST_Intersects('"+ WKT_SearchArea + "', " + query_layer + ".geom)" + exemptions
        cursor.execute(query1)

        #explode to isolate smaller shapes
        query2="create temp table temp2 as select (st_dump(the_geom)).geom as geom2 from temp1;"
        cursor.execute(query2)

        #remove smaller shapes
        query3="alter table temp2 add area float; " \
               "update temp2 set area = st_area(geom2::geography); " \
               "delete from temp2 where area < " + str(min_area * area_conversion_factor) + ";"

        cursor.execute(query3)

        query4="create temp table temp3 as select (st_dump(ST_Union(geom2))).geom as the_geom from temp2;"
        cursor.execute(query4)

        onekm_query="SELECT ST_AsText(ST_SnapToGrid(ST_Force_2D(ST_Union(the_geom)), .0001)) as outline_of_selected_features from temp3"

        cursor.execute(onekm_query)

        onekmDict={}

        #Get field names
        columns = [colName[0] for colName in cursor.description]

        try:
            for row in cursor:
                for i in range(len(row)):
                    if isinstance(row[i], basestring):
                        onekmDict[columns[i]] = row[i].strip()
                    else:
                        onekmDict[columns[i]] =(float(round(row[i],2)))
        except:
            return render(request, template+'.html', errorHandler(reporting_units, template, initial_lat, initial_lon, 0,1))


        WKT_SelectedPolys=onekmDict['outline_of_selected_features']
        #The version of PostGIS on Webfaction was returning SRID=4326 in the multipolygon (check the console for last_poly). It was causing Leaflet to Break. t is null. This was the solution.
        WKT_SelectedPolys=WKT_SelectedPolys.replace('SRID=4326;','')

        if reporting_units=='onekm':
            WKT_SearchArea=WKT

        context={'template': template,
                 'initialize': initialize,
                 'WKT_SelectedPolys': WKT_SelectedPolys,
                 'WKT_SearchArea': WKT_SearchArea,
                 'reporting_units': reporting_units,
                 'featureName': featureName,
                 'featureNamePlural': featureNamePlural,
                 'totalArea': totalArea,
                 'zoomLevel': zoomLevel, 'count': count,
                 'initial_lat':initial_lat,
                 'initial_lon': initial_lon,
                 'resultsJSON': resultsJSON,
                 'categoricalValues': categoricalValues,
                 'error': 0,
                 'ti_slider':ti_slider,
                 }
    if request.method == 'POST':
        return HttpResponse(json.dumps(context))
    else:
        return render(request, template+'.html', context)

def errorHandler(reporting_units, template, initial_lat, initial_lon, error, selectionWarning):
    WKT="SRID=4326;POLYGON((-180 0,-180 0,-180 0,-180 0,-180 0))"
    context={'template': template,
             'zoomLevel': 8,
             'reporting_units': reporting_units,
             'initialize': 0,
             'WKT_SelectedPolys': WKT,
             'initial_lat': initial_lat,
             'initial_lon': initial_lon,
             'resultsJSON': resultsJSON,
             'count': 0,
             'error': error,
             'selectionWarning':selectionWarning,
             'totalArea':0,
             }
    return context
