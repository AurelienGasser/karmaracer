(function() {
  "use strict";

  $(function() {

    // We use an inline data source in the example, usually data would
    // be fetched from a server

    var series = {
      ping: [],
      fps:  []
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
      if (!$('#show_debug_plot').is(':checked')) {
        return;
      }
      plot.setData(getPlotData());
      plot.draw();
    };

    $('#show_debug_plot').change(function() {
      if ($('#show_debug_plot').is(':checked')) {
        $('#plot').show();
      } else {
        $('#plot').hide();
      }
    });

    var initSeries = function() {
      for (var serie in series) {
        for (var i = 0; i < totalPoints; ++i) {
          series[serie].push(0);
        }
      }
    };

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