
/******************************************* On Document Ready *******************************************************/
 $(document).ready(function(){

     $("#backgroundImage").bind("load", function () { $(this).fadeIn(10000).removeClass('hidden'); });
     $('#header').animate({backgroundColor: 'black'}, 10000);

    //Prepare Near Term Forecast

    //Initialize Selected Climate Division
    selectedClimateDivision='94'
    //Initialize Selected Time Frame
    selectedNearTermClimatePeriod=1

    acquireNearTermClimate();
    createDynamicMonthlyRadioButtons()
    generateNearTermClimateResults(selectedNearTermClimatePeriod,selectedClimateDivision)

    //Check the top radio buttons
     $('.neartermclimateform').each(function(){
        $('input[type=radio]', this).get(0).checked = true;
    });

     $('#nearTermMapForm').each(function(){
         $('input[type=radio]', this).get(0).checked = true;
     });

    /*
    $(document).ajaxStart(function(){
        $("#view1").css("opacity", ".1");
        $("#view2").css("opacity", ".1");
        $(".wait").css("display", "block");
    });

    $(document).ajaxComplete(function(){
        $("#view1").css("opacity", "1");
        $("#view2").css("opacity", "1");
        $(".wait").css("display", "none");
        //map.removeLayer(layer)
    });
    */

});

/*************************************************** Slider bars  ****************************************************/

//initialize default values
ti_slider=-9999
cv_slider=-9999
species_count_slider_value=-9999
corridor_avoidance_slider_value=-9999
chat_slider_value=-9999
cdfw_slider_value=-9999
solar_slider_value=-9999

$(function() {
$( "#slider-range-max_ti" ).slider({
  range: "max",
  value: ti_slider,
  min: -1,
  max: 1,
  step:.01,
  slide: function( event, ui ) {
     /*$( "#amount_ti" ).val(ui.value);*/
     ti_slider=ui.value
     ti_label=update_slider_label(ui.value);
     $( "#amount_ti_label" ).val( ti_label + " (" + ui.value + ")");
  }
});
/*$( "#amount_ti" ).val( "" + $( "#slider-range-max_ti" ).slider( "value" ) );*/
});

$(function() {
  $( "#slider-range-max_cv" ).slider({
      range: "max",
      value: cv_slider,
      min: -1,
      max: 1,
      step:.01,
      slide: function( event, ui ) {
          cv_slider=ui.value
          cv_label=update_slider_label(ui.value)
          $( "#amount_cv_label" ).val( cv_label + " (" + ui.value + ")");
      }
  });
  /*
  $( "#amount_cv" ).val( "" + $( "#slider-range-max_cv" ).slider( "value" ) );
  */
});

$(function() {
  $( "#slider-range-max_species_count" ).slider({
      range: "max",
      value: species_count_slider_value,
      min: 0,
      max: 17,
      step:1,
      slide: function( event, ui ) {
          species_count_slider_value=ui.value
          $( "#amount_species_count" ).val( "" + ui.value );
      }
  });
   /*
  $( "#amount_species_count" ).val( "" + $( "#slider-range-max_species_count" ).slider( "value" ) );
  */
});

$(function() {
    $( "#slider-range-max_corridor_avoidance" ).slider({
        range: "max",
        value: -1,
        min: -1,
        max: 1,
        step:.01,
        slide: function( event, ui ) {
          corridor_avoidance_slider_value=ui.value
          corridor_avoidance_label=update_slider_label(ui.value)
          $( "#amount_corridor_avoidance_label" ).val( corridor_avoidance_label + " (" + ui.value + ")");
        }
    });
    /*
     $( "#amount_species_count" ).val( "" + $( "#slider-range-max_species_count" ).slider( "value" ) );
     */
});

$(function() {
    $( "#slider-range-max_chat" ).slider({
        range: "max",
        value: chat_slider_value,
        min: 1,
        max: 7,
        step:1,
        slide: function( event, ui ) {
            chat_slider_value=(8-ui.value)
            chat_label=update_slider_label(ui.value)
            $( "#amount_chat_label" ).val(8-ui.value);
        }
    });
    /*
     $( "#amount_species_count" ).val( "" + $( "#slider-range-max_species_count" ).slider( "value" ) );
     */
});

$(function() {
    $( "#slider-range-max_cdfw_aceII" ).slider({
        range: "max",
        value: 0,
        min: 0,
        max: 5,
        step:1,
        slide: function( event, ui ) {
            cdfw_slider_value=ui.value
            cdfw_label=update_slider_label(ui.value)

            $( "#amount_cdfw_aceII_label" ).val(ui.value);
        }
    });
    /*
     $( "#amount_species_count" ).val( "" + $( "#slider-range-max_species_count" ).slider( "value" ) );
     */
});

