var latlng = L.latLng(center_lat,center_lon);

var results_poly = omnivore.wkt.parse(last_poly)

var map = L.map("map", {
    zoomControl: false,
    clickable: false,
    drawcontrol:false,
}).setView(latlng,zoomLevel);

//SCALE BAR
L.control.scale({maxWidth:200}).addTo(map);

//DYNAMIC LEGEND
var dynamic_legend = L.control({position: 'bottomright'});

//Initialize Legend
dynamic_legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend');
    div.innerHTML=""
    return div;
};
dynamic_legend.addTo(map)


//Swap legend on data point click
function swapLegend(layerToAddName, layerToAdd, climateVariable) {
    if ((! map.hasLayer(PNG_overlay) && ! map.hasLayer(layerToAdd)) || layerToAddName == 'single_transparent_pixel') {

        document.getElementsByClassName('info legend leaflet-control')[0].innerHTML=''

    } else {

        legendTitle=window[layerToAddName].legendTitle
        legendImage=window[layerToAddName].legendPNG
        legendHeight=window[layerToAddName].legendHeight
        dbid=window[layerToAddName].dataBasinID

        document.getElementsByClassName('info')[0].innerHTML=
        '<div id="DataBasinRedirect"> <a target="_blank" href="http://databasin.org/datasets/' + dbid + '"><img class="DataBasinRedirectImg" title="Click to view or download this dataset on Data Basin" src="'+static_url+'img/dataBasinRedirect.png"></a></div>' +
        '<div id="LegendHeader">' + legendTitle+ '</div>' +
        '<img style="float:left" height="' + legendHeight + '" src="'+static_url+'Leaflet/my_leaflet/legends/' + legendImage + '.png">'+
        '<div class="legendLabels">'

        for (i in window[layerToAddName].legendLabels) {
            $(".legendLabels").append(window[layerToAddName].legendLabels[i] + "<br>");
            }

    }
}

overlay_bounds = [[32.6339585982195,-118.643362495493], [37.302775947927, -114.130781641769 ]];

var PNG_overlay=""

if (PNG_overlay != '') {
    PNG_overlay_url=static_url+'Leaflet/myPNG/climate/TrimmedPNG/' + PNG_overlay
    PNG_overlay=L.imageOverlay(PNG_overlay_url, overlay_bounds);
    PNG_overlay.addTo(map)

} else {
    PNG_overlay_url='';
    PNG_overlay=L.imageOverlay(PNG_overlay_url, overlay_bounds);
}

//Function used by the Climate chart to add PNGs. Obviates the need to manually define each image overlay object.
function swapImageOverlay(layerName) {
        //Transparency slider
        elements=document.getElementsByClassName('ui-opacity')
        map.removeLayer(PNG_overlay)
        //ti
        if (PNG_overlay_url.search(layerName)> 0){
            map.removeLayer(PNG_overlay)
            PNG_overlay_url=""
            //Transparency slider
            for (var i = 0; i < elements.length; i++) {
                elements[i].style.display = elements[i].style.display = 'none';
            }

        } else {
                PNG_overlay_url=static_url+'Leaflet/myPNG/climate/TrimmedPNG/' + layerName + '.png';
                PNG_overlay=L.imageOverlay(PNG_overlay_url, overlay_bounds);

                PNG_overlay.addTo(map)
                PNG_overlay.bringToBack()
                elements=document.getElementsByClassName('ui-opacity')
                //Transparency slider
                for (var i = 0; i < elements.length; i++) {
                    elements[i].style.display = elements[i].style.display = 'inline';
                }
                PNG_overlay.setOpacity(1 - (handle.offsetTop / 200))

        }
        //For keeping table row selected
        PNG_overlay.name=layerName

}

