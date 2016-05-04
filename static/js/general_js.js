/******************************************* On Document Ready *******************************************************/
 $(document).ready(function(){

    $(function() {
      $(".child").on("click",function() {
          $parent = $(this).prevAll(".parent");
          if ($(this).is(":checked")) $parent.prop("checked",true);
          else {
             var len = $(this).parent().find(".child:checked").length;
             $parent.prop("checked",len>0);
          }
      })
      $(".parent").on("click",function() {
          $(this).parent().find(".child").prop("checked",this.checked);
      });
    });

    // Prevents checkbox and variable  from getting out of sync on page reload.
    // Needs to be in the document.ready() function.
    $("#enable_environment_settings_checkbox").prop('checked',false)
    $("#enable_environment_settings_checkbox").change(function(){
         var $this = $(this);
         // $this will contain a reference to the checkbox
         if ($this.is(':checked')) {
             enable_environment_settings=true
         } else {
             enable_environment_settings=false
         }
    });

    //Initial labels on sliders.
    $( "#amount_ti_label" ).val("Moderately Low \(0\)");
    $( "#amount_cv_label" ).val("Moderately Low \(0\)");
    $( "#amount_species_count").val("8");


     $(document).ajaxStart(function() {
         $("#view1").css("opacity", ".1");
         $("#view2").css("opacity", ".1");
         $(".wait").css("display", "block");
     });

    //Set the search criteria tabs back to opaque after the AJAX query is completed
    $(document).ajaxComplete(function(){
         $("#view1").css("opacity", "1");
         $("#view2").css("opacity", "1");
         $(".wait").css("display", "none");
         $('#areaWarning').hide()
         //map.removeLayer(layer)
     });

 });

//Required to disable mouse clicking on study area boundary.
window.onload=function(){
   study_area_boundary.addTo(map)
}


/*************************************************** Slider bars  ****************************************************/

//initialize default values. Change the default labels above as well.
enable_environment_settings=false
ti_slider=0
cv_slider=0
species_count_slider_value=8
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

/***************************************** Dataset pop-up info ********************************************************/
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

    new Messi(description, {title: title, center:true, width:'1000px', modal:true, modalOpacity:.4});

}

function aspatial_query(){

    //Search entire area if the user hasn't clicked in the map yet.
    if (typeof user_wkt == 'undefined' ) { user_wkt="POLYGON((-118.85009765625 32.58384932565662,-118.85009765625 37.31775185163688,-114.071044921875 37.31775185163688,-114.071044921875 32.58384932565662,-118.85009765625 32.58384932565662))"}

    initialTableSelectionPerformed=true

    create_post(user_wkt,reporting_units)

}

function generateReport(){
    $.get(
        report_url,
        {
            wktPOST: user_wkt,
            reporting_units: reporting_units,
            ti_slider: ti_slider,
            cv_slider: cv_slider,
            min_area: min_area,
            min_area_units: min_area_units,
            species_count_slider_value: species_count_slider_value,
            corridor_avoidance_slider_value: corridor_avoidance_slider_value,
            chat_slider_value: chat_slider_value,
            cdfw_slider_value: cdfw_slider_value,
            ownership_values: ownership_values,
            solar_slider_value: solar_slider_value,
            enable_environment_settings: enable_environment_settings,
            distance_to_transmission: distance_to_transmission,
            distance_to_transmission_units: distance_to_transmission_units
        },
        function(data, status){
            if(status == 'success'){
                var win=window.open('about:blank');
                win.document.write(data);
                win.document.close();
            }
        }
    );
}

