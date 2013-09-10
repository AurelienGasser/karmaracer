(function() {
  "use strict";

  // settings
  var display = ['delta', 'ack', 'delta_time'];
  var totalPoints = 300;
  var series = {
    ping:           { yaxis: 1, data: [] },
    fps:            { yaxis: 1, data: [] },
    user_commands:  { yaxis: 2, data: [] },
    delta:          { yaxis: 3, data: [] },
    ack:            { yaxis: 4, data: [] },
    delta_time:     { yaxis: 5, data: [] }
  };
  var yaxes = [{
    min: 0, // 1
    max: 100
  }, {
    min: 0, // 2
    max: 30
  }, {
    min: 0, // 3
    max: 0.3
  }, {
    min: 0, // 4
    max: 100
  }, {
    min: 0, // 5
    max: 100
  }];
  // end settings

  var plot;

  var getSeriePlotData = function(data) {
    var data2 = [];
    for (var i = 0; i < data.length; ++i) {
      data2.push([i, data[i]]);
    }
    return data2;
  };

  var shouldDisplay = function(serie) {
    return display.indexOf(serie) != -1;
  };

  var getPlotData = function() {
    var res = [];
    for (var serie in series) {
      if (shouldDisplay(serie)) {
        res.push({
          yaxis: series[serie].yaxis,
          label: serie,
          data:  getSeriePlotData(series[serie].data)
        });
      }
    }
    return res;
  };

  var plotPush = function(serie, y) {
    series[serie].data = series[serie].data.slice(1);
    series[serie].data.push(y);
    // update other series
    for (var _serie in series) {
      if (serie != _serie) {
        var lastY = series[_serie].data[totalPoints - 1];
        series[_serie].data = series[_serie].data.slice(1);
        series[_serie].data.push(lastY);
      }
    }
    if ($('#show_debug_plot').is(':checked')) {
      plot.setData(getPlotData());
      plot.draw();
    }
  };

  var initSeries = function() {
    for (var serie in series) {
      for (var i = 0; i < totalPoints; ++i) {
        series[serie].data.push(0);
      }
    }
  };

  initSeries();

  $(function() {

    plot = $.plot("#plot", getPlotData(), {
      series: {
        shadowSize: 0  // Drawing is faster without shadows
      },
      yaxes: yaxes,
      xaxis: {
        show: false
      },
      legend: { position: "nw" }
    });

    $('#show_debug_plot').change(function() {
      if ($('#show_debug_plot').is(':checked')) {
        $('#plot').show();
      } else {
        $('#plot').hide();
      }
    });

    Karma.plotPush = plotPush;
  });
}());