// CREATE LAYERS FROM TopoJSON
// Study Area Boundary
var study_area_boundary = omnivore.topojson(static_url+'Leaflet/myJSON/DRECP_Bdy_20110128.json')
    .on('ready',function(layer){
        this.eachLayer(function(dist){
            dist.setStyle({color:'orange', weight:2, fillOpacity:0, opacity:.8 })
            //dist.bindPopup(dist.toGeoJSON().properties.FMNAME_PC);
            //For making non clickable and getting rid of the pointer icon.
            dist.setStyle({clickable: false});
        })
    })//Had to move addTo(map) to general_js.js and trigger when page document.ready() otherwise, this guy was clickable.


// Getting rid of the fill opacity above and adding the "on" function below allows the user click anywhere in the map
// Enable click on user defined (because the study area boundary turns on when the 1km reporting units are selected.)
//study_area_boundary.on('click',function(e){selectFeature(e) })

//Counties
var counties = L.geoJson(null, {
    style: function(feature) {
        return {color: '#F8981D', weight:2, dashArray: 0, fillOpacity:0, opacity:1 }
    },
    onEachFeature: onEachFeature
});

var counties_layer = omnivore.topojson(static_url+'Leaflet/myJSON/DRECP_Reporting_Units_County_Boundaries_JSON.json', null, counties)

//BLM Field Offices
var blm_field_offices = L.geoJson(null, {
    style: function(feature) {
        return {color: '#F8981D', weight:2, dashArray: 0, fillOpacity:0, opacity:1 }
    },
    onEachFeature: onEachFeature
});

var blm_field_offices_layer = omnivore.topojson(static_url+'Leaflet/myJSON/DRECP_Reporting_Units_BLM_Field_Offices_no_simplify.json', null, blm_field_offices)

var huc5_watersheds= L.geoJson(null, {
    style: function(feature) {
        return {color: '#F8981D', weight:2, dashArray: 0, fillOpacity:0, opacity:1 }
    },
    onEachFeature: onEachFeature
});

var huc5_watersheds_layer = omnivore.topojson(static_url+'Leaflet/myJSON/DRECP_Reporting_Units_HUC5_Watersheds_1_5_simplify.json', null, huc5_watersheds)

//1km Reporting Units | NOTE: 4KM reporting units, even simplified at 100% in mapshaper, makes the application unusable.
onekmBounds = [[36, -114], [36, -114]];
var onekm_url= static_url+'Leaflet/myPNG/single_transparent_pixel.png';
var onekm= L.imageOverlay(onekm_url, onekmBounds);


//Set Default Reporting Units
//counties_layer.addTo(map)
//onekm.addTo(map)

//Map Layers in layer control. Arrange order here. Uses the grouped layers plugin.
OpenStreetMap=L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', { attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' })
lightGray= L.esri.tiledMapLayer('http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer')
worldTopo=L.esri.tiledMapLayer('http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer').addTo(map)
USATopo=L.esri.tiledMapLayer('http://services.arcgisonline.com/ArcGIS/rest/services/USA_Topo_Maps/MapServer')
streetMap=L.esri.tiledMapLayer('http://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer')
imagery=L.esri.tiledMapLayer('http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer')

var overlayMaps = {
    //"Selected Features":results_poly
}

var groupedOverlays = {
    "Reporting Units": {
        "User Defined": onekm,
        "Counties": counties,
        //"Jepson Ecoregions": jepson_ecoregions,
        "BLM Field Offices": blm_field_offices,
        "HUC5 Watersheds": huc5_watersheds,
    },
    "Base Maps": {
        'Light Gray Base': lightGray,
        'World Topo Map': worldTopo,
        'USA Topo Map': USATopo,
        'Street Map': streetMap,
        'Imagery': imagery,
        'Open Street Map': OpenStreetMap,
    },
    "": {
        "Study Area Boundary": study_area_boundary,
    }

};

//The order here affects the order in the list in the upper left.
//var reportingUnitLayers = {"Counties": counties, "Jepson Ecoregions": jepson_ecoregions, "USFS National Forests": usfs_national_forests, "BLM Field Offices": blm_field_offices,"HUC5 Watersheds": huc5_watersheds,"User Defined (1km)": onekm};
var reportingUnitLayers = {"User Defined": onekm, "Counties": counties, "BLM Field Offices": blm_field_offices,"HUC5 Watersheds": huc5_watersheds,};
var options = { exclusiveGroups: ["Reporting Units","Base Maps"]};
L.control.groupedLayers(overlayMaps, groupedOverlays, options).addTo(map);