$(function() {
    $( "#slider-range-max_solar" ).slider({
        range: "max",
        value: solar_slider_value,
        min: 6.5,
        max: 8.3,
        step:.01,
        slide: function( event, ui ) {
            solar_slider_value=(ui.value * 1000)
            solar_label=update_slider_label(ui.value)

            $( "#amount_solar_label" ).val(ui.value + " (kWh/m2/day)");
        }
    });
    /*
     $( "#amount_species_count" ).val( "" + $( "#slider-range-max_species_count" ).slider( "value" ) );
     */
});

/************************************************ TABLE TAB FUNCTIONS *************************************************/

/* Selected Features Table */
function refreshSelectedFeaturesTab(){

    //var save = $('#view2 .select_container').detach();
    //$('#view2').empty().append(save);

    $('#view2').empty()

    //$('#view2').append("<br><h3>Current Selection:</h3>")
    $('#view2').append('<br><div id="dynamicSelectedFeaturesTableDiv"></div>')
    $('#dynamicSelectedFeaturesTableDiv').append('<table class="dynamicDataTable" id="selectedFeaturesTable"></table>');
    var selectedFeaturesTable=$('#dynamicSelectedFeaturesTableDiv').children();
    selectedFeaturesTable.append("<tr><th>Reporting Units</th><th>Selected Features</th></tr>")

    featureCount=response['count']

    if (featureCount > 1)  {
        pluralize="s"
    } else {
        pluralize=""
    }

    if (response['reporting_units'] == 'onekm'){
           selectedFeaturesTable.append("<tr><td>" + 'User Defined (1km)' + "</td><td>" + response['count'] + " grid cell"+pluralize+ " selected </td></tr>")
    } else {

            var count = 1
            listOfSelectedFeatures=""
            categoricalValuesArray=response['categoricalValues']

            for (var i=0,  tot=categoricalValuesArray.length; i < tot; i++) {

                listOfSelectedFeatures=listOfSelectedFeatures+ count + ". " + categoricalValuesArray[i] + "<br>";

                count=count+1
            }

            selectedFeaturesTable.append("<tr><td>" + response['featureNamePlural'] + "</td><td>" + listOfSelectedFeatures + "</td></tr>")
   }


    //$('#view2').append('<div id="getRawValuesButton"><button onclick="getRawValues()">Show Raw Data Table</button></div>')
    $('#view2').append('</table>')

    //createDynamicDataTable()

}

