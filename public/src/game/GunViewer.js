(function() {
  "use strict";

  var GunViewer = function($container, connection) {
    this.$container = $container;
    this.connection = connection;
  };

  GunViewer.prototype.addGun = function(name) {
    var gunID = 'gunZone';
    var gunLoaderID = gunID + '-loader';
    var o = [];
    o.push('<div id="', gunID, '" class="gunZone"><div id="', gunLoaderID, '" class="gunLoaderZone"></div></div>');
    this.$gunZone = $(o.join(''));
    this.setBackground(name);
    this.$container.append(this.$gunZone);
    this.$gunLoaderZone = this.$gunZone.find('.gunLoaderZone');
    this.gunName = name;

    var that = this;
    this.$gunZone.click(function(e) {
      that.connection.emit('shoot');
    });

    this.$gunZone.on('touchstart', function(e) {
      that.connection.emit('user_command', 'shoot', 'start');
    });

    this.$gunZone.on('touchend', function(e) {
      that.connection.emit('user_command', 'shoot', 'end');
    });

  };

  GunViewer.prototype.setBackground = function(name) {
    this.$gunZone.css('background-image', 'url(\'/images/guns/' + name + '.png\')');
  };


  GunViewer.prototype.setEnergyMask = function(energy) {
    var imgSize = this.$gunZone.width();
    var size = (energy.cur / energy.max) * imgSize;
    if (size > imgSize) {
      size = imgSize;
    }
    this.$gunLoaderZone.width(imgSize - size);
    this.$gunLoaderZone.css('left', (size) + 'px');
  };


  GunViewer.prototype.updateEnergy = function(gunName, energy) {

    if (KLib.isUndefined(this.$gunZone)) {
      this.addGun(gunName);
    } else {
      if (this.gunName !== gunName) {
        this.setBackground(gunName);
        this.gunName = gunName;
      }
    }

    this.setEnergyMask(energy);

  };


  Karma.GunViewer = GunViewer;

}());