map.on('baselayerchange', function (event) {
    var layer = event.layer;
    //boundary shows behind the admin units, slightly misaligned due to simplification of Admin Units.
    //if (event.name == "BLM Admin Units") { reporting_units="BLM Admin Units"; map.removeLayer(study_area_boundary)}
    if (event.name == "Counties") { remember_reporting_units=counties; reporting_units="counties"; reporting_units_label_singular="county"; reporting_units_label_plural="counties"; map.removeLayer(study_area_boundary)}
    if (event.name == "BLM Field Offices") { remember_reporting_units=blm_field_offices; reporting_units="blm_field_offices"; reporting_units_label_singular="BLM field office"; reporting_units_label_plural="BLM field offices"; map.removeLayer(study_area_boundary)}
    if (event.name == "HUC5 Watersheds") { remember_reporting_units=huc5_watersheds; reporting_units="huc5_watersheds"; reporting_units_label_singular="watershed"; reporting_units_label_plural="watersheds"; reporting_units_singular="watershed"; map.removeLayer(study_area_boundary)}
    if (event.name == "User Defined") { remember_reporting_units=onekm;reporting_units="onekm";reporting_units_label_singular="polygon"; reporting_units_label_plural=" polygons"; map.addLayer(study_area_boundary)}

    if (event.name == "User Defined") {
        //$("#selectionInstructions").html("Use the selection tools to define a custom search area.");
        $('#selectionInstructions').html("Use the drawing tools on the right to define your search area in the map, or search within one of the boundaries listed");
    }
    else {
        $("#selectionInstructions").html("Click in the map to select a single " + reporting_units_label_singular + " or use the drawing tools to select multiple " + reporting_units_label_plural + ".");
    }

});

var defaultStyle = {
    fillOpacity:.1,
    opacity:1,
    color:'red',
    weight:1,
    fill:'red',
    dashArray: '0',
};

var hoverStyle = {
    color:'#00C600',
    fillColor:'#5083B0',
    fillOpacity:0,
    weight:3,
    dashArray: '3',
    opacity: '1'
};

var jqXHR;