/* Data Tables (Climate & EEMS) */
/* Not currently being used */
function createDynamicDataTable(){

    //var save = $('#view2 .select_container').detach();
    //$('#view2').empty().append(save);

    $('#getRawValuesButton').css('display','None')
    $('#view2').append("<br><h3>Climate Data:</h3>")

    resultsJSONsorted=sortObject(resultsJSON)

    $('#view2').append('<div id="dynamicDataTableDiv"></div>')
    $('#dynamicDataTableDiv').append('<table class="dynamicDataTable"></table>');
    var table=$('#dynamicDataTableDiv').children();
    table.append("<tr><th>Model</th><th>Variable</th><th>Season</th><th>Time Period</th><th>Value</th></tr>")

    $('#view2').append("<br><h3>EEMS Data:</h3>")

    $('#view2').append('<div id="dynamicEEMSDataTableDiv"></div>')
    $('#dynamicEEMSDataTableDiv').append('<table class="dynamicDataTable"></table>');

    var EEMStable=$('#dynamicEEMSDataTableDiv').children();
    EEMStable.append("<tr><th>EEMS Model</th><th>Time Period</th><th>Climate Model Input </th><th>Value</th></tr>")

    for (var key in resultsJSONsorted) {

        var imageOverlayName=key.replace("_avg","")

        if (key != 'count'){

            if (key == 'intactness_avg' || key == 'eepifzt1_avg' || key == 'eepifzt2_avg' || key == 'eecefzt1_avg' || key == 'eecefzt2_avg' || key == 'hisensfz_avg') {

                if (imageOverlayName == 'intactness'){
                    EEMSData='<td>Terrestrial Intactness</td><td></td><td></td>'
                }
                else if(imageOverlayName == 'hisensfz') {
                    EEMSData='<td>Site Sensitivity</td><td></td><td></td>'
                }
                else if(imageOverlayName == 'eecefzt1') {
                    EEMSData='<td>Climate Exposure</td><td>2016-2045</td><td>Ensemble</td>'
                }
                else if(imageOverlayName == 'eecefzt2') {
                    EEMSData='<td>Climate Exposure</td><td>2046-2075</td><td>Ensemble</td>'
                }
                else if(imageOverlayName == 'eepifzt1') {
                    EEMSData='<td>Potential Impact</td><td>2016-2045</td><td>Ensemble</td>'
                }
                else if(imageOverlayName == 'eepifzt2') {
                    EEMSData='<td>Potential Impact</td><td>2046-2075</td><td>Ensemble</td>'
                }

                if (imageOverlayName == climate_PNG_overlay.name){
                    background_color="#00FFFF"
                } else {
                    background_color="white"
                }

                EEMStable.append("<tr style='background-color:"+ background_color + "' onclick='swapImageOverlay(&quot;" +imageOverlayName + "&quot;); swapLegend(&quot;"+imageOverlayName +"&quot;," + null + ",&quot;EEMSmodel&quot;)'>" + EEMSData + "<td>" +resultsJSONsorted[key] + "</td></tr>")

            }else{

                if ((key).indexOf('') > -1 ) {


                    expandedLabel = key.replace('g3', '<td>GFDL-CM3</td>')
                    expandedLabel = expandedLabel.replace('c2', '<td>CanESM2 </td>')
                    expandedLabel = expandedLabel.replace('ee', '<td>Ensemble </td>')
                    expandedLabel = expandedLabel.replace('c5', '<td>CESM1-CAM5 </td>')
                    expandedLabel = expandedLabel.replace('m3', '<td>MRI-CGCM3 </td>')
                    expandedLabel = expandedLabel.replace('c4', '<td>CCSM4 </td>')
                    expandedLabel = expandedLabel.replace('m5', '<td>MIROC5 </td>')
                    expandedLabel = expandedLabel.replace('pm', '<td>PRISM </td>')

                    expandedLabel = expandedLabel.replace('arid', '<td>Aridity Change </td>')
                    expandedLabel = expandedLabel.replace('pet', '<td>PET Average </td>')

                    expandedLabel = expandedLabel.replace('prec', '<td>Precip Average </td>')
                    expandedLabel = expandedLabel.replace('pred', '<td>Precip Change </td>')
                    expandedLabel = expandedLabel.replace('prea', '<td>Precip Anomaly </td>')
                    expandedLabel = expandedLabel.replace('tmax', '<td>Max Temp Average </td>')
                    expandedLabel = expandedLabel.replace('tmaa', '<td>Max Temp Anomaly </td>')
                    expandedLabel = expandedLabel.replace('tmad', '<td>Max Temp Change </td>')
                    expandedLabel = expandedLabel.replace('tmin', '<td>Min Temp Average </td>')
                    expandedLabel = expandedLabel.replace('tmia', '<td>Min Temp Anomaly </td>')
                    expandedLabel = expandedLabel.replace('tmid', '<td>Min Temp Change </td>')

                    expandedLabel = expandedLabel.replace('s0', '<td>Annual </td>')
                    expandedLabel = expandedLabel.replace('s1', '<td>Jan-Feb-Mar </td>')
                    expandedLabel = expandedLabel.replace('s2', '<td>Apr-May-Jun </td>')
                    expandedLabel = expandedLabel.replace('s3', '<td>Jul-Aug-Sep </td>')
                    expandedLabel = expandedLabel.replace('s4', '<td>Oct-Nov-Dec </td>')

                    expandedLabel = expandedLabel.replace('t0', '<td>Historical</td>')
                    expandedLabel = expandedLabel.replace('t1', '<td>2016-2045</td>')
                    expandedLabel = expandedLabel.replace('t2', '<td>2046-2075</td>')

                    if (imageOverlayName == climate_PNG_overlay.name){
                        class_name="active"
                    } else {
                        class_name=""
                    }

                    table.append("<tr class='" +class_name + "' onclick='swapImageOverlay(&quot;" +imageOverlayName + "&quot;); swapLegend(&quot;"+imageOverlayName +"&quot;," + null + ",&quot;null&quot;)'>" + expandedLabel + "<td>" +resultsJSONsorted[key] + "</td></tr><br><br>")

                }
            }
        }
    }

    //Used to highlight selected record. Needs to after the dynamic table is created.
    $('.dynamicDataTable tr').click(function () {
        $('.dynamicDataTable tr').removeClass("active");
        $(this).addClass("active");
    });

}

function sortObject(o) {
    var sorted = {},
    key, a = [];

    for (key in o) {
        if (o.hasOwnProperty(key)) {
                a.push(key);
        }
    }
    a.sort();

    for (key = 0; key < a.length; key++) {
        sorted[a[key]] = o[a[key]];
    }
    return sorted;
}


