(function() {
  "use strict";

  var ClockSync = function() {
    return this;
  };

  ClockSync.prototype.pong = function(data) {
    var original = data.original;
    var receive  = data.receive;
    var transmit = data.transmit;
    var returned = data.returned;

    var sending = receive - original;
    var receiving = returned - transmit;
    var roundtrip = sending + receiving;
    var oneway = roundtrip / 2;
    var difference = sending - oneway;

    // update clock only if this packet is the most recently sent
    if (typeof this.original === 'undefined' ||
      original > this.original) {
      this.original = original;
      this.roundtrip = roundtrip;
      this.difference = difference;
      if (typeof Karma.plotPush !== 'undefined') {
        Karma.plotPush('delta_time', this.difference % 100);
      }

      $('#ping').html('ping: ' + this.roundtrip + 'ms');
      if (typeof Karma.plotPush !== 'undefined') {
        Karma.plotPush('ping', this.roundtrip);
      }
    }
  };

  ClockSync.prototype.getServerTsForClientTs = function(clientTs) {
    if (typeof this.difference === 'undefined') {
      return null;
    }
    return clientTs + this.difference;
  };

  Karma.ClockSync = ClockSync;

}());