// AJAX for posting
function create_post(newWKT) {

    $("#step1Indicator").hide()
    $("#step2Indicator").hide()

    min_area=document.getElementById("min_area").value
    min_area_units=document.getElementById("min_area_units").value
    checkedBoxes = document.querySelectorAll('input[name=ownership]:checked').value;
    ownership_array = $('input:checkbox:checked.ownership').map(function () {
    return this.value;
    }).get();

    ownership_values=ownership_array.join(", ");

    distance_to_transmission=document.getElementById("distance_to_transmission").value
    distance_to_transmission_units=document.getElementById("distance_to_transmission_units").value

    jqXHR=$.ajax({
        url : "", // the endpoint
        //Webfactional
        //url : "/climate", // the endpoint
        type : "POST", // http method
        //data sent to django view with the post request

        data: {wktPOST: newWKT, reporting_units: reporting_units, ti_slider:ti_slider, cv_slider:cv_slider, min_area:min_area, min_area_units:min_area_units, species_count_slider_value: species_count_slider_value, corridor_avoidance_slider_value:corridor_avoidance_slider_value, chat_slider_value:chat_slider_value, cdfw_slider_value:cdfw_slider_value, ownership_values:ownership_values, solar_slider_value:solar_slider_value, enable_environment_settings:enable_environment_settings,  distance_to_transmission:distance_to_transmission, distance_to_transmission_units:distance_to_transmission_units},

        // handle a successful response
        success : function(json) {

             response=JSON.parse(json)

             report=response.report

            //Selection Area

             map.removeLayer(selection_area_poly)
             layerControl.removeLayer(selection_area_poly)

             selection_area=response.WKT_SearchArea
             selection_area_poly = omnivore.wkt.parse(selection_area)

             //Allows for clicking reporting units that are beneath the selected feature(s).
             //selection_area_poly.on('click',function(e){selectFeature(e) })
             selection_area_poly.bindPopup("<b>" + (Number((response['totalArea']).toFixed(1))).toLocaleString() + "</b> acres meeting your criteria <br>were identified in the search area."
                 + "<div id='generateReportDiv'><a onclick='generateReport()' >Generate Report</div>"
             ).addTo(map).addLayer;

             selection_area_poly.openPopup()
             selection_area_poly.addTo(map)
             selection_area_poly.setStyle(hoverStyle)
             selection_area_poly.bringToFront()

            //Selected (Results) Polygons
            map.removeLayer(results_poly)
            layerControl.removeLayer(results_poly)

            last_poly=response.WKT_SelectedPolys
            results_poly = omnivore.wkt.parse(last_poly)

            //Allows for clicking reporting units that are beneath the selected feature(s).
            //results_poly.on('click',function(e){selectFeature(e) })
            results_poly.addTo(map)
            results_poly.setStyle({color:'#00FFFF', weight: 5, dashArray: 0, fillOpacity:.7, opacity:1})
            results_poly.bringToFront()

            layerControl.addOverlay(results_poly, "Search Results <div id='resultsSquare'></div>");

            if (typeof selectedFeature != 'undefined') {
                counties.resetStyle(selectedFeature)
                blm_field_offices.resetStyle(selectedFeature)
                huc5_watersheds.resetStyle(selectedFeature)
            }

            //This is the drawn shape
            if (typeof layer != 'undefined' && map.hasLayer(layer)){
                map.removeLayer(layer)
            }

            layerControl.addOverlay(selection_area_poly, "Search Area <div id='searchSquare'></div>");

            //Hide the initialization container upon successful response and show the tabs.
            //document.getElementById('initialization_container').style.display="none";
            document.getElementById('tab_container').style.display="block";

            //Populate the list of selected features in the bottom left hand corner.
            if (reporting_units != "onekm"){
                $('.info2').html("<b><span style='color:#5083B0'>Currently Selected: "+response['categoricalValues']+"</span>")
            }
            else {
                $('.info2').html("")
            }

            $("#generateReport").show()

        },

        // handle a non-successful response
        error : function(xhr,errmsg,err) {
            $(".wait").css("display", "none");

            //Unless the cancel button has been pushed, throw an error.
            if (errmsg != "abort") {
                //Without this, you have to click twice.
                $('[id^=alertify]').remove();
                alertify.alert('No results. Select a new area or modify your search criteria.')
                $('#results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: "+errmsg+
                    " <a href='#' class='close'>&times;</a></div>"); // add the error to the dom
                console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
            }

        }
    });
}


function onEachFeature(feature, layer) {
    layer.on({
        //Uncomment the line below (and the line in the select feature function) to trigger database query on feature click:
        click: selectFeature,
        mouseover: highlightFeature,
        mouseout: resetHighlight
    });
}

function selectFeature(e){

    //counties.eachLayer(function(l){counties.resetStyle(l);});
    $("#step1Indicator").hide()
    $("#step2Indicator").show()

    drawnItems.clearLayers();

    user_wkt="POINT(" + e.latlng.lng + " " + e.latlng.lat + ")";

    //If the user hasn't specified any search critera yet...
    if ( initialTableSelectionPerformed == false) {

        if (typeof selectedFeature  != 'undefined'){
            selectedFeature.on='No'

            counties.resetStyle(selectedFeature)
            blm_field_offices.resetStyle(selectedFeature)
            huc5_watersheds.resetStyle(selectedFeature)
        }

        selectedFeature = e.target;

        selectedFeature.setStyle(hoverStyle);

        if (!L.Browser.ie && !L.Browser.opera) {
            selectedFeature.bringToFront();
        }

        info2.update(selectedFeature.feature.properties);

        if (selectedFeature.on == 'Yes'){

            selectedFeature.on='No'
        }

        else {

            selectedFeature.on='Yes'
        }

    }

    //AJAX REQUEST
    else {

        if (typeof selectedFeature != 'undefined'){
            selectedFeature.on='No'
            counties.resetStyle(selectedFeature)
            blm_field_offices.resetStyle(selectedFeature)
            huc5_watersheds.resetStyle(selectedFeature)
        }

        create_post(user_wkt,reporting_units)
    }
}

