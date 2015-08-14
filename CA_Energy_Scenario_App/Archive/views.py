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

    #first_map_click = request.POST.get('first_map_click')

    if request.method == 'POST':
        WKT = request.POST.get('wktPOST')
        reporting_units=request.POST.get('reporting_units')
        ti_slider = request.POST.get('ti_slider')
        cv_slider = request.POST.get('cv_slider')
        species_count_slider_value = request.POST.get('species_count_slider_value')
        chat_slider_value = request.POST.get('chat_slider_value')
        ownership_values = request.POST.get('ownership_values')
        solar_slider_value = request.POST.get('solar_slider_value')

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
        #replace existing file on initial page load, or put on cron job?
        #urllib.urlretrieve ("http://www.cpc.ncep.noaa.gov/pacdir/NFORdir/HUGEdir2/cpcllftd.dat", "static/data/noaa/climate/cpcllftd.dat")
        #urllib.urlretrieve ("http://www.cpc.ncep.noaa.gov/pacdir/NFORdir/HUGEdir2/cpcllfpd.dat", "static/data/noaa/climate/cpcllfpd.dat")

    ############################################# INPUT PARAMETERS #####################################################

    template=request.GET.get('template')
    if not template:
        template='index'


    query_layer="drecp_reporting_units_1km_poly_v2"
    query_layer="energy_scenario_1km_query_grid"

    #statsFields="C2arids2t1,C2arids0t1,C2arids3t1,C2arids1t1,C2arids4t1,C2arids2t2,C2arids0t2,C2arids3t2,C2arids1t2,C2arids4t2,C2pets0t1,C2pets2t1,C2pets3t1,C2pets1t1,C2pets4t1,C2pets0t2,C2pets2t2,C2pets3t2,C2pets1t2,C2pets4t2,C2precs0t1,C2preas2t1,C2precs2t1,C2preds2t1,C2preas0t1,C2preds0t1,C2preas3t1,C2precs3t1,C2preds3t1,C2preas1t1,C2precs1t1,C2preds1t1,C2preas4t1,C2precs4t1,C2preds4t1,C2precs0t2,C2preas2t2,C2precs2t2,C2preds2t2,C2preas0t2,C2preds0t2,C2preas3t2,C2precs3t2,C2preds3t2,C2preas1t2,C2precs1t2,C2preds1t2,C2preas4t2,C2precs4t2,C2preds4t2,C2tmaxs0t1,C2tmaas2t1,C2tmaxs2t1,C2tmads2t1,C2tmaas0t1,C2tmads0t1,C2tmaas3t1,C2tmaxs3t1,C2tmads3t1,C2tmaas1t1,C2tmaxs1t1,C2tmads1t1,C2tmaas4t1,C2tmaxs4t1,C2tmads4t1,C2tmaxs0t2,C2tmaas2t2,C2tmaxs2t2,C2tmads2t2,C2tmaas0t2,C2tmads0t2,C2tmaas3t2,C2tmaxs3t2,C2tmads3t2,C2tmaas1t2,C2tmaxs1t2,C2tmads1t2,C2tmaas4t2,C2tmaxs4t2,C2tmads4t2,C2tmins0t1,C2tmias2t1,C2tmins2t1,C2tmids2t1,C2tmias0t1,C2tmids0t1,C2tmias3t1,C2tmins3t1,C2tmids3t1,C2tmias1t1,C2tmins1t1,C2tmids1t1,C2tmias4t1,C2tmins4t1,C2tmids4t1,C2tmins0t2,C2tmias2t2,C2tmins2t2,C2tmids2t2,C2tmias0t2,C2tmids0t2,C2tmias3t2,C2tmins3t2,C2tmids3t2,C2tmias1t2,C2tmins1t2,C2tmids1t2,C2tmias4t2,C2tmins4t2,C2tmids4t2,C4arids2t1,C4arids0t1,C4arids3t1,C4arids1t1,C4arids4t1,C4arids2t2,C4arids0t2,C4arids3t2,C4arids1t2,C4arids4t2,C4pets0t1,C4pets2t1,C4pets3t1,C4pets1t1,C4pets4t1,C4pets0t2,C4pets2t2,C4pets3t2,C4pets1t2,C4pets4t2,C4precs0t1,C4preas2t1,C4precs2t1,C4preds2t1,C4preas0t1,C4preds0t1,C4preas3t1,C4precs3t1,C4preds3t1,C4preas1t1,C4precs1t1,C4preds1t1,C4preas4t1,C4precs4t1,C4preds4t1,C4precs0t2,C4preas2t2,C4precs2t2,C4preds2t2,C4preas0t2,C4preds0t2,C4preas3t2,C4precs3t2,C4preds3t2,C4preas1t2,C4precs1t2,C4preds1t2,C4preas4t2,C4precs4t2,C4preds4t2,C4tmaxs0t1,C4tmaas2t1,C4tmaxs2t1,C4tmads2t1,C4tmaas0t1,C4tmads0t1,C4tmaas3t1,C4tmaxs3t1,C4tmads3t1,C4tmaas1t1,C4tmaxs1t1,C4tmads1t1,C4tmaas4t1,C4tmaxs4t1,C4tmads4t1,C4tmaxs0t2,C4tmaas2t2,C4tmaxs2t2,C4tmads2t2,C4tmaas0t2,C4tmads0t2,C4tmaas3t2,C4tmaxs3t2,C4tmads3t2,C4tmaas1t2,C4tmaxs1t2,C4tmads1t2,C4tmaas4t2,C4tmaxs4t2,C4tmads4t2,C4tmins0t1,C4tmias2t1,C4tmins2t1,C4tmids2t1,C4tmias0t1,C4tmids0t1,C4tmias3t1,C4tmins3t1,C4tmids3t1,C4tmias1t1,C4tmins1t1,C4tmids1t1,C4tmias4t1,C4tmins4t1,C4tmids4t1,C4tmins0t2,C4tmias2t2,C4tmins2t2,C4tmids2t2,C4tmias0t2,C4tmids0t2,C4tmias3t2,C4tmins3t2,C4tmids3t2,C4tmias1t2,C4tmins1t2,C4tmids1t2,C4tmias4t2,C4tmins4t2,C4tmids4t2,eearids2t1,eearids0t1,eearids3t1,eearids1t1,eearids4t1,eearids2t2,eearids0t2,eearids3t2,eearids1t2,eearids4t2,eepets0t1,eepets2t1,eepets3t1,eepets1t1,eepets4t1,eepets0t2,eepets2t2,eepets3t2,eepets1t2,eepets4t2,eeprecs0t1,eepreas2t1,eeprecs2t1,eepreds2t1,eepreas0t1,eepreds0t1,eepreas3t1,eeprecs3t1,eepreds3t1,eepreas1t1,eeprecs1t1,eepreds1t1,eepreas4t1,eeprecs4t1,eepreds4t1,eeprecs0t2,eepreas2t2,eeprecs2t2,eepreds2t2,eepreas0t2,eepreds0t2,eepreas3t2,eeprecs3t2,eepreds3t2,eepreas1t2,eeprecs1t2,eepreds1t2,eepreas4t2,eeprecs4t2,eepreds4t2,eetmaxs0t1,eetmaas2t1,eetmaxs2t1,eetmads2t1,eetmaas0t1,eetmads0t1,eetmaas3t1,eetmaxs3t1,eetmads3t1,eetmaas1t1,eetmaxs1t1,eetmads1t1,eetmaas4t1,eetmaxs4t1,eetmads4t1,eetmaxs0t2,eetmaas2t2,eetmaxs2t2,eetmads2t2,eetmaas0t2,eetmads0t2,eetmaas3t2,eetmaxs3t2,eetmads3t2,eetmaas1t2,eetmaxs1t2,eetmads1t2,eetmaas4t2,eetmaxs4t2,eetmads4t2,eetmins0t1,eetmias2t1,eetmins2t1,eetmids2t1,eetmias0t1,eetmids0t1,eetmias3t1,eetmins3t1,eetmids3t1,eetmias1t1,eetmins1t1,eetmids1t1,eetmias4t1,eetmins4t1,eetmids4t1,eetmins0t2,eetmias2t2,eetmins2t2,eetmids2t2,eetmias0t2,eetmids0t2,eetmias3t2,eetmins3t2,eetmids3t2,eetmias1t2,eetmins1t2,eetmids1t2,eetmias4t2,eetmins4t2,eetmids4t2,M5arids2t1,M5arids0t1,M5arids3t1,M5arids1t1,M5arids4t1,M5arids2t2,M5arids0t2,M5arids3t2,M5arids1t2,M5arids4t2,M5pets0t1,M5pets2t1,M5pets3t1,M5pets1t1,M5pets4t1,M5pets0t2,M5pets2t2,M5pets3t2,M5pets1t2,M5pets4t2,M5precs0t1,M5preas2t1,M5precs2t1,M5preds2t1,M5preas0t1,M5preds0t1,M5preas3t1,M5precs3t1,M5preds3t1,M5preas1t1,M5precs1t1,M5preds1t1,M5preas4t1,M5precs4t1,M5preds4t1,M5precs0t2,M5preas2t2,M5precs2t2,M5preds2t2,M5preas0t2,M5preds0t2,M5preas3t2,M5precs3t2,M5preds3t2,M5preas1t2,M5precs1t2,M5preds1t2,M5preas4t2,M5precs4t2,M5preds4t2,M5tmaxs0t1,M5tmaas2t1,M5tmaxs2t1,M5tmads2t1,M5tmaas0t1,M5tmads0t1,M5tmaas3t1,M5tmaxs3t1,M5tmads3t1,M5tmaas1t1,M5tmaxs1t1,M5tmads1t1,M5tmaas4t1,M5tmaxs4t1,M5tmads4t1,M5tmaxs0t2,M5tmaas2t2,M5tmaxs2t2,M5tmads2t2,M5tmaas0t2,M5tmads0t2,M5tmaas3t2,M5tmaxs3t2,M5tmads3t2,M5tmaas1t2,M5tmaxs1t2,M5tmads1t2,M5tmaas4t2,M5tmaxs4t2,M5tmads4t2,M5tmins0t1,M5tmias2t1,M5tmins2t1,M5tmids2t1,M5tmias0t1,M5tmids0t1,M5tmias3t1,M5tmins3t1,M5tmids3t1,M5tmias1t1,M5tmins1t1,M5tmids1t1,M5tmias4t1,M5tmins4t1,M5tmids4t1,M5tmins0t2,M5tmias2t2,M5tmins2t2,M5tmids2t2,M5tmias0t2,M5tmids0t2,M5tmias3t2,M5tmins3t2,M5tmids3t2,M5tmias1t2,M5tmins1t2,M5tmids1t2,M5tmias4t2,M5tmins4t2,M5tmids4t2,pmpets0t0,pmpets2t0,pmpets3t0,pmpets1t0,pmpets4t0,pmprecs0t0,pmprecs2t0,pmprecs3t0,pmprecs1t0,pmprecs4t0,pmtmaxs0t0,pmtmaxs2t0,pmtmaxs3t0,pmtmaxs1t0,pmtmaxs4t0,pmtmins0t0,pmtmins2t0,pmtmins3t0,pmtmins1t0,pmtmins4t0"
    #statsFields=statsFields+",intactness"
    #statsFields=statsFields+",eecefzt1,eecefzt2,eepifzt1,eepifzt2,hisensfz"
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
                #Non area weighted selection
                #for stat in PostgresStatsToRetrieve:
                    #selectList+= stat+"(" + field + ")" + "as " + field + "_"+ stat + ","
                    #Area weighted selection. Would be preferable to get the sum of the shape area once, but would require
                    #a new selection using all the search conditions below.
                    #Extra time for AWA calculation is negligible (2.01mins vs 1.997mins for all watersheds).
                    #No need to store sum(shape_area) in a separate variable to avoid recalculating for each field....
                    #Time difference is negligible. 2.007133 mins for all watersheds vs 2.001333 mins with hard coded sum(shape_area).
                    #example: select sum(c4prec1530 * shape_area)/sum(shape_area) as c4prec1530_avg from table;
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

        WKT_SelectionArea=resultsDict['outline_of_selected_features']
        WKT_SelectionArea=WKT_SelectionArea.replace('%', ' ')
        WKT_SelectionArea="SRID=4326;"+WKT_SelectionArea

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
        query1="create temp table temp1 as SELECT ST_Union(geom) as the_geom from " +  query_layer + " where intactness <=" + ti_slider + "and hi_linkage <=" + cv_slider + " and speciescou <=" + species_count_slider_value + " and ch_rank >=" + chat_slider_value + " and dniann >=" + solar_slider_value  + " and ownership = ANY('" + "{" + ownership_values + "}" + "'::text[]) " + "and ST_Intersects('"+ WKT_SelectionArea + "', " + query_layer + ".geom)" + exemptions
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
            WKT_SelectionArea=WKT

        context={'template': template,
                 'initialize': initialize,
                 'WKT_SelectedPolys': WKT_SelectedPolys,
                 'WKT_SelectionArea': WKT_SelectionArea,
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

