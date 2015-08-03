function createChart(climateVariable, statistic, season) {

    //Determine what variables are set in the drop down menu.
    climateVar = document.getElementById("variable_selection_form");
    selectedClimateVar= climateVar.options[climateVar.selectedIndex].text;
    climateStat = document.getElementById("statistic_selection_form");
    selectedClimateStat= climateStat.options[climateStat.selectedIndex].text;
    climateSeason = document.getElementById("season_selection_form");
    selectedClimateSeason = climateSeason.options[climateSeason.selectedIndex].text;

    $('#point_chart_description').append(
        " Click on a point to display the dataset used to generate the plotted value. "
    )

    //alert(resultsJSON['m5arids2t1_avg'])

    //Allow for climate variable variations.
    if (statistic=="anom"){
        if (climateVariable=="tmin"){climateVariable="tmia"}
        else if (climateVariable=="tmax"){climateVariable="tmaa"}
        else if (climateVariable=="prec"){climateVariable="prea"}
    }
    else if (statistic=="delta") {
        if (climateVariable=="tmin"){climateVariable="tmid"}
        else if (climateVariable=="tmax"){climateVariable="tmad"}
        else if (climateVariable=="prec"){climateVariable="pred"}
    }

    //JSON keys (field names) take the form <modelAbbreviation>_<variablePrefix>__<timePeriod>_<statistic>
    CanESM2_LayersToAdd=['','c2'+climateVariable+season+'t1','c2'+climateVariable+season+'t2']
    CCSM4_LayersToAdd=['','c4'+climateVariable+season+'t1','c4'+climateVariable+season+'t2']
    MIROC5_LayersToAdd=['','m5'+climateVariable+season+'t1','m5'+climateVariable+season+'t2']
    Ensemble_LayersToAdd=['', 'ee'+climateVariable+season+'t1','ee'+climateVariable+season+'t2']
    PRISM_LayersToAdd=['pm'+climateVariable+season+'t0']

    var db_statistic="avg"

    //Data To Plot
    //Nulls for the first value to show Historical Starting Point as an independent point.
    //CanESM2
    var line1Values=['', resultsJSON["c2"+climateVariable+season+"t1"+"_"+db_statistic], resultsJSON["c2"+climateVariable+season+"t2"+"_"+db_statistic]]
    //CCSM4_CM3
    var line2Values=['', resultsJSON["c4"+climateVariable+season+"t1"+"_"+db_statistic], resultsJSON["c4"+climateVariable+season+"t2"+"_"+db_statistic]]
    //MIROC5
    var line3Values=['', resultsJSON["m5"+climateVariable+season+"t1"+"_"+db_statistic], resultsJSON["m5"+climateVariable+season+"t2"+"_"+db_statistic]]
    //Ensemble
    var line4Values=['', resultsJSON["ee"+climateVariable+season+"t1"+"_"+db_statistic], resultsJSON["ee"+climateVariable+season+"t2"+"_"+db_statistic]]

    //Historical (PRISM)
    if (statistic=='anom' || statistic =='delta' ){
        var line5Values=[0]
    } else {
        var line5Values=[resultsJSON["pm"+climateVariable+season+"t0"+"_"+statistic]]
    }

//Minimum Temperature
if (climateVariable=='tmin') {
    yAxisLabel='Degrees (°C)'
    valueSuffix= '°C'
}

//Maximum Temperature
else if(climateVariable=='tmax') {
    yAxisLabel='Degrees (°C)'
    valueSuffix= '°C'
}

//Precipitation
else if(climateVariable=='prec') {
    yAxisLabel="mm/year"
    valueSuffix= 'mm/year'
}

//PET
else if(climateVariable=='pet') {
    yAxisLabel="mm/year"
    valueSuffix= 'mm/year'
}

//Minimum Temperature Delta
else if(climateVariable=='tmid') {
    yAxisLabel='Degrees (°C)'
    valueSuffix= '°C'
    //Detlas are zero everywhere for the historical
    PRISM_LayersToAdd=['single_transparent_pixel']
}

//Maximum Temperature Delta
else if(climateVariable=='tmad') {
    yAxisLabel='Degrees (°C)'
    valueSuffix= '°C'
    PRISM_LayersToAdd=['single_transparent_pixel']
}

//Precipitation Delta
else if(climateVariable=='pred') {
    yAxisLabel='Percent Change'
    valueSuffix= '%'
    PRISM_LayersToAdd=['single_transparent_pixel']
}

//Aridity Delta
    else if(climateVariable=='arid') {
        yAxisLabel="Percent Change"
        valueSuffix= '%'
        PRISM_LayersToAdd=['single_transparent_pixel']
    }

//Minimum Temperature Anomaly
    else if(climateVariable=='tmia') {
        yAxisLabel='Standard Deviations'
        valueSuffix= 'SD'
        //Detlas are zero everywhere for the historical
        PRISM_LayersToAdd=['single_transparent_pixel']
    }

//Maximum Temperature Anomaly
    else if(climateVariable=='tmaa') {
        yAxisLabel='Standard Deviations'
        valueSuffix= 'SD'
        PRISM_LayersToAdd=['single_transparent_pixel']
    }

//Precipitation  Anomaly
    else if(climateVariable=='prea') {
        yAxisLabel='Standard Deviations'
        valueSuffix= 'SD'
        PRISM_LayersToAdd=['single_transparent_pixel']
    }

//Minimum Temperature Summer
else if(climateVariable=='tmis') {
    variablePrefix='tmis'
    yAxisLabel='Degrees (°C)'
    valueSuffix= '%'
}

//Minimum Temperature Winter
else if(climateVariable=='tmiw') {
    yAxisLabel='Degrees (°C)'
    valueSuffix= '%'
}

//Maximum Temperature Summer
else if(climateVariable=='tmas') {
    yAxisLabel='Degrees (°C)'
    valueSuffix= '%'
}

//Maximum Temperature Winter
else if(climateVariable=='tmaw') {
    yAxisLabel='Degrees (°C)'
    valueSuffix= '%'
}

//Precipitation Summer
else if(climateVariable=='pres') {
    yAxisLabel="mm/year"
    valueSuffix= 'mm/year'
}

//Precipitation Winter
else if(climateVariable=='prew') {
    yAxisLabel="mm/year"
    valueSuffix= 'mm/year'
}

//PET Summer
else if(climateVariable=='pets') {
    yAxisLabel="mm/year"
    valueSuffix= 'mm/year'
}

//PET Winter
else if(climateVariable=='petw') {
    yAxisLabel="mm/year"
    valueSuffix= 'mm/year'
}


//Minimum Temperature Summer Delta
else if(climateVariable=='misd') {
    yAxisLabel='Degrees (°C)'
    valueSuffix= '°C'
    PRISM_LayersToAdd=['single_transparent_pixel']

}

//Minimum Temperature Winter Delta
else if(climateVariable=='miwd') {
    yAxisLabel='Degrees (°C)'
    valueSuffix= '°C'
    PRISM_LayersToAdd=['single_transparent_pixel']
}

//Maximum Temperature Summer Delta
else if(climateVariable=='masd') {
    yAxisLabel='Degrees (°C)'
    valueSuffix= '°C'
    PRISM_LayersToAdd=['single_transparent_pixel']
}

//Maximum Temperature Winter Delta
else if(climateVariable=='mawd') {
    yAxisLabel='Degrees (°C)'
    valueSuffix= '°C'
    PRISM_LayersToAdd=['single_transparent_pixel']
}

//Precipitation Summer Delta
else if(climateVariable=='prsd') {
    yAxisLabel='Percent Change'
    valueSuffix= '%'
    PRISM_LayersToAdd=['single_transparent_pixel']
}

//Precipitation Winter Delta
else if(climateVariable=='prwd') {
    yAxisLabel='Percent Change'
    valueSuffix= '%'
    PRISM_LayersToAdd=['single_transparent_pixel']
}

//Aridity Summer Delta
else if(climateVariable=='arsd') {
    yAxisLabel='Percent Change'
    valueSuffix= '%'
    PRISM_LayersToAdd=['single_transparent_pixel']
}

//Aridity Winter Delta
else if(climateVariable=='arwd') {
    yAxisLabel='Percent Change'
    valueSuffix= '%'
    PRISM_LayersToAdd=['single_transparent_pixel']
}

selectedClimateVar=selectedClimateVar.replace("PET", "potential evapotranspiration")


if (selectedClimateSeason=="Annual"){
    seasonalMonthlyModifier=" "
    annualModifier=" annual "
    selectedClimateSeason=selectedClimateSeason.toLowerCase()
}
else
{
    seasonalMonthlyModifier=" (for the months of " + selectedClimateSeason + ")"
    annualModifier=""
}

if((selectedClimateStat=="Average" && climateVariable != "arid") || climateVariable == "pet" ) {
        document.getElementById('point_chart_description').innerHTML="<b>Description:</b> " + "Within the area selected on the map, the average " + annualModifier + selectedClimateVar.toLowerCase() + seasonalMonthlyModifier + " during the historical period from 1971-2000 was " + line5Values  + valueSuffix + ". " + "The chart above shows the modeled projections for two future time periods within this same area. Click on any point to display the dataset used to generate the plotted value."
        $('#point_chart_description').append(" Explore " + selectedClimateVar + " <a onclick=\"changeSelectionForm('EnableForBoxPlot'); createBoxPlot(document.getElementById('variable_selection_form').value, document.getElementById('statistic_selection_form').value, document.getElementById('season_selection_form').value)\"><span title='Click to view box plots' style='cursor: help; font-weight:bold; color: #0054A8'>variability</span></a> within the DRECP study area.")
        /*
        $('#point_chart_description').append("<div style='position:relative; float:right; right:0px; width:40px; margin-left:5px'><img style='width:20px; position:absolute; bottom:-20px;' src='"+static_url + "img/boxPlotIcon.png'></div>")
        */
    }

else if (selectedClimateStat=='Change' || climateVariable == "arid") {
        document.getElementById('point_chart_description').innerHTML="<b>Description:</b> " + "The chart above shows modeled predictions of average "  + annualModifier + selectedClimateVar.toLowerCase()  + " change " +  seasonalMonthlyModifier + " during two future time periods within the area selected on the map. Click on any point to display the dataset used to generate the plotted value."
    }


$(function () {
    $('#point_chart').highcharts({
        chart: {
            zoomType: 'xy',
            type: 'scatter',
            width: 477,
            height:268
        },
        title: {
            text: '',
        },
        credits: {
            enabled: false
        },
        exporting: {
            enabled: false
        },
        subtitle: {
            text: '',
        },
        xAxis: {
            categories: ['Historical <br>(1971-2000)', '2016-2045', '2046-2075'],
        },
        yAxis: {
            title: {
                text: yAxisLabel
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }],
            startOnTick:true,
            endOnTick:true,
            maxPadding:0,
            tickPixelInterval:50,
            /* Show tic on min and max of y axis */
            /*
            showFirstLabel: true,
            showLastLabel: true,
            */
        },
        tooltip: {
            backgroundColor: '#E9E6E0',
            borderWidth: 1,
            shadow: true,
            //useHTML causes hover problems.
            //useHTML: true,
            padding: 0,
            pointFormat: '<b>{point.y}</b> ' + valueSuffix + '<br><i>(Click to Map)</i>',
            positioner: function () {
                return { x: 80, y: 0 };
            }
        },

        legend: {
            itemStyle:{
                        fontWeight:'normal',
                        fontSize:'10px',
                      },
        },
        series: [{
        name: 'PRISM',
        //allowPointSelect: true,
        color:'black',
        data: line5Values,
        cursor:'pointer',
        lineWidth : 0,
        marker : {
            enabled : true,
            radius : 3,
            states: {
                select: {
                    fillColor:'black',
                    lineColor:'#00FFFF',
                    lineWidth: 2,
                    radius:5,
                }
            }
        },
        layersToAdd:PRISM_LayersToAdd,
        point: {
            events: {
                click: function() {
                    var layerToAddName = this.series.userOptions.layersToAdd[this.x]; // onclick get the x index and use it to find the URL
                    swapImageOverlay(layerToAddName)
                    swapLegend(layerToAddName, null, climateVariable)
                    /* Explore options for keepting point selected when a new area is selected */
                    /*
                    selectedPoint=this.series.data.indexOf(this)
                    selectedPoint=$('#point_chart').highcharts().series[0].data.indexOf(this)
                    alert(selectedPoint)
                    */
                    }
                }
            }
        },{
            name: 'CanESM2',
            //allowPointSelect: true,
            color: '#DEB78B',
            data: line1Values,
            cursor:'pointer',
            lineWidth : 0,
                marker : {
                    enabled : true,
                    radius : 4,
                    states: {
                        select: {
                            fillColor: '#DEB78B',
                            lineColor:'#00FFFF',
                            lineWidth: 1,
                            radius:5,
                            shadow : true,
                        }
                    }
                },
            visible:true,
            layersToAdd:CanESM2_LayersToAdd,
            point: {
                events: {
                    click: function() {
                        var layerToAddName = this.series.userOptions.layersToAdd[this.x]; // onclick get the x index and use it to find the matching layer name
                        swapImageOverlay(layerToAddName)
                        swapLegend(layerToAddName, null, climateVariable)
                    }
                }
            }
        }, {
            name: 'CCSM4',
            //allowPointSelect: true,
            color: '#717573',
            data: line2Values,
            cursor:'pointer',
            lineWidth : 0,
                marker : {
                    enabled : true,
                    radius : 4,
                    states: {
                        select: {
                            fillColor: '#717573',
                            lineColor: '#00FFFF',
                            lineWidth: 1,
                            radius:5,
                            shadow : true,
                        }
                    }
                },
            visible:true,
                        layersToAdd:CCSM4_LayersToAdd,
            point: {
                events: {
                    click: function() {
                        var layerToAddName = this.series.userOptions.layersToAdd[this.x];
                        swapImageOverlay(layerToAddName)
                        swapLegend(layerToAddName, null, climateVariable)
                    }
                }
            }
        }, {
            name: 'MIROC5',
            //allowPointSelect: true,
            color: '#C6D2DF',
            data: line3Values,
            cursor:'pointer',
            lineWidth : 0,
                marker : {
                    enabled : true,
                    radius : 4,
                    states: {
                        select: {
                            fillColor: '#C6D2DF',
                            lineColor: '#00FFFF',
                            lineWidth: 1,
                            radius:5,
                            shadow : true,
                        }
                    }
                },
            visible:true,
                        layersToAdd:MIROC5_LayersToAdd,
            point: {
                events: {
                    click: function() {
                        var layerToAddName = this.series.userOptions.layersToAdd[this.x];
                        swapImageOverlay(layerToAddName)
                        swapLegend(layerToAddName, null, climateVariable)
                    }
                }
            }
        },  {
            name: 'Ensemble',
            //allowPointSelect: true,
            color:'red',
            data: line4Values,
            cursor:'pointer',
            lineWidth : 0,
                marker : {
                    enabled : true,
                    radius : 4,
                    states: {
                        select: {
                            fillColor:'red',
                            lineColor: '#00FFFF',
                            lineWidth: 1,
                            radius:5,
                            shadow : true,
                        }
                    }
                },
            layersToAdd:Ensemble_LayersToAdd,
            point: {
                    events: {
                        click: function() {
                            var layerToAddName = this.series.userOptions.layersToAdd[this.x]; // onclick get the x index and use it to find the URL
                            swapImageOverlay(layerToAddName)
                            swapLegend(layerToAddName, null, climateVariable)
                        }
                    }
                  }
        },
     ]

    });
});

}