function highlightFeature(e) {

    var layer = e.target;

    layer.setStyle(hoverStyle);

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
        if (typeof selection_area_poly != 'undefined' && selection_area_poly != '') {
            selection_area_poly.bringToFront();
        }
    }

    //this.openPopup();
    info2.update(layer.feature.properties);
}

function resetHighlight(e) {

    //This handles the case where a query hasn't been performed yet, a feature is selected and then
    //a mouse over is performed on another feature. It brings the selected feature back to the top.
    if (typeof selectedFeature != 'undefined' && initialTableSelectionPerformed==false ) {
        selectedFeature.bringToFront();
    }

    var layer = e.target;

	if (layer.on !='Yes') {

        counties.resetStyle(e.target)
        blm_field_offices.resetStyle(e.target)
        huc5_watersheds.resetStyle(e.target)
	}

    if (typeof response!= 'undefined' && reporting_units != "onekm") {
        $('.info2').html("<b><span style='color:#5083B0'>Current Search Area: "+response['categoricalValues']+"</span>")
    }
    else {
        info2.update('');
    }

    results_poly.bringToFront()

}

function mouseOverTextChangeColor(hovername) {
    if (reporting_units=="counties"){text_hover_layer=counties}
    else if (reporting_units=="jepson_ecoregions"){text_hover_layer=jepson_ecoregions}
    else if (reporting_units=="epa_ecoregions"){text_hover_layer=epa_ecoregions}
    else if (reporting_units=="blm_field_offices"){text_hover_layer=blm_field_offices}
    else if (reporting_units=="huc5_watersheds"){text_hover_layer=huc5_watersheds}
    else if (reporting_units=="usfs_national_forests"){text_hover_layer=usfs_national_forests}
    else { text_hover_layer = null }

    if (text_hover_layer != null) {

        text_hover_layer.eachLayer(function(dist){
            if (dist.toGeoJSON().properties.NAME == hovername) {
                dist.setStyle(hoverStyle)
                if (!L.Browser.ie && !L.Browser.opera) {
                    dist.bringToFront();
                }
            }
        });

    }

}

function mouseOutTextChangeBack() {
    resetHighlight()
}

// BEGIN EXPORT TO WKT
// Takes user draw shape and converts it to WKT format. This ships to the PostGIS database where it is used in the SBL.
function toWKT(layer) {
    var lng, lat, coords = [];
    if (layer instanceof L.Polygon || layer instanceof L.Polyline) {
        var latlngs = layer.getLatLngs();
        for (var i = 0; i < latlngs.length; i++) {
            latlngs[i]
            coords.push(latlngs[i].lng + " " + latlngs[i].lat);
            if (i === 0) {
                lng = latlngs[i].lng;
                lat = latlngs[i].lat;
            }
        };
        if (layer instanceof L.Polygon) {
            return "POLYGON((" + coords.join(",") + "," + lng + " " + lat + "))";
        } else if (layer instanceof L.Polyline) {
            return "LINESTRING(" + coords.join(",") + ")";
        }
        else {
            return "POLYGON((" + coords.join(",") + "," + lng + " " + lat + "))";
        }
        //} else if (layer instanceof L.Marker) {
    } else if (layer instanceof L.Marker) {
        return "POINT(" + layer.getLatLng().lng + " " + layer.getLatLng().lat + ")";

    //Not Implemented yet
    } else {
        return "CIRCLE(" + layer.getLatLng().lng + " " + layer.getLatLng().lat + "," + layer._mRadius + ")";
    }
}

