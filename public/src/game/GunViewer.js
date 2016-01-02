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
    this.$gunZone.on('mousedown', function(e) {
      Karma.gameInstance.keyboardHandler.shoot = true;
    });

    this.$gunZone.on('mouseup', function(e) {
      Karma.gameInstance.keyboardHandler.shoot = false;
    });

    this.$gunZone.on('touchstart', function(e) {
      Karma.gameInstance.keyboardHandler.shoot = true;
    });

    this.$gunZone.on('touchend', function(e) {
      Karma.gameInstance.keyboardHandler.shoot = false;
    });
  };
  
  GunViewer.prototype.hide = function() {
    if (this.$gunZone && this.$gunZone.is(':visible')) {
      this.$gunZone.hide();          
    }
  };

  GunViewer.prototype.show = function() {
    if (this.$gunZone && !this.$gunZone.is(':visible')) {
      this.$gunZone.show();          
    }
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