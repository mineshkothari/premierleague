queue()
    .defer(d3.json, "/premierleague/team/MANCHESTER%20CITY")
    .await(makeGraphs);

function makeGraphs(error, premierleagueData) {
    if (error) {
        console.error("makeGraphs error on receiving dataset:", error.statusText);
        throw error;
    }

    var ndx = crossfilter(premierleagueData);

    var yearDim = ndx.dimension(function (d) {
        return new Date(d["year"], 0, 1);
    });

    var positionDimManCity = ndx.dimension(function (d) {
        if (d["team"] == "MANCHESTER CITY") {
            return d["position"];
        } else {
            return false;
        }
    });

    var positionGroupManCity = positionDimManCity.group().reduceCount();

    var yAxis = d3.svg.axis()
        .scale(d3.scale.linear())
        .orient("left")
        .ticks(20);

    //DATE VALUES USED IN CHARTS
    var minYear = new Date(yearDim.bottom(1)[0]["year"], 0,1);
    var maxYear = new Date(yearDim.top(1)[0]["year"], 0,1);
    var minYearBoundary = new Date(yearDim.bottom(1)[0]["year"]-1, 0,1);
    var maxYearBoundary = new Date(yearDim.top(1)[0]["year"]+1, 0,1);

    // GROUPS
    var manCityPointsByYear = createGroup(yearDim, "MANCHESTER CITY", "points");
    var manCityGoalsByYear = createGroup(yearDim, "MANCHESTER CITY", "goals_for");
    var manCityGoalsConcByYear = createGroup(yearDim, "MANCHESTER CITY", "goals_against");
    var manCityGoalDifference = createGroup(yearDim, "MANCHESTER CITY", "goal_difference");
    var manCityWins = createGroup(yearDim, "MANCHESTER CITY", "won");
    var manCityDrawn = createGroup(yearDim, "MANCHESTER CITY", "drawn");
    var manCityLosses = createGroup(yearDim, "MANCHESTER CITY", "lost");

    // CHARTS
    var positionSelectorManCity = dc.pieChart("#positionSelectorManCity");
    var yearSelectorManCity = dc.barChart("#yearSelectorManCity");
    var goalsChartManCity = dc.barChart("#goalsChartManCity");
    var goalsConcChartManCity = dc.barChart("#goalsConcChartManCity");
    var goalDifferenceChartManCity = dc.barChart("#goalDifferenceChartManCity");
    var formGuideManCity = dc.lineChart("#formGuideManCity");

    // CHART PROPERTIES
    positionSelectorManCity
        .dimension(positionDimManCity)
        .group(positionGroupManCity)
        .width(250)
        .height(250)
        // .legend(dc.legend().x(0)
        //                    .y(220)
        //                    .itemHeight(15)
        //                    .gap(0)
        //                    .horizontal(true)
        //                    .itemWidth(30))
        .minAngleForLabel(2)
        .title(function(d) {
            return 'Position ' + d.key + ': ' + d.value;
        })
        .radius(90)
        .innerRadius(40);

    yearSelectorManCity
        .dimension(yearDim)
        .group(manCityPointsByYear)
        .width($(this).parent().width())
        .height(250)
        .margins({top: 50, right: 35, bottom: 50, left: 35})
        .xUnits(function(){return 19;}) // SET BAR WIDTH
        .centerBar(true)
        .barPadding(0.25) // SET PADDING BETWEEN BARS
        .xAxisLabel("Year")
        .yAxisLabel("Points")
        .x(d3.time.scale().domain([minYearBoundary, maxYearBoundary]))
        .y(d3.scale.linear().domain([30, 100]));

    formGuideManCity
        .dimension(yearDim)
        .width($(this).parent().width())
        .margins({top: 50, right: 60, bottom: 50, left: 35})
        .height(300)
        .group(manCityWins, "Wins")
        .stack(manCityDrawn, "Draws")
        .stack(manCityLosses, "Losses")
        .brushOn(false)
        .renderArea(true)
        .rangeChart(yearSelectorManCity)
        .x(d3.time.scale().domain([minYear, maxYearBoundary]))
        .y(d3.scale.linear().domain([0, 40]))
        .legend(dc.legend().x($('#formGuideManCity').width()-65)
                           .y(58)
                           .itemHeight(13)
                           .gap(5))
        .title(function(d) {
            return d.key.getFullYear() + ': ' + d.value;
        })
        .xAxisLabel("Year")
        .yAxisLabel("Total");

    goalsChartManCity
        .dimension(yearDim)
        .group(manCityGoalsByYear)
        .width($(this).parent().width())
        .height(250)
        .margins({top: 25, right: 35, bottom: 50, left: 35})
        .brushOn(false)
        .xUnits(function(){return 19;}) // SET BAR WIDTH
        .centerBar(true)
        .barPadding(0.25) // SET PADDING BETWEEN BARS
        .rangeChart(formGuideManCity)
        .x(d3.time.scale().domain([minYearBoundary, maxYearBoundary]))
        .y(d3.scale.linear().domain([20, 110]))
        .title(function(d) {
            return d.key.getFullYear() + ': ' + d.value;
        })
        .yAxisLabel("Scored")
        .xAxisLabel("Year");

    goalsConcChartManCity
        .dimension(yearDim)
        .group(manCityGoalsConcByYear)
        .width($(this).parent().width())
        .height(250)
        .margins({top: 25, right: 35, bottom: 50, left: 35})
        .brushOn(false)
        .xUnits(function(){return 19;}) // SET BAR WIDTH
        .centerBar(true)
        .barPadding(0.25) // SET PADDING BETWEEN BARS
        .rangeChart(goalsChartManCity)
        .x(d3.time.scale().domain([minYearBoundary, maxYearBoundary]))
        .y(d3.scale.linear().domain([15, 70]))
        .title(function(d) {
            return d.key.getFullYear() + ': ' + d.value;
        })
        .yAxisLabel("Conceded")
        .xAxisLabel("Year");

    goalDifferenceChartManCity
        .dimension(yearDim)
        .group(manCityGoalDifference)
        .width($(this).parent().width())
        .height(250)
        .margins({top: 25, right: 35, bottom: 50, left: 35})
        .brushOn(false)
        .xUnits(function(){return 19;}) // SET BAR WIDTH
        .centerBar(true)
        .barPadding(0.25) // SET PADDING BETWEEN BARS
        .rangeChart(goalsConcChartManCity)
        .x(d3.time.scale().domain([minYearBoundary, maxYearBoundary]))
        .y(d3.scale.linear().domain([-30, 90]))
        .title(function(d) {
            return d.key.getFullYear() + ': ' + d.value;
        })
        .yAxisLabel("Goal Difference")
        .xAxisLabel("Year");

    dc.renderAll();

    $("#goalDifferenceChartManCity .axis.x").attr("transform", "translate(47, 147)");

    $(window).resize(function() {
        yearSelectorManCity
            .width($(this).parent().width());
        formGuideManCity
            .legend(dc.legend().x($('#formGuideManCity').width()-65)
                       .y(58)
                       .itemHeight(13)
                       .gap(5));
        dc.renderAll();
        $("#goalDifferenceChartManCity .axis.x").attr("transform", "translate(47, 147)");
    });
}
