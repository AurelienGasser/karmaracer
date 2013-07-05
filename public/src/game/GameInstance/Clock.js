(function() {
  "use strict";

  var Clock = function() {
    this.ping = undefined;
    this.serverTs = undefined;
    this.clientSentTs = undefined;
    this.clientReceivedTs = undefined;
    return this;
  }

  Clock.prototype.pong = function(data) {
    var clientSentTs      = data.clientSentTs;
    var clientReceivedTs  = data.clientReceivedTs;
    var serverReceivedTs  = data.serverReceivedTs;
    var ping = clientReceivedTs - clientSentTs;
    // update clock and ping only if this packet is the most recently sent
    if (typeof this.clientSentTs === 'undefined'
    || clientSentTs > this.clientSentTs) {
      this.ping = ping;
      // server time was this.serverTs when client time was this.clientReceivedTs
      this.serverTs = Math.floor(serverReceivedTs + this.ping / 2);
      this.clientReceivedTs = clientReceivedTs;
      this.clientSentTs = clientSentTs;
      $('#ping').html('ping: ' + this.ping + 'ms');
    }
  }

  Clock.prototype.getServerTsForClientTs = function(clientTs) {
    return this.serverTs + (clientTs - this.clientReceivedTs);
  }

  Karma.Clock = Clock;

}());