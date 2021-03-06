queue()
    .defer(d3.json, "/premierleague/team/TOTTENHAM%20HOTSPUR")
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

    var positionDimSpurs = ndx.dimension(function (d) {
        if (d["team"] == "TOTTENHAM HOTSPUR") {
            return d["position"];
        } else {
            return false;
        }
    });

    var positionGroupSpurs = positionDimSpurs.group().reduceCount();

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
    var spursPointsByYear = createGroup(yearDim, "TOTTENHAM HOTSPUR", "points");
    var spursGoalsByYear = createGroup(yearDim, "TOTTENHAM HOTSPUR", "goals_for");
    var spursGoalsConcByYear = createGroup(yearDim, "TOTTENHAM HOTSPUR", "goals_against");
    var spursGoalDifference = createGroup(yearDim, "TOTTENHAM HOTSPUR", "goal_difference");
    var spursWins = createGroup(yearDim, "TOTTENHAM HOTSPUR", "won");
    var spursDrawn = createGroup(yearDim, "TOTTENHAM HOTSPUR", "drawn");
    var spursLosses = createGroup(yearDim, "TOTTENHAM HOTSPUR", "lost");

    // CHARTS
    var positionSelectorSpurs = dc.pieChart("#positionSelectorSpurs");
    var yearSelectorSpurs = dc.barChart("#yearSelectorSpurs");
    var goalsChartSpurs = dc.barChart("#goalsChartSpurs");
    var goalsConcChartSpurs = dc.barChart("#goalsConcChartSpurs");
    var goalDifferenceChartSpurs = dc.barChart("#goalDifferenceChartSpurs");
    var formGuideSpurs = dc.lineChart("#formGuideSpurs");

    // CHART PROPERTIES
    positionSelectorSpurs
        .dimension(positionDimSpurs)
        .group(positionGroupSpurs)
        .width(250)
        .height(250)
        // .legend(dc.legend().x(220)
        //                    .y(20)
        //                    .itemHeight(15)
        //                    .gap(3)
        //                    .horizontal(false)
        //                    .itemWidth(30))
        .minAngleForLabel(2)
        .title(function(d) {
            return 'Position ' + d.key + ': ' + d.value;
        })
        .radius(90)
        .innerRadius(40);

    yearSelectorSpurs
        .dimension(yearDim)
        .group(spursPointsByYear)
        .width($(this).parent().width())
        .height(250)
        .margins({top: 50, right: 35, bottom: 50, left: 35})
        .xUnits(function(){return 19;}) // SET BAR WIDTH
        .centerBar(true)
        .barPadding(0.25) // SET PADDING BETWEEN BARS
        .xAxisLabel("Year")
        .yAxisLabel("Points")
        .x(d3.time.scale().domain([minYearBoundary, maxYearBoundary]))
        .y(d3.scale.linear().domain([40, 90]));

    formGuideSpurs
        .dimension(yearDim)
        .width($(this).parent().width())
        .height(300)
        .margins({top: 50, right: 60, bottom: 50, left: 35})
        .group(spursWins, "Wins")
        .stack(spursDrawn, "Draws")
        .stack(spursLosses, "Losses")
        .brushOn(false)
        .renderArea(true)
        .rangeChart(yearSelectorSpurs)
        .x(d3.time.scale().domain([minYear, maxYearBoundary]))
        .y(d3.scale.linear().domain([0, 40]))
        .legend(dc.legend().x($('#formGuideSpurs').width()-65)
                           .y(58)
                           .itemHeight(13)
                           .gap(5))
        .title(function(d) {
            return d.key.getFullYear() + ': ' + d.value;
        })
        .xAxisLabel("Year")
        .yAxisLabel("Total");

    goalsChartSpurs
        .dimension(yearDim)
        .group(spursGoalsByYear)
        .width($(this).parent().width())
        .height(250)
        .margins({top: 25, right: 35, bottom: 50, left: 35})
        .brushOn(false)
        .xUnits(function(){return 19;}) // SET BAR WIDTH
        .centerBar(true)
        .barPadding(0.25) // SET PADDING BETWEEN BARS
        .rangeChart(formGuideSpurs)
        .x(d3.time.scale().domain([minYearBoundary, maxYearBoundary]))
        //.yAxis(yAxis);
        .y(d3.scale.linear().domain([30, 90]))
        .title(function(d) {
            return d.key.getFullYear() + ': ' + d.value;
        })
        .yAxisLabel("Scored")
        .xAxisLabel("Year");

    goalsConcChartSpurs
        .dimension(yearDim)
        .group(spursGoalsConcByYear)
        .width($(this).parent().width())
        .height(250)
        .margins({top: 25, right: 35, bottom: 50, left: 35})
        .brushOn(false)
        .xUnits(function(){return 19;}) // SET BAR WIDTH
        .centerBar(true)
        .barPadding(0.25) // SET PADDING BETWEEN BARS
        .rangeChart(goalsChartSpurs)
        .x(d3.time.scale().domain([minYearBoundary, maxYearBoundary]))
        .y(d3.scale.linear().domain([20, 70]))
        .title(function(d) {
            return d.key.getFullYear() + ': ' + d.value;
        })
        .yAxisLabel("Conceded")
        .xAxisLabel("Year");

    goalDifferenceChartSpurs
        .dimension(yearDim)
        .group(spursGoalDifference)
        .width($(this).parent().width())
        .height(250)
        .margins({top: 25, right: 35, bottom: 50, left: 35})
        .brushOn(false)
        .xUnits(function(){return 19;}) // SET BAR WIDTH
        .centerBar(true)
        .barPadding(0.25) // SET PADDING BETWEEN BARS
        .rangeChart(goalsConcChartSpurs)
        .x(d3.time.scale().domain([minYearBoundary, maxYearBoundary]))
        .y(d3.scale.linear().domain([-20, 70]))
        .title(function(d) {
            return d.key.getFullYear() + ': ' + d.value;
        })
        .yAxisLabel("Goal Difference")
        .xAxisLabel("Year");

    dc.renderAll();

    $("#goalDifferenceChartSpurs .axis.x").attr("transform", "translate(47.5, 152)");

    $(window).resize(function() {
        yearSelectorSpurs
            .width($(this).parent().width());
        formGuideSpurs
            .legend(dc.legend().x($('#formGuideSpurs').width()-65)
                       .y(58)
                       .itemHeight(13)
                       .gap(5));
        dc.renderAll();
        $("#goalDifferenceChartSpurs .axis.x").attr("transform", "translate(47, 152)");
    });
}
