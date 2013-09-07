(function() {
  "use strict";

  $(function() {

    // We use an inline data source in the example, usually data would
    // be fetched from a server

    var series = {
      ping:           [],
      fps:            [],
      user_commands:  []
    };
    var totalPoints = 300;

    var getSeriePlotData = function(data) {
      var data2 = [];
      for (var i = 0; i < data.length; ++i) {
        data2.push([i, data[i]]);
      }
      return data2;
    };

    var getPlotData = function() {
      var res = [];
      for (var serie in series) {
        res.push({
          label: serie,
          data:  getSeriePlotData(series[serie])
        });
      }
      return res;
    };

    var plotPush = function(serie, y) {
      series[serie] = series[serie].slice(1);
      series[serie].push(y);
      // update other series:
      for (var _serie in series) {
        if (serie != _serie) {
          var lastY = series[_serie][totalPoints - 1];
          series[_serie] = series[_serie].slice(1);
          series[_serie].push(lastY);
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
          series[serie].push(0);
        }
      }
    };

    $('#show_debug_plot').change(function() {
      if ($('#show_debug_plot').is(':checked')) {
        $('#plot').show();
      } else {
        $('#plot').hide();
      }
    });

    initSeries();

    var plot = $.plot("#plot", getPlotData(), {
      series: {
        shadowSize: 0  // Drawing is faster without shadows
      },
      yaxis: {
        min: 0,
        max: 100
      },
      xaxis: {
        show: false
      },
      legend: { position: "nw" }
    });

    Karma.plotPush = plotPush;
  });
}());