map.on('draw:created', function (e) {

    $("#step1Indicator").hide()
    $("#step2Indicator").show()

    if (typeof selectedFeature != 'undefined') {
        counties.resetStyle(selectedFeature)
        blm_field_offices.resetStyle(selectedFeature)
        huc5_watersheds.resetStyle(selectedFeature)
    }

    //map.removeLayer(layer)
    if(map.hasLayer(results_poly)){
        map.removeLayer(results_poly)
    }

    var type = e.layerType;
    layer = e.layer;
    drawnItems.addLayer(layer);
    //console.log(toWKT(layer));
    user_wkt=toWKT(layer);

    //Check for area selections that may take a long time. Ask for confirmation.
    //May be too many dialogs. User can click cancel now.
    if (e.layerType=='rectangle' || e.layerType=='polygon'){
        area=L.GeometryUtil.geodesicArea(layer.getLatLngs());
    } else{
        area=0
    }
    if ((reporting_units == 'onekm') & (e.layerType=='rectangle' || e.layerType=='polygon') & area > 10000000000 ){
        //if (! confirm("Warning: This selection may require a significant amount of processing time. \n\n Click \"Ok\" to proceed with the selection, or \"Cancel\" to cancel the selection." )){drawnItems.clearLayers(); return}
        $('#areaWarning').show()
    }
    else {
        $('#areaWarning').hide()
    }

    if  (initialTableSelectionPerformed){
        create_post(user_wkt,reporting_units)
    }

})

map.on('draw:drawstop', function (e) {
    var acres=(area*0.0002471044).toFixed(1)
    layer.bindPopup(acres+" acres" + "<div id='generateReportDiv'><a onclick='generateReport()' >Generate Report</div>")
    layer.openPopup()
})

/********************************* BEGIN MAP CONTROLS -- Right Hand Side **********************************************/

//Opacity/transparency slider on image overlays
var handle = document.getElementById('handle'),
    start = false,
    startTop;

document.onmousemove = function(e) {
    if (!start) return;
    // Adjust control.
    handle.style.top = Math.max(-5, Math.min(145, startTop + parseInt(e.clientY, 10) - start)) + 'px';

    fillOpacityLevel=(1 - (handle.offsetTop / 150));

    // Adjust opacity on image overlays.
    if (PNG_overlay_url != '') {
        PNG_overlay.setOpacity(fillOpacityLevel);
    }
};

handle.onmousedown = function(e) {
    // Record initial positions.
    start = parseInt(e.clientY, 10);
    startTop = handle.offsetTop - 5;
    return false;
};

document.onmouseup = function(e) {
    start = null;
};

//Move the zoom level buttons (put below the layers)
L.control.zoom({
    position:'topright'
}).addTo(map);

//BEGIN LEAFLET.DRAW
drawnItems = L.featureGroup().addTo(map);

var drawButtons = new L.Control.Draw({
    /*edit: { featureGroup: drawnItems },*/
    draw: {
        polyline: true,
        circle: false,
        marker: false,
        polygon: {
            shapeOptions: {
                color:"#00FFFF",
                opacity:.7
            },
        },
        rectangle: {
            shapeOptions: {
                color:"#00FFFF",
                opacity:.7
            }
        },
        showArea:true,
    },
})
map.addControl(drawButtons)

map.on('draw:created', function(event) {

    //clear the previous drawing
    drawnItems.clearLayers();

    map.addLayer(drawnItems)
    var layer = event.layer;
    drawnItems.addLayer(layer);
})
//END LEAFLET.DRAW

// BEGIN TEXT BOTTOM LEFT
var info2 = L.control({position:'bottomleft'});

info2.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info2');
    this.update();
    return this._div;
};

info2.update = function (props) {
    this._div.innerHTML =(props ?
        '<b><span style="color:#5083B0">' + props.NAME + '</span></b><br />'
        : ' ');
};

// add the info window to the map
info2.addTo(map);
// END TEXT BOTTOM LEFT

layerControl = L.control.layers(reportingUnitLayers, overlayMaps, {collapsed:false, position:'topleft', width:'300px'} ).addTo(map)


/********************************* END MAP CONTROLS -- Right Hand Side **********************************************/