/*********************************** CHANGE SELECTION DROP-DOWN BASED ON CHART  ***************************************/
function changeSelectionForm(whichChart){

    if (whichChart=="EnableForBoxPlot"){
        showChartOnMapSelect="BoxPlot"
        $( "#variable_selection_form" ).change(function() {
            createBoxPlot(document.getElementById("variable_selection_form").value, document.getElementById("statistic_selection_form").value, document.getElementById("season_selection_form").value)
        });
        $( "#statistic_selection_form" ).change(function() {
            createBoxPlot(document.getElementById("variable_selection_form").value, document.getElementById("statistic_selection_form").value, document.getElementById("season_selection_form").value)
        });
        $( "#season_selection_form" ).change(function() {
            createBoxPlot(document.getElementById("variable_selection_form").value, document.getElementById("statistic_selection_form").value, document.getElementById("season_selection_form").value)
        });
        $("#statistic_selection_form option[value='delta']").remove()
        $("#variable_selection_form option[value='arid']").remove()
        /*
        $("#point_chart").css("height","38%")
        $("#point_chart").css("maxHeight","350px")
        */

    }
    else if (whichChart=="EnableForPointChart") {
        showChartOnMapSelect="PointChart"
        $( "#variable_selection_form" ).change(function() {
            createChart(document.getElementById("variable_selection_form").value, document.getElementById("statistic_selection_form").value, document.getElementById("season_selection_form").value)
        });
        $( "#statistic_selection_form" ).change(function() {
            createChart(document.getElementById("variable_selection_form").value, document.getElementById("statistic_selection_form").value, document.getElementById("season_selection_form").value)
        });
        $( "#season_selection_form" ).change(function() {
            createChart(document.getElementById("variable_selection_form").value, document.getElementById("statistic_selection_form").value, document.getElementById("season_selection_form").value)
        });

         var climateVar = document.getElementById("variable_selection_form");
         var variable = climateVar.options[climateVar.selectedIndex].text;
         if (variable!="PET")  {
            var option = $('<option class="delta"></option>').attr("value", "delta").text("Change");
         }
        $("#statistic_selection_form").append(option);
        var option = $('<option class="arid"></option>').attr("value", "arid").text("Aridity");
        $("#variable_selection_form").append(option);
        /*
        $("#point_chart").css("height","32%")
        $("#point_chart").css("maxHeight","260px")
        */
    }
}

$("#variable_selection_form").change(function(){
    var selectedVal = $(this).val();

    if(selectedVal == "arid")
    {
     $("select#statistic_selection_Form").prop("selectedIndex",1);
     $(".delta,.children").show();
     $(".avg,.children").hide();
     $(".anom,.children").hide();
    }
    else if (selectedVal == "pet")
    {
     $("select#statistic_selection_Form").prop("selectedIndex",0);
     $(".avg,.children").show();
     $(".anom,.children").hide();
     $(".delta,.children").hide();
    }
    else{
     $(".avg,.children").show();
     $(".anom,.children").show();
     $(".delta,.children").show();
    }
  });

/****************************************** Near-Term Climate ********************************************************/

function acquireNearTermClimate() {

    //get the data files and parse out to an array (for chart) and a dictionary (for map).
    //Called once during initial page load.

    // TEMPERATURE
    allTempDataArray=[]
    allTempDeltaDict={}

    $.ajax({
        type: "GET",
        url: static_url + "data/noaa/climate/cpcllftd.dat",
        dataType: "text",
        success: function(data) {createTemperatureDataArray(data);},
        // required for allTextLines to be global
        async: false
    });

    function createTemperatureDataArray(allText) {
        //All lines in the near-term climate text file.
        var allTextLines = allText.split(/\r\n|\n/);
        for (var i=2; i<allTextLines.length; i++) {
            allTempDataArray.push(allTextLines[i].split(/\s+/));
        }

        //Dictionary of all deltas For Setting Map Symbology
        //allTempDeltaDict[division][period]=value
        for (var i=0; i< allTempDataArray.length; i++){
            division=allTempDataArray[i][3]

            temp_climatological_mean=allTempDataArray[i][19]
            temp_forecast_mean=allTempDataArray[i][18]

            delta=temp_forecast_mean-temp_climatological_mean

            if ( !(division in allTempDeltaDict)) {
                allTempDeltaDict[division]=[]
            }
            allTempDeltaDict[division].push(delta)
        }
    }

    allPrecipDataArray=[]
    allPrecipDeltaDict={}

    // PRECIPITATION
    $.ajax({
        type: "GET",
        url: static_url + "data/noaa/climate/cpcllfpd.dat",
        dataType: "text",
        success: function(data) {createPrecipDataArray(data);},
        async: false
    });

    function createPrecipDataArray(allText) {
        var allTextLines = allText.split(/\r\n|\n/);
        for (var i=2; i<allTextLines.length; i++) {
            allPrecipDataArray.push(allTextLines[i].split(/\s+/));
        }

        for (var i=0; i< allPrecipDataArray.length; i++){
            division=allPrecipDataArray[i][3]

            precip_climatological_mean=allPrecipDataArray[i][19]
            precip_forecast_mean=allPrecipDataArray[i][18]

            delta=precip_forecast_mean-precip_climatological_mean

            if ( !(division in allPrecipDeltaDict)) {
                allPrecipDeltaDict[division]=[]
            }
            allPrecipDeltaDict[division].push(delta)
        }
    }


    firstYearInFile=allTempDataArray[0][0]
    firstMonthInFile=allTempDataArray[0][1]

}

