var KLib = require('./../KLib');
var Body = require('./Body');
var Engine_collisions = require('./Engine_collisions');

var Engine = function(size, map) {
  this.stepNum = 0;
  this.stepTs = undefined;
  this.shareCollisionInfo = false;
  this.itemsToDestroy = [];
  this.bodies = {};
  this.gScale = 1;
  this.staticItemTypes = {};
  this.map = map;
  this.setupWorld(size);
  this.loadStaticItems();
}

Engine.prototype.destroy = function() {
  this.bodies = null;
  this.size = null;
};

Engine.prototype.addBody = function(body) {
  this.bodies[body.id] = body;
}

Engine.prototype.createBody = function(position, size, name, reuseId) {
  var b, id;
  b = new Body();
  b.initialize(this, position, size, reuseId);
  if (!KLib.isUndefined(name)) {
    b.name = name;
  }
  if (typeof position.id !== 'undefined') {
    b.oldId = position.id;
  }
  this.bodies[b.id] = b;
  id = b.id;
  b = null;
  return id;
};

Engine.prototype.destroyBodies = function() {
  for (var i in this.itemsToDestroy) {
    var item = this.itemsToDestroy[i];
    item.destroy();
    delete this.bodies[item.id];
  }
  this.itemsToDestroy = [];
};

Engine.prototype.setupWorld = function(size) {
  this.size = size;
};

Engine.prototype.outOfWalls = function(point) {
  var res = point.x < 0 || point.y < 0 || point.x > this.map.size.w || point.y > this.map.size.h
  return res;
}

Engine.prototype.getWorldInfo = function() {
  return {
    "size": {
      w: this.map.size.w * this.gScale,
      h: this.map.size.h * this.gScale,
    },
    staticItems:          this.getSharedStaticItems(),
    staticItemTypes:      this.staticItemTypes,
    map:                  this.map
  };
}

Engine.prototype.getShared = function() {
  var bodies = [];
  for (var bID in this.bodies) {
    var body = this.bodies[bID];
    bodies.push(body.getShared());
  }
  return bodies;
}

Engine.prototype.getSharedStaticItems = function() {
  var shareStaticItems = [];
  var items = this.staticBodies;
  for (var i = 0; i < items.length; i++) {
    var w = items[i];
    shareStaticItems.push(w.getShared());
  };
  return shareStaticItems;
}

Engine.prototype.step = function() {

  var A, AID;
  for (AID in this.bodies) {
    A = this.bodies[AID];
    if (A.isStatic === false) {
      A.resetCollisions();
    }
  }
  for (AID in this.bodies) {
    A = this.bodies[AID];

    if (A.isStatic === false) {
      if (A.moveToPosition !== null) {
        A.doMove();
      }

    }
  }
  this.destroyBodies();
  ++this.stepNum;
  this.stepTs = Date.now();
};

Engine.prototype.loadStaticItems = function() {
  var b;
  var staticItems = this.map.staticItems;
  this.staticBodies = [];
  for (var i = 0; i < staticItems.length; i++) {
    var item = staticItems[i];
    var itemJSON = item.def;
    if (item.name === 'outsideWall') {
      var wallThickness = 1;
      var id;
      id = this.createBody({ x: this.map.size.w / 2, y: this.map.size.h + wallThickness / 2 }, { w: this.map.size.w, h: wallThickness }, 'wallTop');
      b = this.bodies[id];
      b.isStatic = true;
      this.staticBodies.push(b);
      id = this.createBody({ x: -wallThickness / 2, y: this.map.size.h / 2 }, { w: wallThickness, h: this.map.size.h }, 'wallLeft');
      b = this.bodies[id];
      b.isStatic = true;
      this.staticBodies.push(b);
      id = this.createBody({ x: this.map.size.w  + wallThickness / 2, y: this.map.size.h / 2 }, { w: wallThickness, h: this.map.size.h }, 'wallRight');
      b = this.bodies[id];
      b.isStatic = true;
      this.staticBodies.push(b);
      id = this.createBody({ x: this.map.size.w / 2, y: -wallThickness / 2 }, { w: this.map.size.w, h: wallThickness }, 'wallBottom');
      b = this.bodies[id];
      b.isStatic = true;
      this.staticBodies.push(b);
    } else {
      var id = this.createBody(item.position, item.size, item.name);
      b = this.bodies[id];
      b.isStatic = true;
      this.staticBodies.push(b);
    }
    if (this.staticItemTypes[itemJSON.name] == undefined) {
      this.staticItemTypes[itemJSON.name] = itemJSON;
    }
  };
}

Engine.prototype.replaceCarBody = function(car) {
  if (typeof this.bodies[car.id] === 'undefined') {
    this.createBody(car, { w: car.w, h: car.h }, 'car', car.id);
  } else {
    this.bodies[car.id].x = car.x;
    this.bodies[car.id].y = car.y;
    this.bodies[car.id].r = car.r;
  }
  return car.id;
}

KLib.extendPrototype(Engine, Engine_collisions);
module.exports = Engine;