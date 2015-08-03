intactnessTooltip="Terrestrial intactness is an estimate of current condition based on the extent to which human impacts such as agriculture, urban development, natural resource extraction, and invasive species have disrupted the landscape across the DRECP study area. Terrestrial intactness values will be high in areas where these impacts are low."
siteSensitivityTooltip="The Site Sensitivity Model evaluates the study area for factors that make the landscape sensitive to climate change. These factors fall into two main branches of the model: soil sensitivity and water retention potential. As a final step in the model, we defined barren areas as having the lowest possible sensitivity since many of these areas will not be further degraded by climate change."
climateExposureTooltip="The Climate Exposure Model is based on changes in four factors of projected future climate: (1) mean annual minimum temperature, (2) mean annual maximum temperature, (3) mean annual precipitation, and (4) aridity. Change was calculated for two future time periods, 2015-2030 and 2045-2060."
potentialImpactTooltip="Results from the Site Sensitivity and Climate Exposure models contribute equally to the results of the EEMS Climate Impacts Model. As with the Climate Exposure Model, the Climate Impacts Model was run for each climate future."

var attributes = ["" +
    "<span class='highChartsXaxisText' title='" + intactnessTooltip + "'><span onclick='swapImageOverlay(&quot;intactness&quot;);swapLegend(&quot;intactness&quot;,&quot;intactness&quot;,&quot;EEMSmodel&quot;)'>Terrestrial Intactness</span> <div class='info_icon' onClick=showInfoPopup('intactness')> </div></span>",
    "<span class='highChartsXaxisText' title='" + siteSensitivityTooltip + "'<span onclick='swapImageOverlay(&quot;hisensfz&quot;);swapLegend(&quot;hisensfz&quot;,&quot;hisensfz&quot;,&quot;EEMSmodel&quot;)'>Site Sensitivity <div class='info_icon' onClick=showInfoPopup('hisensfz')> </div></span>",
    "<span class='highChartsXaxisText' title='" + climateExposureTooltip + "'<span onclick='swapImageOverlay(&quot;eecefzt1&quot;);swapLegend(&quot;eecefzt1&quot;,&quot;eecefzt1&quot;,&quot;EEMSmodel&quot;)'>Climate Exposure t<sub>1</sub><div class='info_icon' onClick=showInfoPopup('eecefzt1')> </div></span>",
    "<span class='highChartsXaxisText' title='" + climateExposureTooltip + "'<span onclick='swapImageOverlay(&quot;eecefzt2&quot;);swapLegend(&quot;eecefzt2&quot;,&quot;eecefzt2&quot;,&quot;EEMSmodel&quot;)'>Climate Exposure t<sub>2</sub><div class='info_icon' onClick=showInfoPopup('eecefzt2')> </div></span>",
    "<span class='highChartsXaxisText' title='" + potentialImpactTooltip + "'<span onclick='swapImageOverlay(&quot;eepifzt1&quot;);swapLegend(&quot;eepifzt1&quot;,&quot;eepifzt1&quot;,&quot;EEMSmodel&quot;)'>Potential Impact t<sub>1</sub><div class='info_icon' onClick=showInfoPopup('eepifzt1')> </div></span>",
    "<span class='highChartsXaxisText' title='" + potentialImpactTooltip + "'<span onclick='swapImageOverlay(&quot;eepifzt2&quot;);swapLegend(&quot;eepifzt2&quot;,&quot;eepifzt2&quot;,&quot;EEMSmodel&quot;)'>Potential Impact t<sub>2</sub><div class='info_icon' onClick=showInfoPopup('eepifzt2')> </div></span>",
];