function createDynamicMonthlyRadioButtons(){

    $(".nearTermClimateForm").empty()

    month_list=[]
    year_list=[]

    firstDateInFile=new Date(firstYearInFile,firstMonthInFile)

    for (i=0; i<15; i++) {
        locale = "en-us",
        month = firstDateInFile.toLocaleString(locale, { month: "short" });
        year = firstDateInFile.toLocaleString(locale, { year: "numeric" });
        firstDateInFile.setMonth(firstDateInFile.getMonth()+1);
        month_list[i]=month
        year_list[i]=year

    }

    for (i=0; i<13; i++) {

        if (year_list[i] == year_list[i+1] && year_list[i+1]== year_list[i+2]){

            $(".nearTermClimateForm").append('<input  class="testDiv" type="radio" id="test-' + i + '" name="period" value="' + (i+1) + '" >' + month_list[i] + '-' + month_list[i+1] + '-' + month_list[i+2] + ' ' + year_list[i] + '<br>')
        }
        else {

            year_span = year_list[i].slice(-2) + "-" + (parseInt(year_list[i].slice(-2)) + 1)

            $(".nearTermClimateForm").append('<input class="testDiv" type="radio" id="test-' + i + '" name="period" value="' + (i+1) + '" >' + month_list[i] + '-' + month_list[i+1] + '-' + month_list[i+2] + ' ' + year_span + '<br>')
        }

    }
}

