(function() {
  "use strict";

  var ClockSync = function() {
    return this;
  };

  ClockSync.prototype.pong = function(data) {
    var clientSent = data.clientSent;
    var clientReceived = data.clientReceived;
    var serverReceived  = data.serverReceived;
    var serverSent = data.serverSent;

    var sending = serverReceived - clientSent;
    var receiving = clientReceived - serverSent;
    var roundtrip = sending + receiving;
    var oneway = roundtrip / 2;
    var difference = sending - oneway;

    // update clock only if this packet is the most recently sent
    if (typeof this.original === 'undefined' ||
      clientSent > this.original) {
      this.original = clientSent;
      this.roundtrip = roundtrip;
      this.difference = difference;
      $('#ping').html('ping: ' + this.roundtrip + 'ms');
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