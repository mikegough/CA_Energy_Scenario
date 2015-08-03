function createBoxPlot(climateVariable, statistic, season) {

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

    //Get values to create the boxplots
    //boxPlotValues are defined below (outside the function).
    var boxPlotValues0=boxPlotValues["pm"+climateVariable+season+"t0"]
    var boxPlotValues1=boxPlotValues["c2"+climateVariable+season+"t1"]
    var boxPlotValues2=boxPlotValues["c2"+climateVariable+season+"t2"]
    var boxPlotValues3=boxPlotValues["c4"+climateVariable+season+"t1"]
    var boxPlotValues4=boxPlotValues["c4"+climateVariable+season+"t2"]
    var boxPlotValues5=boxPlotValues["m5"+climateVariable+season+"t1"]
    var boxPlotValues6=boxPlotValues["m5"+climateVariable+season+"t2"]
    var boxPlotValues7=boxPlotValues["ee"+climateVariable+season+"t1"]
    var boxPlotValues8=boxPlotValues["ee"+climateVariable+season+"t2"]

    //JSON keys (field names) take the form <modelAbbreviation>_<variablePrefix>__<timePeriod>_<statistic>
    CanESM2_LayersToAdd=['','c2'+climateVariable+season+'t1','c2'+climateVariable+season+'t2']
    CCSM4_LayersToAdd=['','c4'+climateVariable+season+'t1','c4'+climateVariable+season+'t2']
    MIROC5_LayersToAdd=['','m5'+climateVariable+season+'t1','m5'+climateVariable+season+'t2']
    Ensemble_LayersToAdd=['', 'ee'+climateVariable+season+'t1','ee'+climateVariable+season+'t2']
    PRISM_LayersToAdd=['pm'+climateVariable+season+'t0']

    var db_statistic="avg"

    //Scatter points

    var point0=resultsJSON["pm"+climateVariable+season+"t0"+"_"+db_statistic]
    var point1=resultsJSON["c2"+climateVariable+season+"t1"+"_"+db_statistic]
    var point2=resultsJSON["c4"+climateVariable+season+"t1"+"_"+db_statistic]
    var point3=resultsJSON["m5"+climateVariable+season+"t1"+"_"+db_statistic]
    var point4=resultsJSON["ee"+climateVariable+season+"t1"+"_"+db_statistic]
    var point5=resultsJSON["c2"+climateVariable+season+"t2"+"_"+db_statistic]
    var point6=resultsJSON["c4"+climateVariable+season+"t2"+"_"+db_statistic]
    var point7=resultsJSON["m5"+climateVariable+season+"t2"+"_"+db_statistic]
    var point8=resultsJSON["ee"+climateVariable+season+"t2"+"_"+db_statistic]

    climateVar = document.getElementById("variable_selection_form");
    selectedClimateVar= climateVar.options[climateVar.selectedIndex].text;

    $('#point_chart_description').html("<b>Description</b> The box plots above represent the range of values for " + selectedClimateVar + " for every year of the time period across the DRECP study area. <a onclick=\"changeSelectionForm('EnableForPointChart'); createChart(document.getElementById('variable_selection_form').value, document.getElementById('statistic_selection_form').value, document.getElementById('season_selection_form').value)\">Back to the point chart.</a>")

$(function () {
    $('#point_chart').highcharts({

        chart: {
            type: 'boxplot',
           // zoomType: 'xy',
            width: 477,
            height:328
        },
        plotOptions: {
            boxplot: {
                whiskerWidth: 3
            }
        },
        credits: {
                enabled: false
            },

        exporting: {
                enabled: false
            },
        title: {
            text: ''
        },
        states: {
            hover: { enabled: false}
        },

        legend: {
            enabled: false
        },

        xAxis: {
            categories: ['  Historical<br>(1971-2000)', '2016-2045', '2046-2075'],
        },

         tooltip: {
                 //useHTML causes hover over bug
                 useHTML: true,
                 hideDelay: 100,
                 formatter: function() {
                     var arrayOfSeries = this.series.chart.series;
                     //console.log(arrayOfSeries[5]);
                     //console.log(this.series.chart.series[this.series.data.indexOf( this.point )])
                     //console.log(this.series.index)
                     //console.log(this.point.x)
                     //console.log(this.series)
                     //Calculate the index of the corresponding blue mean point.
                     //console.log( Math.max(0, (this.point.x - 1)) * 4 + this.series.index)
                     //console.log(this.series.userOptions.layersToAdd[this.point.x])
                     //console.log(this)

                 return '' +
                     /*
                     '<span style="color:#00FFFF">"●" </span>' + this.series.index + '</span>' +
                     */
                     '<a href="#" title="Click to Map" onClick="swapImageOverlay(&quot;'+this.series.userOptions.layersToAdd[this.point.x]+'&quot;); swapLegend(&quot;'+this.series.userOptions.layersToAdd[this.point.x]+'&quot;,&quot;null&quot;,&quot;'+climateVariable+'&quot;);return false;">'+
                     '<b>'+ this.series.name +'</b><i>, '+ this.key.replace("<br>"," ") + '</i><br>' +
                     '</a>'+
                      '<b>Mean within the selected area: </b>' +
                      //Brutal
                      this.series.chart.series[5].processedYData[Math.max(0, (this.point.x - 1)) * 4  + this.series.index] + valueSuffix +   '<br>' +
                      '<b>Variability across the DRECP study area:</b><br>' +
                      'Maximum:' +  this.point.high.toFixed(1)+ valueSuffix + '<br/>' +
                      //'Upper quartile: {point.q3:.1f}<br/>' +
                      'Upper quartile:' + this.point.q3.toFixed(1) + valueSuffix + '<br/>' +
                      'Median:' + this.point.median.toFixed(1) + valueSuffix + '<br/>' +
                      'Lower quartile:' + this.point.q1.toFixed(1) + valueSuffix + '<br/>' +
                      'Minimum:' + this.point.low.toFixed(1) + valueSuffix + '<br/>'
                       //this.series.chart.series[5].data[0][0]
                       //chart.series[5].data[this.series.index][0]
                       //this.series.chart.series[4].processed&Data[this.point.index]
                       //$('#point_chart').highcharts().series[4].data
                       //selectedPoint=$('#point_chart').highcharts().series[0].data.indexOf(this)

                 }
               },
        yAxis: {
            title: {
                text: yAxisLabel
            },
            startOnTick:true,
            endOnTick:true,
            maxPadding:0,
            tickPixelInterval:50,
        },
            legend: {
            itemStyle:{
                        fontWeight:'normal',
                        fontSize:'10px'
                      },
        },
        series: [
            {
                name: 'PRISM',
                cursor:'pointer',
                groupPadding: 0,
                pointPlacement:.2,
                pointStart:0,
                pointEnd:0,
                //enableMouseTracking: false,
                color:'#040404',
                data: [
                    boxPlotValues0,
                ],
                tooltip: {
                    enabled: false,
                    headerFormat: '<em>{point.key}</em><br/>'
                },
                events: {
                    legendItemClick: function () {
                    return false; // <== Disable otherwise points won't align properly
                    }
                },
                layersToAdd:PRISM_LayersToAdd,
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
            {
                name: 'CanESM2',
                cursor:'pointer',
                groupPadding: 0,
                pointPlacement: -.1,
                pointStart:1,
                //enableMouseTracking: false,
                color:'#DEB78B',
                data: [
                    boxPlotValues1,
                    boxPlotValues2,
                ],
                tooltip: {
                    enabled: false,
                    headerFormat: '<em>{point.key}</em><br/>'
                },
                events: {
                    legendItemClick: function () {
                        return false; // <== Disable otherwise points won't align properly
                    }
                },
                layersToAdd:CanESM2_LayersToAdd,
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
            {
                name: 'CCSM4',
                cursor:'pointer',
                groupPadding: 0,
                pointPlacement: -.1,
                pointStart:1,
                //enableMouseTracking: false,
                color:'#717573',
                data: [
                    boxPlotValues3,
                    boxPlotValues4,
                ],
                tooltip: {
                    enabled: false,
                    headerFormat: '<em>{point.key}</em><br/>'
                },
                events: {
                    legendItemClick: function () {
                        return false; // <== Disable otherwise points won't align properly
                    }
                },
                layersToAdd:CCSM4_LayersToAdd,
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
            {
                name: 'MIROC5',
                cursor:'pointer',
                groupPadding: 0,
                pointPlacement: -.1,
                pointStart:1,
                //enableMouseTracking: false,
                color:'#C6D2DF',
                data: [
                    boxPlotValues5,
                    boxPlotValues6,
                ],
                tooltip: {
                    enabled: false,
                    headerFormat: '<em>{point.key}</em><br/>'
                },
                events: {
                    legendItemClick: function () {
                        return false; // <== Disable otherwise points won't align properly
                    }
                },
                layersToAdd:MIROC5_LayersToAdd,
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

            {
                name: 'Ensemble',
                cursor:'pointer',
                groupPadding: 0,
                pointPlacement: -.1,
                pointStart:1,
                //enableMouseTracking: false,
                color:'#FF0000',
                data: [
                    boxPlotValues7,
                    boxPlotValues8,
                ],
                tooltip: {
                    enabled: false,
                    headerFormat: '<em>{point.key}</em><br/>'
                },
                events: {
                    legendItemClick: function () {
                        return false; // <== Disable otherwise points won't align properly
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
            {
                name: 'Mean within the selected area',
                groupPadding: 0,
                //color: Highcharts.getOptions().colors[0],
                color: '#00FFFF',
                type: 'scatter',
                data: [ // x, y positions where 0 is the first category
                    [-.20, point0],

                    [.7, point1],
                    [.9, point2],
                    [1.1, point3],
                    [1.3, point4],

                    [1.7, point5],
                    [1.9, point6],
                    [2.1, point7],
                    [2.3, point8]
                ],
                marker: {
                    fillColor: '#00FFFF',
                    lineWidth: 2,
                    //lineColor: Highcharts.getOptions().colors[0]
                    lineColor: '#444444'
                },
                tooltip: {
                    enabled:true,
                    pointFormat: 'Mean: {point.y}',
                    snap:100
                }
            }
        ]

    });
});

}
    //All values used to make the box plots
    var boxPlotValues ={};
    boxPlotValues["c2pets0t1"]=[982.3286743,1649.724915,1740.005676,1855.710327,2094.773682]
    boxPlotValues["c4pets0t1"]=[975.3766479,1619.777588,1710.222473,1823.712646,2065.313232]
    boxPlotValues["eepets0t1"]=[1011.03595,1633.336914,1722.591187,1840.531555,2072.304688]
    boxPlotValues["m5pets0t1"]=[992.4642334,1630.05658,1719.718689,1833.983887,2087.379395]
    boxPlotValues["c2pets2t1"]=[121.9322662,187.6206436,198.2291718,209.8791199,238.3086853]
    boxPlotValues["c4pets2t1"]=[118.4062119,184.5895081,195.6879425,206.9344864,238.4971161]
    boxPlotValues["eepets2t1"]=[129.7837067,186.3731689,196.8131027,208.2722855,233.9637909]
    boxPlotValues["m5pets2t1"]=[126.6195908,186.5298309,196.9392776,208.2344742,235.6319427]
    boxPlotValues["c2pets3t1"]=[148.0736084,207.4064026,217.2719116,227.8351746,255.1434326]
    boxPlotValues["c4pets3t1"]=[145.7978973,203.2739716,212.3934479,222.7186127,247.3884125]
    boxPlotValues["eepets3t1"]=[148.5549011,204.9770508,214.4327545,224.9004364,250.232666]
    boxPlotValues["m5pets3t1"]=[145.6172333,204.0308838,213.8307037,223.9770508,250.4481812]
    boxPlotValues["c2pets1t1"]=[0,78.71004868,84.68050003,92.32202148,121.0650482]
    boxPlotValues["c4pets1t1"]=[0,78.07398987,84.25935364,91.99679184,121.9586639]
    boxPlotValues["eepets1t1"]=[0,78.15007019,83.6776886,91.67153931,117.3582764]
    boxPlotValues["m5pets1t1"]=[9.784442902,76.91931915,82.58864212,90.55743408,117.4393539]
    boxPlotValues["c2pets4t1"]=[29.23373413,75.04340363,80.40602112,87.99876404,118.5039597]
    boxPlotValues["c4pets4t1"]=[27.72043419,72.95448303,78.29405594,85.64959717,117.2667236]
    boxPlotValues["eepets4t1"]=[30.40155029,74.50809479,79.62134933,87.1691246,114.2223434]
    boxPlotValues["m5pets4t1"]=[29.09079361,75.04878998,80.51639175,87.74686432,119.1165771]
    boxPlotValues["c2pets0t2"]=[1134.371094,1720.011353,1812.655518,1927.06543,2211.337646]
    boxPlotValues["c4pets0t2"]=[1073.34436,1676.496948,1767.170349,1875.978027,2129.000488]
    boxPlotValues["eepets0t2"]=[1110.631226,1695.40332,1785.508972,1899.155701,2148.99292]
    boxPlotValues["m5pets0t2"]=[1063.832153,1687.421875,1778.645874,1887.114807,2167.299316]
    boxPlotValues["c2pets2t2"]=[135.2149506,193.8621979,204.7441711,216.03125,243.1797333]
    boxPlotValues["c4pets2t2"]=[127.7084656,189.5013275,200.3076172,210.8337402,243.7327576]
    boxPlotValues["eepets2t2"]=[132.4977417,191.9888763,202.530365,213.4648895,240.5350952]
    boxPlotValues["m5pets2t2"]=[131.07164,192.2930069,203.1230774,213.3277435,245.149704]
    boxPlotValues["c2pets3t2"]=[157.3065643,217.1855469,226.8088379,237.0745392,260.2729187]
    boxPlotValues["c4pets3t2"]=[149.1615295,210.6709442,220.0275116,229.6423187,256.6932983]
    boxPlotValues["eepets3t2"]=[154.3532867,213.0795898,222.3786621,232.2953033,256.6362305]
    boxPlotValues["m5pets3t2"]=[148.6182556,211.1224289,220.6498718,230.2555084,259.7859497]
    boxPlotValues["c2pets1t2"]=[39.54454041,83.62747574,89.52584076,97.41646576,128.0534058]
    boxPlotValues["c4pets1t2"]=[16.03424454,80.13031006,86.82647705,94.59513855,128.1945496]
    boxPlotValues["eepets1t2"]=[37.4681015,81.70087051,87.29970551,95.38130188,123.4972458]
    boxPlotValues["m5pets1t2"]=[22.08016586,80.17552948,86.17147064,94.23008728,123.2199097]
    boxPlotValues["c2pets4t2"]=[35.41599274,78.13567352,83.56122971,91.14463043,122.9730682]
    boxPlotValues["c4pets4t2"]=[30.99348068,77.0632019,82.57730865,89.84418488,123.7061768]
    boxPlotValues["eepets4t2"]=[37.68801117,77.79403305,83.09395981,90.63999176,121.3869476]
    boxPlotValues["m5pets4t2"]=[34.57027054,77.89133835,83.4023819,90.85253525,122.8522644]
    boxPlotValues["pmpets0t0"]=[919.3428345,1553.333069,1640.823914,1758.937622,1997.417603]
    boxPlotValues["pmpets2t0"]=[99.47402191,177.9074478,188.7579727,199.776062,227.5612793]
    boxPlotValues["pmpets3t0"]=[137.8639526,194.8800507,204.1217651,215.0945129,237.7929382]
    boxPlotValues["pmpets1t0"]=[0,74.11779785,79.88232422,87.68006897,115.420311]
    boxPlotValues["pmpets4t0"]=[19.26449203,69.891716,75.19096375,82.33282471,112.222229]
    boxPlotValues["c2precs0t1"]=[9.176733017,84.06212616,124.1744003,181.8227158,1529.382568]
    boxPlotValues["c4precs0t1"]=[8.334242821,77.74707031,116.6881104,170.1359634,1463.537231]
    boxPlotValues["eeprecs0t1"]=[29.23648071,88.68479919,120.0199318,161.3015671,1064.75]
    boxPlotValues["m5precs0t1"]=[16.42319489,73.82027435,105.6108017,148.1269989,1680.567871]
    boxPlotValues["c2precs2t1"]=[0.002590747,0.662720621,1.626042187,3.687506795,95.0349884]
    boxPlotValues["c4precs2t1"]=[0.045016751,0.889129996,2.160776854,5.018498898,79.68574524]
    boxPlotValues["eeprecs2t1"]=[0.070709772,1.284155846,2.554162025,4.434696198,42.70664215]
    boxPlotValues["m5precs2t1"]=[0.000870301,0.590370536,1.652806282,3.733239651,78.29017639]
    boxPlotValues["c2precs3t1"]=[0.148744896,4.028732777,8.412893772,15.11792326,234.3163757]
    boxPlotValues["c4precs3t1"]=[0.060670897,4.554924011,8.39036417,15.14471722,108.1053925]
    boxPlotValues["eeprecs3t1"]=[0.424754083,5.893004417,9.295788288,13.72654009,86.27656555]
    boxPlotValues["m5precs3t1"]=[5.04E-05,3.514601469,6.824670792,12.4072032,95.32273865]
    boxPlotValues["c2precs1t1"]=[0.365875065,9.676124096,17.85393715,32.86434364,469.8251343]
    boxPlotValues["c4precs1t1"]=[0.047181875,4.914334297,13.79028702,28.17721367,390.5797119]
    boxPlotValues["eeprecs1t1"]=[1.554889679,11.10549831,17.5080719,26.74660683,247.9635315]
    boxPlotValues["m5precs1t1"]=[0.692132831,7.957550526,14.28912163,23.84570885,442.2115479]
    boxPlotValues["c2precs4t1"]=[0.052079521,3.701539755,7.09023881,12.17225409,139.3348236]
    boxPlotValues["c4precs4t1"]=[0.246738598,4.528528929,8.232754707,13.511024,156.2758179]
    boxPlotValues["eeprecs4t1"]=[0.615744472,5.932948828,8.141628742,11.50237513,97.72618103]
    boxPlotValues["m5precs4t1"]=[0.060741663,2.795211434,7.015568495,12.80465031,136.7648315]
    boxPlotValues["c2precs0t2"]=[19.62190819,114.4981079,173.2467728,250.0933838,2387.641357]
    boxPlotValues["c4precs0t2"]=[16.78916931,71.08797455,102.8994789,147.533905,1173.016846]
    boxPlotValues["eeprecs0t2"]=[30.31152534,96.29399109,125.6976089,165.2706757,1200.576904]
    boxPlotValues["m5precs0t2"]=[6.640848637,57.59819412,87.69250107,127.3185921,1249.800781]
    boxPlotValues["c2precs2t2"]=[8.57E-06,0.657541126,1.890511096,4.028133631,63.98809814]
    boxPlotValues["c4precs2t2"]=[0.001196185,0.665679604,1.743852794,4.019898653,77.25440216]
    boxPlotValues["eeprecs2t2"]=[0.005760531,0.840229839,1.799199462,3.307972193,31.11212921]
    boxPlotValues["m5precs2t2"]=[4.53E-08,0.223080344,0.588314384,1.506296992,33.89844894]
    boxPlotValues["c2precs3t2"]=[0.499056041,8.965730667,15.29044342,26.56671238,202.5489807]
    boxPlotValues["c4precs3t2"]=[0.051177122,3.414712071,6.560663462,12.46964407,123.0955429]
    boxPlotValues["eeprecs3t2"]=[0.523149967,6.870058537,10.76540995,16.44067192,88.72348022]
    boxPlotValues["m5precs3t2"]=[0.060788553,3.756963253,6.414166451,10.69996881,80.70313263]
    boxPlotValues["c2precs1t2"]=[1.798264503,10.82648563,21.13002014,39.50693321,569.5593262]
    boxPlotValues["c4precs1t2"]=[0.300973743,6.661449909,11.45852566,19.39067364,255.3378143]
    boxPlotValues["eeprecs1t2"]=[1.89566493,10.90873051,16.88305855,25.6407156,275.3848267]
    boxPlotValues["m5precs1t2"]=[0.493173659,6.096893787,11.780509,23.53456306,318.7626648]
    boxPlotValues["c2precs4t2"]=[0.165192515,5.012257814,9.373159885,17.278512,171.0615845]
    boxPlotValues["c4precs4t2"]=[0,3.762268543,8.418613434,17.35715294,244.493866]
    boxPlotValues["eeprecs4t2"]=[0.588303983,6.241448879,9.000771523,13.22352076,139.0634766]
    boxPlotValues["m5precs4t2"]=[0.020404857,1.700014472,5.526416302,9.740807056,134.2973938]
    boxPlotValues["pmprecs0t0"]=[0.24000001,79.53000641,125.5100021,183.5799866,1514.809937]
    boxPlotValues["pmprecs2t0"]=[0,0.903333366,2.5400002,5.31000042,73.37001038]
    boxPlotValues["pmprecs3t0"]=[0,3.103333473,6.896666527,14.33666611,107.2866745]
    boxPlotValues["pmprecs1t0"]=[0,6.646666527,15.6133337,32.27666855,435.6766968]
    boxPlotValues["pmprecs4t0"]=[0,2.613333464,7.976666927,15.82666683,154.2833405]
    boxPlotValues["c2tmaxs0t1"]=[12.26744556,26.74838829,29.03136635,31.6819973,36.63166046]
    boxPlotValues["c4tmaxs0t1"]=[12.19128704,26.04026031,28.37460709,31.05513668,37.12349319]
    boxPlotValues["eetmaxs0t1"]=[13.39774513,26.42659473,28.70136547,31.41270447,36.37652588]
    boxPlotValues["m5tmaxs0t1"]=[12.64574909,26.45750427,28.75196838,31.40803337,36.57574081]
    boxPlotValues["c2tmaxs2t1"]=[12.17011547,30.04161644,32.78109741,35.49488449,42.98871994]
    boxPlotValues["c4tmaxs2t1"]=[11.34505272,29.2250576,32.14622116,34.88779259,43.40502167]
    boxPlotValues["eetmaxs2t1"]=[14.76882744,29.79196835,32.51968575,35.21068573,41.78787231]
    boxPlotValues["m5tmaxs2t1"]=[13.73851585,29.93495274,32.65451622,35.34249878,42.42274094]
    boxPlotValues["c2tmaxs3t1"]=[22.90570068,37.27563477,39.6538353,42.03014374,49.37099457]
    boxPlotValues["c4tmaxs3t1"]=[22.3994751,36.56230927,38.85353851,41.17369843,47.99710083]
    boxPlotValues["eetmaxs3t1"]=[22.92520714,36.87069321,39.20718002,41.56761932,48.42671967]
    boxPlotValues["m5tmaxs3t1"]=[21.98871994,36.74735641,39.12707138,41.42770958,49.41838837]
    boxPlotValues["c2tmaxs1t1"]=[2.250854492,17.81061935,20.32461548,22.96723557,30.03902245]
    boxPlotValues["c4tmaxs1t1"]=[2.954803467,17.58156395,20.0862484,22.81078148,30.50684738]
    boxPlotValues["eetmaxs1t1"]=[3.670634031,17.70864773,19.90870857,22.65500259,28.18853378]
    boxPlotValues["m5tmaxs1t1"]=[3.15145874,17.26734543,19.55991173,22.33268833,28.83744431]
    boxPlotValues["c2tmaxs4t1"]=[6.731008053,21.4211731,23.56415939,26.2095089,31.6560173]
    boxPlotValues["c4tmaxs4t1"]=[6.152628899,20.47848511,22.65013695,25.22307396,30.49853516]
    boxPlotValues["eetmaxs4t1"]=[8.518866539,21.28652954,23.23503113,25.90222359,29.9703064]
    boxPlotValues["m5tmaxs4t1"]=[7.67678833,21.59040928,23.8704834,26.36205578,32.01561737]
    boxPlotValues["c2tmaxs0t2"]=[14.82461071,28.21541691,30.54631042,33.24274445,38.4070549]
    boxPlotValues["c4tmaxs0t2"]=[13.59845734,27.46214962,29.75841522,32.35063553,37.60867691]
    boxPlotValues["eetmaxs0t2"]=[14.50900555,27.88361645,30.16769791,32.82221031,37.6885643]
    boxPlotValues["m5tmaxs0t2"]=[13.54098511,27.90302181,30.2308979,32.78158188,38.49481583]
    boxPlotValues["c2tmaxs2t2"]=[15.58388329,31.38938522,34.16646004,36.80041504,44.16659546]
    boxPlotValues["c4tmaxs2t2"]=[13.4070034,30.44695091,33.24114609,35.88808441,43.77764893]
    boxPlotValues["eetmaxs2t2"]=[15.49783611,31.05038548,33.83114243,36.45479965,43.24739075]
    boxPlotValues["m5tmaxs2t2"]=[14.78037548,31.37443161,34.1117363,36.57581711,45.14815521]
    boxPlotValues["c2tmaxs3t2"]=[24.65935326,39.06625366,41.36348152,43.72789192,50.3580246]
    boxPlotValues["c4tmaxs3t2"]=[23.35961914,38.24077606,40.59731293,42.73688889,50.34734344]
    boxPlotValues["eetmaxs3t2"]=[24.56950188,38.56196213,40.85506821,43.11041069,50.06731796]
    boxPlotValues["m5tmaxs3t2"]=[23.55862427,38.30199432,40.62761688,42.79653168,50.91136932]
    boxPlotValues["c2tmaxs1t2"]=[4.97688818,19.64199829,21.97703171,24.65930176,30.46435547]
    boxPlotValues["c4tmaxs1t2"]=[2.090240479,18.43179321,21.07085705,23.77000999,31.33078003]
    boxPlotValues["eetmaxs1t2"]=[5.39944458,19.10228348,21.30669975,24.0559454,29.4389801]
    boxPlotValues["m5tmaxs1t2"]=[4.25101757,18.78270531,21.1792717,23.91462803,30.31426048]
    boxPlotValues["c2tmaxs4t2"]=[9.51830101,22.68809128,24.84814453,27.50323486,33.2485466]
    boxPlotValues["c4tmaxs4t2"]=[7.985087395,22.15837669,24.44416428,26.94028854,32.75734711]
    boxPlotValues["eetmaxs4t2"]=[10.27747917,22.70957947,24.71935177,27.32384109,32.34442902]
    boxPlotValues["m5tmaxs4t2"]=[9.331594467,22.93261242,25.09868908,27.63328171,33.78985596]
    boxPlotValues["pmtmaxs0t0"]=[11.08749962,24.52666664,26.78166771,29.48166656,34.28750229]
    boxPlotValues["pmtmaxs2t0"]=[10.51333427,27.94666672,30.67333603,33.35333252,40.84000397]
    boxPlotValues["pmtmaxs3t0"]=[20.37333488,34.7100029,37.04000092,39.50333405,46.1866684]
    boxPlotValues["pmtmaxs1t0"]=[0.280000031,16.01333427,18.37333488,21.06999969,26.89666748]
    boxPlotValues["pmtmaxs4t0"]=[5.640000343,19.10000134,21.29666901,23.82333374,29.65999985]
    boxPlotValues["c2tmins0t1"]=[0.538261414,11.44490814,13.55845022,16.31974602,21.62408447]
    boxPlotValues["c4tmins0t1"]=[0.238924667,10.82439709,12.89321423,15.56934357,20.93839073]
    boxPlotValues["eetmins0t1"]=[0.609591961,11.05887747,13.13406658,15.8878088,20.96749496]
    boxPlotValues["m5tmins0t1"]=[-0.001574198,10.92054844,12.98733044,15.71951294,21.05459595]
    boxPlotValues["c2tmins2t1"]=[0.530476928,13.62068748,15.9633894,19.03996849,25.84797287]
    boxPlotValues["c4tmins2t1"]=[-0.551717162,13.11928368,15.51002026,18.37860107,25.77218628]
    boxPlotValues["eetmins2t1"]=[1.089636922,13.36402941,15.61091137,18.62694359,24.98886871]
    boxPlotValues["m5tmins2t1"]=[0.628133178,13.23991442,15.5152998,18.45697021,25.07896042]
    boxPlotValues["c2tmins3t1"]=[7.469014645,21.03131104,23.71877098,26.91424561,33.75427246]
    boxPlotValues["c4tmins3t1"]=[6.524780273,19.95117188,22.35367966,25.4699707,31.84767723]
    boxPlotValues["eetmins3t1"]=[7.662936687,20.38734913,22.88378906,26.08971882,32.62760544]
    boxPlotValues["m5tmins3t1"]=[7.141825676,20.11884117,22.6559,25.79627037,32.61251831]
    boxPlotValues["c2tmins1t1"]=[-5.703989983,4.215759277,5.996907711,8.170593262,14.32377148]
    boxPlotValues["c4tmins1t1"]=[-6.509989738,4.063374996,5.95501709,8.08849144,14.65574169]
    boxPlotValues["eetmins1t1"]=[-5.664140224,3.941777587,5.741160393,8.034234524,13.90612602]
    boxPlotValues["m5tmins1t1"]=[-7.082652092,3.520172119,5.414352655,7.644002438,14.03573608]
    boxPlotValues["c2tmins4t1"]=[-3.019612789,6.72789526,8.727163315,11.10779858,18.67105103]
    boxPlotValues["c4tmins4t1"]=[-3.93979907,6.025228024,7.992523193,10.33636475,19.44920921]
    boxPlotValues["eetmins4t1"]=[-2.868879795,6.483269691,8.375805378,10.81889582,17.27336121]
    boxPlotValues["m5tmins4t1"]=[-3.528269529,6.592198849,8.606908321,10.94075584,18.23324585]
    boxPlotValues["c2tmins0t2"]=[2.42868042,13.25023508,15.37531757,18.10066795,24.06334496]
    boxPlotValues["c4tmins0t2"]=[0.657129943,12.08304453,14.17495871,16.72786808,22.3856411]
    boxPlotValues["eetmins0t2"]=[1.846249938,12.49884176,14.58346367,17.26747799,22.60613823]
    boxPlotValues["m5tmins0t2"]=[0.909927368,12.14251328,14.23087692,16.86991787,22.93980408]
    boxPlotValues["c2tmins2t2"]=[2.593658447,14.967906,17.35801315,20.43098545,26.93198776]
    boxPlotValues["c4tmins2t2"]=[1.07430017,14.00104809,16.3838501,19.10422897,27.36543846]
    boxPlotValues["eetmins2t2"]=[1.792538166,14.48115444,16.76284122,19.69072628,26.34654236]
    boxPlotValues["m5tmins2t2"]=[1.454376221,14.29498291,16.66757202,19.48063278,26.67254639]
    boxPlotValues["c2tmins3t2"]=[9.9324646,23.69865036,26.349823,29.50017357,36.2149353]
    boxPlotValues["c4tmins3t2"]=[7.539021969,21.61899948,24.08079624,27.03179932,33.80815887]
    boxPlotValues["eetmins3t2"]=[9.080834389,22.41399097,24.90156746,27.97578239,34.00365448]
    boxPlotValues["m5tmins3t2"]=[7.437612057,21.84141159,24.37984276,27.3586731,34.70866013]
    boxPlotValues["c2tmins1t2"]=[-4.062286377,5.961283684,7.800974846,10.12850952,17.30650902]
    boxPlotValues["c4tmins1t2"]=[-7.673980713,4.769200802,6.742767334,8.938288689,16.45870972]
    boxPlotValues["eetmins1t2"]=[-4.592397213,5.117987871,6.953155518,9.239778042,15.62940216]
    boxPlotValues["m5tmins1t2"]=[-5.99263525,4.513133049,6.42824316,8.644114494,15.33708763]
    boxPlotValues["c2tmins4t2"]=[-1.601257324,8.171569824,10.12322998,12.49017859,20.03549194]
    boxPlotValues["c4tmins4t2"]=[-2.160552979,7.717010498,9.728139877,12.03942871,20.34288597]
    boxPlotValues["eetmins4t2"]=[-1.65431726,7.869946003,9.819416046,12.16201782,19.73732567]
    boxPlotValues["m5tmins4t2"]=[-1.780924559,7.675018311,9.703140736,11.97588634,19.5789299]
    boxPlotValues["pmtmins0t0"]=[-1.578333378,9.274167061,11.31166649,14.06999969,19.55833244]
    boxPlotValues["pmtmins2t0"]=[-1.399999976,11.59333324,14.01000023,16.82999992,23.7100029]
    boxPlotValues["pmtmins3t0"]=[5.106666565,17.96333313,20.37333298,23.64333344,30.61333466]
    boxPlotValues["pmtmins1t0"]=[-8.606666565,2.660000086,4.510000229,6.690000057,13.53000069]
    boxPlotValues["pmtmins4t0"]=[-5.31666708,4.680000305,6.633333206,9,16.62666702]