function generateNearTermClimateResults(period,division) {

    //Function to replace the contents of table 2 & table 3 when a user clicks on a climate division or changes the Time Frame

    //Update Climate Divsion # at the top of the tab
    $('#climateDivision').html(division)

    // TEMPERATURE
    temp_array=[]

    for (var i=0; i< allTempDataArray.length; i++){
        if (allTempDataArray[i][3] == division && allTempDataArray[i][2] == period){
            temp_array=allTempDataArray[i]
        }
    }

    temp_climatological_mean=temp_array[19]
    temp_forecast_mean=temp_array[18]
    temp_change=temp_forecast_mean-temp_climatological_mean
    temp_change_rounded=Math.round(temp_change * 100) / 100
    temp_ninety_percent_confidence_interval=temp_array[6] + "&deg;F - "  + temp_array[16] + "&deg;F"

    // PRECIPITATION
    precip_array=[]

    for (var i=0; i< allPrecipDataArray.length; i++){
        if (allPrecipDataArray[i][3] == division && allPrecipDataArray[i][2] == period){
            precip_array=allPrecipDataArray[i]
        }
    }

    precip_climatological_mean=precip_array[19]
    precip_forecast_mean=precip_array[18]
    precip_change=precip_forecast_mean-precip_climatological_mean
    precip_change_rounded=Math.round(precip_change * 100) / 100
    precip_ninety_percent_confidence_interval=precip_array[6] + " in. - "  + precip_array[16] + " in."

    //Table 2

    //Save the "Show on Map" Radio Buttons.
    var save = $('#nearTermClimateWrapper #mapRadioRow').detach();

    $('#nearTermClimateWrapper').empty();

    $('#nearTermClimateWrapper').append('<br><div id="dynamicNearTermClimateTableDiv"></div>')
    $('#dynamicNearTermClimateTableDiv').append('<table class="dynamicNearTermClimateTable" style="box-shadow: 1px 1px 4px black" id="nearTermChangeTable"></table>');

    var nearTermClimateTable=$('#dynamicNearTermClimateTableDiv').children();

    if (temp_change_rounded > 0 ) {
        //$('#thermometerDegreeChange').html('&#9650;')
        temp_change_td_contents='<img height="17px" src="'+static_url+'img/up_arrow.png"> ' + temp_change_rounded + '&deg;F'
    }
    else if (temp_change_rounded < 0 ) {
        //$('#thermometerDegreeChange').html('&#9660')
        temp_change_td_contents='<img height="17px" src="'+static_url+'img/down_arrow.png"> ' + temp_change_rounded + '&deg;F'
    }
    else {
        temp_change_td_contents='No Change'
    }

    if (precip_change_rounded > 0 ) {
        //$('#rainGaugeChange').html('&#9650;')
        precip_change_td_contents='<img height="17px" src="'+static_url+'img/up_arrow.png"> ' + precip_change_rounded + " in."
    }
    else if (precip_change_rounded < 0 ) {
        //$('#rainGaugeChange').html('&#9660')
        precip_change_td_contents='<img height="17px" src="'+static_url+'img/down_arrow.png"> ' + precip_change_rounded + " in."
    }
    else {
        precip_change_td_contents='No Change'
    }

    nearTermClimateTable.append('<tr style="border-bottom:none !important"><td rowspan="1" style="border-right:none !important;">Change from the <br> Historical Mean</td>'+'<td class="changeTD">'+temp_change_td_contents+'</td><td class="changeTD">'+precip_change_td_contents+'</td></tr>')

    //Append the "Show on Map" Radio Buttons.
    nearTermClimateTable.append(save);

    //Table 3

    $('#nearTermClimateWrapper2').empty();
    $('#nearTermClimateWrapper2').append('<br><div id="dynamicNearTermClimateTableDiv2"></div>')
    $('#dynamicNearTermClimateTableDiv2').append('<table class="dynamicNearTermClimateTable" id="nearTermDetailsTable"></table>');

    var nearTermClimateTable2=$('#dynamicNearTermClimateTableDiv2').children();

    nearTermClimateTable2.append("<tr style='border: 1px solid !important;'><td>Historical Mean </td><td>" + temp_climatological_mean+ "&deg;F</td><td>"+precip_climatological_mean+ " in.</td></tr>")
    nearTermClimateTable2.append("<tr><td>Forecast Mean</td><td>"+temp_forecast_mean+"&deg;F</td><td>"+precip_forecast_mean+" in.</td></tr>")
    nearTermClimateTable2.append("<tr><td>90% Confidence Interval</td><td>"+temp_ninety_percent_confidence_interval+ "</td><td>"+precip_ninety_percent_confidence_interval+"</td></tr>")

    // Adjust the thermometer and rain gauge levels based on the change
    // +21 to offset for Historical Mean
    $('#thermometerAfter').css('height', (temp_change_rounded * 37 + 67) + "px")
    $('#rainGaugeAfter').css('height', (precip_change_rounded * 37 + 67) + "px")

}

