(function(Engine2DCanvas) {
  "use strict";

  Engine2DCanvas.prototype.interpPos = function(beforePos, afterPos, interpPercent) {
    if (interpPercent > 1 || !$('#interpolate').is(':checked')) {
      // we can't interpolate out of bounds !
      return {
        x: afterPos.x,
        y: afterPos.y,
        r: afterPos.r
      };
    }
    if (Math.abs(afterPos.r - beforePos.r) > Math.PI) {
      // angle goes from 0 to 360 or from 360 to 0
        if (beforePos.r > Math.PI) {
          beforePos.r -= 2 * Math.PI
        } else {
          beforePos.r += 2 * Math.PI
        }
    }
    return {
      x: beforePos.x + (afterPos.x - beforePos.x) * interpPercent,
      y: beforePos.y + (afterPos.y - beforePos.y) * interpPercent,
      r: (beforePos.r + (afterPos.r - beforePos.r) * interpPercent) % (2 * Math.PI)
    };
  };

  Engine2DCanvas.prototype.getInterpData = function() {
    var interpolation = 100;
    var snapshots = this.gameInstance.snapshots;
    var stepNumbers = Object.keys(snapshots);
    var now = Date.now();
    var numSnaps = stepNumbers.length;
    var serverTs = this.gameInstance.clock.getServerTsForClientTs(Date.now());
    if (serverTs === null) {
      // clock not started yet, cannot draw
      return;
    }
    var wantedServerTs = serverTs - interpolation;
    var found = false;
    // find the two snapshots we fall between
    for (var i = numSnaps - 2; i >= 0; --i) {
      if (snapshots[stepNumbers[i    ]].stepTs <= wantedServerTs &&
          snapshots[stepNumbers[i + 1]].stepTs >= wantedServerTs) {
            found = true;
            var snapBefore = snapshots[stepNumbers[i]];
            var snapAfter =  snapshots[stepNumbers[i + 1]];
            for (var j = 0; j < i; ++j) {
              // free memory
              // delete old snapshots
              delete snapshots[stepNumbers[j]];
            }
            this.interpData.snapBefore = snapBefore;
            this.interpData.snapAfter = snapAfter;
            break;
      }
    }
    if (!found) {
      // no data available
      // don't touch this.interpData.snapBefore and this.interpData.snapAfter
    }
    this.interpData.ready = typeof this.interpData.snapBefore !== 'undefined' &&
      typeof this.interpData.snapAfter !== 'undefined';
    if (this.interpData.ready) {
      // interpPercent
      // 0:   snapBefore
      // 0.5: in the middle of snapBefore and snapAfter
      // 1:   snapAfter
      var snapshotsInterval = this.interpData.snapAfter.stepTs - this.interpData.snapBefore.stepTs;
      this.interpData.interpPercent = (wantedServerTs - this.interpData.snapBefore.stepTs) / snapshotsInterval;
    }
    if (!$('#interpolate').is(':checked') && numSnaps >= 2) {
      this.interpData.snapAfter = snapshots[stepNumbers[numSnaps - 1]];
    }
  };
}(Karma.Engine2DCanvas));