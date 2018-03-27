queue()
    .defer(d3.json, "/premierleague/data")
    .await(makeGraphs);

function makeGraphs(error, premierleagueData) {
    if (error) {
        console.error("makeGraphs error on receiving dataset:", error.statusText);
        throw error;
    }

    var ndx = crossfilter(premierleagueData);

    var teamDim = ndx.dimension(function (d) {
        return d["team"];
    });

    var teamAbbrDim = ndx.dimension(function (d) {
        return {
            "MANCHESTER UNITED": "MU",
            "MANCHESTER CITY": "MC",
            "CHELSEA": "CH",
            "ARSENAL": "AR",
            "TOTTENHAM HOTSPUR": "TH",
            "LIVERPOOL": "LI"
        }[d["team"]];
    });

    var yearDim = ndx.dimension(function (d) {
        return new Date(d["year"], 0, 1);
    });

    // CALCULATE METRICS
    var groupYear = yearDim.group();
    var totalTeamsGroup = teamAbbrDim.group().reduceCount();

    // TEAM POINTS BY YEAR
    var manUnitedPointsByYear = createGroup(yearDim, "MANCHESTER UNITED", "points");
    var manCityPointsByYear = createGroup(yearDim, "MANCHESTER CITY", "points");
    var chelseaPointsByYear = createGroup(yearDim, "CHELSEA", "points");
    var arsenalPointsByYear = createGroup(yearDim, "ARSENAL", "points");
    var spursPointsByYear = createGroup(yearDim, "TOTTENHAM HOTSPUR", "points");
    var liverpoolPointsByYear = createGroup(yearDim, "LIVERPOOL", "points");

    // TEAM POSITION BY YEAR
    var manUnitedPositionByYear = createGroup(yearDim, "MANCHESTER UNITED", "position");
    var manCityPositionByYear = createGroup(yearDim, "MANCHESTER CITY", "position");
    var chelseaPositionByYear = createGroup(yearDim, "CHELSEA", "position");
    var arsenalPositionByYear = createGroup(yearDim, "ARSENAL", "position");
    var spursPositionByYear = createGroup(yearDim, "TOTTENHAM HOTSPUR", "position");
    var liverpoolPositionByYear = createGroup(yearDim, "LIVERPOOL", "position");

    //DATE VALUES USED IN CHARTS
    var minYear = new Date(yearDim.bottom(1)[0]["year"], 0,1);
    var maxYear = new Date(yearDim.top(1)[0]["year"], 0,1);
    var minYearBoundary = new Date(yearDim.bottom(1)[0]["year"]-1, 0,1);
    var maxYearBoundary = new Date(yearDim.top(1)[0]["year"]+1, 0,1);

    // CHARTS
    var teamSelector = dc.pieChart("#teamSelector");
    var yearSelector = dc.barChart("#yearSelector");
    var pointsChart = dc.compositeChart("#pointsChart");
    var positionChart = dc.compositeChart("#positionChart");

    // AXIS SCALES
    var yAxisScale = d3.scale.linear();

    var yAxis = d3.svg.axis()
        .scale(yAxisScale)
        .orient("left")
        .ticks(20);

    // CHART PROPERTIES
    teamSelector
        .dimension(teamAbbrDim)
        .group(totalTeamsGroup)
        .ordinalColors(['#f8d33a','#0f2c56','#007430','#83b4dd','#ed2d3a','#431c77'])
        .width(250)
        .height(250)
        .minAngleForLabel(2)
        .radius(90)
        .innerRadius(40);

    yearSelector
        .dimension(yearDim)
        .group(groupYear)
        .width($(this).parent().parent().width())
        .height(150)
        //.centerBar(true)
        //.gap(10)
        .x(d3.time.scale().domain([minYearBoundary, maxYearBoundary]));
        //.alwaysUseRounding(true);

    pointsChart
        .dimension(yearDim)
        //.width($(window).width()*0.9)
        .width($(this).parent().parent().width())
        .height(500)
        .margins({top: 30, right: 50, bottom: 50, left: 50})
        .compose([
            dc.lineChart(pointsChart)
                .colors("#ed2d3a")
                .group(manUnitedPointsByYear, "Man United"),
            dc.lineChart(pointsChart)
                .colors('#83b4dd')
                .group(manCityPointsByYear, "Man City"),
            dc.lineChart(pointsChart)
                .colors('#0f2c56')
                .group(chelseaPointsByYear, "Chelsea"),
           dc.lineChart(pointsChart)
                .colors('#f8d33a')
                .group(arsenalPointsByYear, "Arsenal"),
           dc.lineChart(pointsChart)
                .colors('#431c77')
                .group(spursPointsByYear, "Spurs"),
           dc.lineChart(pointsChart)
                .colors('#007430')
                .group(liverpoolPointsByYear, "Liverpool")
        ])
        .x(d3.time.scale().domain([minYear, maxYear]))
        .elasticY(true)
        .brushOn(false)
        .xAxisLabel("Year")
        .yAxisLabel("Points")
        .rangeChart(yearSelector)
        //.legend(dc.legend().x($(this).parent().parent().width()*0.80)) testing
        //.legend(dc.legend().x(780).y(300).itemHeight(15).gap(5))
        .yAxis().ticks(10);

    positionChart
        .dimension(yearDim)
        //.width($(window).width()*0.9)
        .width($(this).parent().parent().width())
        .height(500)
        .compose([
            dc.lineChart(positionChart)
                .colors('#ed2d3a')
                .group(manUnitedPositionByYear, "Man Utd"),
            dc.lineChart(positionChart)
                .colors('#83b4dd')
                .group(manCityPositionByYear, "Man City"),
            dc.lineChart(positionChart)
                .colors('#0f2c56')
                .group(chelseaPositionByYear, "Chelsea"),
            dc.lineChart(positionChart)
                .colors('#f8d33a')
                .group(arsenalPositionByYear, "Arsenal"),
            dc.lineChart(positionChart)
                .colors('#431c77')
                .group(spursPositionByYear, "Spurs"),
            dc.lineChart(positionChart)
                .colors('#007430')
                .group(liverpoolPositionByYear, "Liverpool")
        ])
        .x(d3.time.scale().domain([minYear, maxYear]))
        .elasticY(true)
        .xAxisLabel("Year")
        .yAxisLabel("Position")
        .brushOn(false)
        .rangeChart(pointsChart)
        //.legend(dc.legend().x($(window).width()*0.7).y(10).itemHeight(15).gap(5))
        //.y(d3.scale.linear().domain([1, 20]));
        .yAxis(yAxis);

    dc.renderAll();

    $(window).resize(function() {
        positionChart
            .width($(this).parent().parent().width());
            //.legend(dc.legend().x($(window).width()*0.7).y(10).itemHeight(15).gap(5));
        dc.renderAll();
    });
}