function createColumnChart(){
    if (resultsJSON["intactness_avg"]){
        intactness=resultsJSON["intactness_avg"]
    }else{
        intactness=.4
    }
    if (resultsJSON["eecefzt1_avg"]){
        eecefzt1=resultsJSON["eecefzt1_avg"]
    }else{
        eecefzt1=.7
    }
    if (resultsJSON["eecefzt2_avg"]){
        eecefzt2=resultsJSON["eecefzt2_avg"]
    }else{
        eecefzt2=.4
    }
    if (resultsJSON["eepifzt1_avg"]){
        eepifzt1=resultsJSON["eepifzt1_avg"]
    }else{
        eepifzt1=-.2
    }
    if (resultsJSON["eepifzt2_avg"]){
        eepifzt2=resultsJSON["eepifzt2_avg"]
    }else{
        eepifzt2=.3
    }
    if (resultsJSON["hisensfz_avg"]){
        hisensfz=resultsJSON["hisensfz_avg"]
    }else{
        hisensfz=.6
    }

    //var values = [resultsJSON["hitiv11_avg"],.3, -.2,.5 ]
    var values = [intactness, hisensfz, eecefzt1,eecefzt2,eepifzt1,eepifzt2]
    var minVal = -1;
    var maxVal = 1;
    var OID=1

    //var colors="{{colors}}".split(',')
    //var columnChartColors=columnChartColors.split(',')
    //var columnChartColors=['#444444','#444444','#444444','#444444','#444444']
    columnChartColors=columnChartColorsCSV.split(',')

    $(function () {
        $('#column_chart').highcharts({
              chart: {
                    type: 'column',
                    width:477,
                    height:380,
                    marginTop:50,
                },
                credits: {
                    enabled: false
                },

                exporting: {
                    enabled: false
                },
                title: {

                    text: ' ',
                    x: 30,
                    margin: 15,

                    style: {
                        fontSize: '14px'
                    }
                },
                subtitle: {
                    //text: '511574.7544' + 'N , ' + 'E3849223.0376' + 'E, UTM 11N, NAD83'
                },

                xAxis: {
                    maxPadding:0,
                    endOnTick: true,
                    x:0,
                    y:0,
                    margin:0,
                    //Set attribute values above.
                    categories: attributes,
                    labels: {
                       rotation: -45,
                       style: { fontSize: '11px', fontWeight: 'normal', textAlign: 'right', cursor: 'pointer'},
                       staggerLines:1,
                       //fix for overlapping labels
                       //useHTML:false
                       useHTML:true
                    }
                },

                yAxis: {
                    tickInterval:.25,
                    min: minVal,
                    max: maxVal,
                    title: {
                        text: ''
                    },
                    labels: {
                       formatter: function () {
                            //Hack to get the "Very Low" label to display
                            //if (this.value < -.9) { return yBottomLabel }
                            //else { return yLabels[this.value]}

                           if (this.value > .75) {return "Highest (+1)"}
                           if (this.value > .5) {return "Very High"}
                           if (this.value > .25) {return "High"}
                           if (this.value > 0) {return ""}
                           if (this.value == 0) { return "Moderate (0)"}
                           if (this.value > -.499999) {return ""}
                           if (this.value > -.749999) {return "Low"}
                           if (this.value > -1.000) {return "Very Low"}
                           else { return "Lowest (-1)"}
                        },
                        style: {
                            fontSize:"11px",
                        }
                    }
                },
               tooltip: {
                   useHTML:true,
                   backgroundColor: '#E9E6E0',
                   borderWidth: 1,
                   shadow: true,
                   padding: 0,
                  // pointFormat: '<span style="font-size:14px"><b>{point.y}</b> </span>' + valueSuffix + '<br><i>(Click to Map)</i>',

                   formatter: function() {
                        return this.key.replace(/\s*\<.*?\>\s*/g, '') +
                        '<br><span style="font-size:14px"><b>'+ this.point.y + '</b> </span><br><i>(Click to Map)</i>'
                    }
                },
                plotOptions: {
                    column: {
                        pointPadding:.1,
                        borderWidth: 1,
                        //colors: ['#364D22', '#4D79B3', '#734D21', '#FF5C0F', '#B11B1B']
                        colors: columnChartColors
                    },
                    series: {
                        colorByPoint:true,
                        shadow:false,
                        borderColor: '#444444'
                    },
                    dataLabels: {
                        useHTML:true,
                    }
                },

                legend: {
                    enabled: false
                },

                series: [{
                    name: ' ',
                    layersToAdd:['intactness','hisensfz','eecefzt1','eecefzt2','eepifzt1','eepifzt2'],
                    data: values,
                    cursor: 'pointer',
                    point: {
                            events: {
                                click: function() {
                                    var layerToAdd = this.series.userOptions.layersToAdd[this.x]; // onclick get the x index and use it to find the URL

                                    // Workaround to getting the last bar clicked to show up on top
                                    // Simply remove the other ones if they're in the map.

                                    var i = 0;
                                    while (i <= 4){
                                        layerToRemove = this.series.userOptions.layersToAdd[i]
                                        if (i != this.x){
                                                if (map.hasLayer(layerToRemove)){
                                                    map.removeLayer(layerToRemove)
                                                }
                                            }
                                        i+=1
                                    }
                                    // End Workaround

                                    if (layerToAdd){
                                         swapImageOverlay(layerToAdd)
                                         swapLegend(layerToAdd, layerToAdd, 'EEMSmodel')
                                        //window.open(layerToAdd);
                                        // toggleLayer(layerToAdd)
                                    }

                                    //function for deselecting points when a column is selected.
                                    //Another issue: selecting a new polygon recreates the chart and deselects the selected column
                                    /*
                                    var other_chart = $('#point_chart').highcharts()
                                    other_chart.series[0].data[0].select();
                                    other_chart.series[1].data[0].select();
                                    other_chart.series[2].data[0].select();
                                    other_chart.series[3].data[0].select();
                                    */

                                }
                            }
                    },
                    allowPointSelect: false,
                        states: {
                            select: {
                                color:'#444444',
                                borderWidth: 4,
                                borderColor:'#00FFFF',
                            }
                        }
                }]
            });
    });

}