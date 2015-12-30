var PlayerCar = require('./../PlayerCar');

var Bot = function(gameServer, name) {
    this.isBot = true;
    this.gameServer = gameServer;
    this.name = name + ' (bot)';
    this.playerCar = new PlayerCar(this.gameServer, null, this.name, this);
    this.playerCar.car.collide = this.collide;
    this.playerCar.playerName = this.name;
    var maxCar = 4;
    var r = parseInt((Math.random() * 1e5) % maxCar, 10);
    r += 2;
    this.playerCar.car.carImageName = 'c' + r;
    this.id = this.playerCar.id;
    return this;
  }

Bot.prototype.tick = function() {
  if (this.playerCar.car && !this.playerCar.dead) {
    this.tickMove();
    this.tickShoot();
  }
};

Bot.prototype.tickMove = function() {
  var car = this.playerCar.car;  
  var wallProbeDist = car.w * 2;
  var probePos = {
    x: car.x + wallProbeDist * Math.cos(car.r), 
    y: car.y + wallProbeDist * Math.sin(car.r)
  };
  var frontCorners = car.getFrontCorners(probePos);
  var willHitWall = {
    straight: this.gameServer.engine.isPointInsideObject(frontCorners.left.x, frontCorners.left.y) ||
              this.gameServer.engine.isPointInsideObject(frontCorners.right.x, frontCorners.right.y)
  };
  
  if (Math.random() > 0.2 && !willHitWall.straight) {
    car.accelerate(0.5);
    return;    
  }

  var turnDir;
  var reverse = false;
  var angle =  Math.random() * Math.PI / 4;

  willHitWall.left = this.gameServer.engine.isPointInsideObject(car.x + wallProbeDist * Math.cos(car.r - angle), car.y + wallProbeDist * Math.sin(car.r - angle)),
  willHitWall.right = this.gameServer.engine.isPointInsideObject(car.x + wallProbeDist * Math.cos(car.r + angle), car.y + wallProbeDist * Math.sin(car.r + angle))
  
  if (willHitWall.left) {
    if (willHitWall.right) {
      // don't turn
      reverse = true;
    } else {
      turnDir = 'right';        
    }
  } else {
    if (willHitWall.right) {
      turnDir = 'left';
    } else {
      turnDir = Math.random() > 0.5 ? 'left' : 'right';
    }
  }
  
  var finalAngle = 0;
  var finalAcceleration = reverse ? -0.5 : 0.5;
  if (turnDir) {
    finalAngle = (turnDir == 'left' ? -1 : +1) * angle;
  }
  
  car.accelerateAndTurn(finalAcceleration, finalAngle);      
};

Bot.prototype.tickShoot = function() {
  if (this.startShootingDate) {
    if (this.gameServer.now > this.startShootingDate) {
      this.startShootingDate = null;
      this.stopShootingDate = this.gameServer.now + Math.random() * 2 * 1000;
    }
    return;
  }  
  if (this.stopShootingDate) {
    if (this.gameServer.now > this.stopShootingDate) {
      this.stopShootingDate = null;
    } else {
      this.playerCar.shoot();      
    }
    return;
  } 
  this.startShootingDate = this.gameServer.now + Math.random() * 2 * 1000;  
};

module.exports = Bot;