function showInfoPopup(layerToDescribe){

    var dbid=Data_Basin_ID_Dict[layerToDescribe]

    if (layerToDescribe=='intactness'){
        title="Terrestrial Intactness"
        description="<div class='MessiDiv'>"
        description=description+"<a target='_blank' href=http://databasin.org/datasets/"+dbid+"><img title='Click to view or download this dataset on Data Basin' class='DataBasinRedirectImgDescription' src='" + static_url + "img/dataBasinRedirect.png'></a><p>"
        description=description+"Terrestrial intactness is an estimate of current condition based on the extent to which human impacts such as agriculture, urban development, natural resource extraction, and invasive species have disrupted the landscape across the DRECP study area. Terrestrial intactness values will be high in areas where these impacts are low. <p>The value shown in the column chart represents the average terrestrial intactness value within the selected area. Terrestrial intactness values are calculated using an <a target='_blank' href=http://consbio.org/products/tools/environmental-evaluation-modeling-system-eems>EEMS</a> fuzzy logic model that integrates multiple measures of landscape development and vegetation intactness (See EEMS model diagram below). <p>  This model integrates agriculture development (from LANDFIRE EVT v1.1), urban development (from LANDFIRE EVT v1.1 and NLCD Impervious Surfaces), linear development (from Tiger 2012 Roads, utility lines, and pipelines), OHV recreation areas, energy and mining development (from state mine and USGS national mines datasets as well as geothermal wells, oil/gas wells, wind turbines, and power plant footprints), vegetation departure (from LANDFIRE VDEP), invasive vegetation (multiple sources combined for invasives analyses), and measures of natural vegetation fragmentation calculated using FRAGSTATS. In this version, Maxent modeled Sahara Mustard was included in the Invasive's branch as well as in the Fragstats model run. "
        description=description+"<div class='modelDiagram' style='height:70%'><img src='" + static_url + "img/modelDiagrams/Terrestrial_Intactness/Slide1.PNG'>"
        description=description+"<img src='" + static_url + "img/modelDiagrams/Terrestrial_Intactness/Slide2.PNG'>"
        description=description+"<div class='bottom_spacing'><p></div>"
        description=description+"</div>"

    }

    else if (layerToDescribe=='hisensfz'){
        title="Site Sensitivity"
        description="<div class='MessiDiv'>"
        description=description+"<a target='_blank' href=http://databasin.org/datasets/"+dbid+"><img title='Click to view or download this dataset on Data Basin' class='DataBasinRedirectImgDescription' src='" + static_url + "img/dataBasinRedirect.png'></a><p>"
        description=description+"The Site Sensitivity Model evaluates the study area for factors that make the landscape sensitive to climate change. These factors fall into two main branches of the model: soil sensitivity and water retention potential. As a final step in the model, we defined barren areas as having the lowest possible sensitivity since many of these areas will not be further degraded by climate change.<p>The value shown in the column chart represents the average sensitivity value within the selected area."
        description=description+"<div class='modelDiagram'><img src='" + static_url + "img/modelDiagrams/SiteSensitivity.png'>"
        description=description+"<div class='bottom_spacing'><p></div>"
        description=description+"</div>"

    }

    else if (layerToDescribe=='eecefzt1'){
        title="Climate Exposure t<sub>1 </sub>(2016-2045)"
        description="<div class='MessiDiv'>"
        description=description+"<a target='_blank' href=http://databasin.org/datasets/"+dbid+"><img title='Click to view or download this dataset on Data Basin' class='DataBasinRedirectImgDescription' src='" + static_url + "img/dataBasinRedirect.png'></a><p>"
        description=description+"<a target='_blank' href=http://consbio.org/products/tools/environmental-evaluation-modeling-system-eems>EEMS</a> model of climate exposure (2016-2045) generated using data from climate model results. Climate exposure is based on the difference between the projected future climate compared to the variability in climate over a reference historical period of 1971-2000. The higher the climate exposure, the greater the difference the projected climate is from what the area experienced in the past."
        description=description+"<p>The value shown in the column chart represents the average climate exposure value within the selected area."
        description=description+"<div class='modelDiagram'><img src='" + static_url + "img/modelDiagrams/ClimateExposureEnsemble.png'>"
        description=description+"<div class='bottom_spacing'><p></div>"
        description=description+"</div>"

    }

    else if (layerToDescribe=='eecefzt2'){
        title="Climate Exposure t<sub>2 </sub>(2046-2075)"
        description="<div class='MessiDiv'>"
        description=description+"<a target='_blank' href=http://databasin.org/datasets/"+dbid+"><img title='Click to view or download this dataset on Data Basin' class='DataBasinRedirectImgDescription' src='" + static_url + "img/dataBasinRedirect.png'></a><p>"
        description=description+" <a target='_blank' href=http://consbio.org/products/tools/environmental-evaluation-modeling-system-eems>EEMS</a> model of climate exposure (2046-2075) generated using data from climate model results. Climate exposure is based on the difference between the projected future climate compared to the variability in climate over a reference historical period of 1971-2000. The higher the climate exposure, the greater the difference the projected climate is from what the area experienced in the past."
        description=description+"<p>The value shown in the column chart represents the average climate exposure value within the selected area."
        description=description+"<div class='modelDiagram'><img src='" + static_url + "img/modelDiagrams/ClimateExposureEnsemble.png'>"
        description=description+"<div class='bottom_spacing'><p></div>"
        description=description+"</div>"

    }

    else if (layerToDescribe=='eepifzt1'){
        title="Potential Climate Impact t<sub>1 </sub>(2016-2045)"
        description="<div class='MessiDiv'>"
        description=description+"<a target='_blank' href=http://databasin.org/datasets/"+dbid+"><img title='Click to view or download this dataset on Data Basin' class='DataBasinRedirectImgDescription' src='" + static_url + "img/dataBasinRedirect.png'></a><p>"
        description=description+"<a target='_blank' href=http://consbio.org/products/tools/environmental-evaluation-modeling-system-eems>EEMS</a> model of potential climate impacts (2016-2045) generated using data from STATSGO soils data and climate model results. "
        description=description+"Results from the Site Sensitivity and Climate Exposure models contribute equally to the results of the Potential Climate Impact model. As with the Climate Exposure Model, the Climate Impacts Model was run for each climate future (full results available on Data Basin). The results from the run with ensemble climate data are used in the Climate Console.<p>"
        description=description+"<p>The value shown in the column chart represents the average potential climate impact value within the selected area."
        description=description+"<div class='modelDiagram'><img src='" + static_url + "img/modelDiagrams/PotentialClimateImpactsEnsemble.png'>"
        description=description+"<div class='bottom_spacing'><p></div>"
        description=description+"</div>"

    }

    else if (layerToDescribe=='eepifzt2'){
        title="Potential Climate Impact t<sub>2 </sub>(2046-2075)"
        description="<div class='MessiDiv'>"
        description=description+"<a target='_blank' href=http://databasin.org/datasets/"+dbid+"><img title='Click to view or download this dataset on Data Basin' class='DataBasinRedirectImgDescription' src='" + static_url + "img/dataBasinRedirect.png'></a><p>"
        description=description+"<a target='_blank' href=http://consbio.org/products/tools/environmental-evaluation-modeling-system-eems>EEMS</a> model of potential climate impacts (2046-2075) generated using data from STATSGO soils data and climate model results. "
        description=description+"Results from the Site Sensitivity and Climate Exposure models contribute equally to the results of the Potential Climate Impact model. As with the Climate Exposure Model, the Climate Impacts Model was run for each climate future (full results available on Data Basin). The results from the run with ensemble climate data are used in the Climate Console."
        description=description+"<p>The value shown in the column chart represents the average potential climate impact value within the selected area."
        description=description+"<div class='modelDiagram'><img src='" + static_url + "img/modelDiagrams/PotentialClimateImpactsEnsemble.png'>"
        description=description+"<div class='bottom_spacing'><p></div>"
        description=description+"</div>"

    }

    new Messi(description, {title: title, center:true, width:'1000px', modal:true, modalOpacity:.4,center: true});

}

