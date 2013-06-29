var fs = require('fs');
var CONFIG = require('./../../../config');
var KLib = require('./../KLib');
var Body = require('./Body');
var Engine_collisions = require('./Engine_collisions');

var G_bodyID = 0;
var Engine = function(size, map) {
  this.shareCollisionInfo = false;
  this.itemsToDestroy = [];
  this.bodies = {};
  this.gScale = 1;
  this.staticItemTypes = {};
  this.map = map;
  this.setupWorld(size);
  this.loadStaticItems();
}

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
    "staticItems": this.getSharedStaticItems(),
    "itemsInMap": this.staticItemTypes,
    "background": this.map.background
  };
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
      if (this.moveToPosition !== null) {
        A.doMove();
      }

    }
  }
  this.destroyBodies();
};


Engine.prototype.getShared = function() {
  var bodies = [];
  for (var bID in this.bodies) {
    var body = this.bodies[bID];
    bodies.push(body.getShared());
  }
  return bodies;
}

Engine.prototype.destroy = function() {
  this.bodies = null;
  this.size = null;
};

Engine.prototype.addBody = function(body) {
  this.bodies[body.id] = body;
}

Engine.prototype.createBody = function(position, size, name) {
  var b, id;
  b = new Body();
  b.initialize(this, position, size);
  if (!KLib.isUndefined(name)) {
    b.name = name;
  }
  this.bodies[b.id] = b;
  id = b.id;
  b = null;
  return id;
};

Engine.prototype.loadStaticItems = function() {
  var b;
  var staticItems = this.map.staticItems.concat([{
    name: 'outsideWall'
  }]);
  this.staticBodies = [];
  var itemsDir = CONFIG.serverPath + '/public/items/';
  for (var i = 0; i < staticItems.length; i++) {
    var item = staticItems[i];
    var itemJSONPath = itemsDir + item.name + '.json';
    var itemJSONString = fs.readFileSync(itemJSONPath);
    var itemJSON = JSON.parse(itemJSONString);
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

KLib.extendPrototype(Engine, Engine_collisions);
module.exports = Engine;