$(window).load(function(){

//Function to start and stop automatic time cycling on the near term climate tab.

function startCycle(){

    index=$(".nearTermClimateForm input[type='radio']:checked").val();

    change = function () {
        setTimeout(function () {
            if (index > 12)
                index = 0;
            $("#test-"+index).click();
            index++;
            change();
        },
        1000);
    }

    $(function () {
        change();
    });

}

function stopCycle(){
    change='';
    clearTimeout(change)
}

$('#start').click(function(e){
    e.preventDefault();
    startCycle();
});

$('#stop').click(function(e){
    e.preventDefault();
    stopCycle();
})

});//]]>

$(function() {
    //Mouse over and click functions on the start/stop buttons.

    $('#startDiv').on({
        mouseover: function(){
            $(this).css('background-image', 'url(' + static_url + 'img/start_hover.png');
        },
         mouseleave: function(){
             $(this).css('background-image', 'url(' + static_url + 'img/start.png');
        },
        click: function(){
            $(this).off('mouseleave');
            $(this).css('background-image', 'url(' + static_url + 'img/start_hover.png');
            $('#stopDiv').css('background-image', 'url(' + static_url + 'img/stop.png');
        }
    });

    $('#stopDiv').on({
        mouseover: function(){
            $(this).css('background-image', 'url(' + static_url + 'img/stop_hover.png');
        },
        mouseleave: function(){
            $(this).css('background-image', 'url(' + static_url + 'img/stop.png');
        },
        click: function(){
            //Uncomment line below to make the stop button stay on after a click
            //$(this).off('mouseleave');
            $(this).css('background-image', 'url(' + static_url + 'img/stop_hover.png');
            $('#startDiv').css('background-image', 'url(' + static_url + 'img/start.png');
            //Need this in order to make the mouseout work on the start button again for some reason.
            $('#startDiv').on({
                 mouseleave: function(){
                     $(this).css('background-image', 'url(' + static_url + 'img/start.png');
                 }
            });
        }
    });
});

function aspatial_query(){
    /*
    min_area=document.getElementById("min_area").value
    min_area_units=document.getElementById("min_area_units").value
    */

    $("#view1").css("opacity", ".1");
    $("#view2").css("opacity", ".1");
    $(".wait").css("display", "block");

    $(document).ajaxComplete(function(){
        $("#view1").css("opacity", "1");
        $("#view2").css("opacity", "1");
        $(".wait").css("display", "none");
        //map.removeLayer(layer)
    });



    if (typeof user_wkt == 'undefined' ) { user_wkt="POLYGON((-118.85009765625 32.58384932565662,-118.85009765625 37.31775185163688,-114.071044921875 37.31775185163688,-114.071044921875 32.58384932565662,-118.85009765625 32.58384932565662))"}

    initialTableSelectionPerformed=true

    create_post(user_wkt,reporting_units)

}

function update_slider_label(value){
    if (value <=-.75){
        return "Very Low"
    }
    else if (value <=-.5){
        return "Low"
    }
    else if (value <=0){
        return "Moderately Low"
    }
    else if (value <=.5){
        return "Moderately High"
    }
    else if (value <=.75){
        return "High"
    }
    else {
        return "Very High"
    }
}


