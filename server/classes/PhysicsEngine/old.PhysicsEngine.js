var KLib = require('../KLib');
var fs = require('fs');
var box2d = require('box2dweb-commonjs');
var PhysicsItem = require("./PhysicsItem");
var ContactListener = require('./ContactListener');


var PhysicsEngine = function(_map, gameServer) {
    this.initialize(_map, gameServer)
  }

PhysicsEngine.prototype.initialize = function(_map, gameServer) {
  var that = this;
  this.gScale = 32;
  this.map = _map;
  this.timeStep = 1.0 / 60.0;
  this.iterations = 10;
  this.gameServer = gameServer;
  this.itemsToDestroy = [];

  this.createWorld();

  this.itemsDir = __dirname + '/../../public/items/';
  this.itemsInMap = {};

  var staticItems = this.map.staticItems.concat([{
    name: 'outsideWall'
  }]);

  for(var i = 0; i < staticItems.length; i++) {
    var item = staticItems[i];
    var itemJSONPath = that.itemsDir + item.name + '.json';
    var itemJSONString = fs.readFileSync(itemJSONPath);
    var itemJSON = JSON.parse(itemJSONString);
    if(this.itemsInMap[itemJSON.name] == undefined) {
      this.itemsInMap[itemJSON.name] = itemJSON;
    }
  };

  var contactListener = new ContactListener(this.gameServer);
  this.world.SetContactListener(contactListener.listener);

  this.createBorders(this.map.size);
  this.loadStaticItems(this.map.staticItems);
};

PhysicsEngine.prototype.createWorld = function() {
    // Define world
  var gravity = new box2d.b2Vec2(0.0, 0.0);
  this.world = new box2d.b2World(gravity, false);
  this.staticItems = [];
  gravity = null;
};

PhysicsEngine.prototype.getWorldInfo = function() {
  return {
    "size": {
      w: this.map.size.w * this.gScale,
      h: this.map.size.h * this.gScale,
    },
    "staticItems": this.getShareStaticItems(),
    "itemsInMap": this.itemsInMap,
    "background": this.map.background
  };
}
PhysicsEngine.prototype.getShareStaticItems = function() {
  var shareStaticItems = [];
  // return shareStaticItems;
  for (var i = 0; i < this.staticItems.length; i++) {
    var w = this.staticItems[i];
    shareStaticItems.push(w.getShared());
  };
  return shareStaticItems;
}
PhysicsEngine.prototype.step = function() {
  // Run Simulation!
  this.world.Step(this.timeStep, 8, // velocity iterations
  3); // position iterations
  // this.world.ClearForces();
  for(var i in this.itemsToDestroy) {
    var item = this.itemsToDestroy[i];
    item.destroy();
  }
  this.itemsToDestroy = [];
}
PhysicsEngine.prototype.createSquareBody = function(userData, bodyParams) {
  try {
    var def = new box2d.b2BodyDef();
    def.bullet = bodyParams.bullet;
    def.userData = userData;
    def.position.Set(bodyParams.position.x, bodyParams.position.y);
    def.type = box2d.b2Body.b2_dynamicBody;
    if(!KLib.isUndefined(bodyParams.type)) {
      def.type = box2d.b2Body.b2_staticBody;
    }
    def.angle = bodyParams.angle || 0;
    def.linearVelocity = new box2d.b2Vec2(0.0, 0.0);

    var fixtureDef = new box2d.b2FixtureDef();
    fixtureDef.density = bodyParams.density;
    fixtureDef.friction = bodyParams.friction;
    fixtureDef.restitution = bodyParams.restitution || 0;
    fixtureDef.shape = new box2d.b2PolygonShape();
    fixtureDef.shape.SetAsBox(userData.size.w / 2, userData.size.h / 2);

    var body = this.world.CreateBody(def);
    this.fixture = body.CreateFixture(fixtureDef);
    return body;
  } catch(e) {
    console.error('error on body creation', e, e.stack);
    return null;
  }
}
PhysicsEngine.prototype.createBorders = function(mapSize) {

  var that = this;

  var borderSize = 0.45;

  function getBorderOptions(x, y, w, h) {

    var density = 0.0;
    var friction = 0.0;
    var borderName = 'wall';

    var border = {
      name: borderName,
      physicsEngine: that,
      position: {
        x: x,
        y: y
      },
      size: {
        w: w,
        h: h
      },
      density: density,
      friction: friction,
      type: 'static'
    };
    return border;
  }
  var wallTop = getBorderOptions(mapSize.w / 2, mapSize.h + borderSize / 2, mapSize.w + 2 * borderSize, borderSize);
  var wallBottom = getBorderOptions(mapSize.w / 2, -borderSize / 2, mapSize.w + 2 * borderSize, borderSize);

  var worldYminusBorder = mapSize.h - 2 * borderSize;

  var wallLeft = getBorderOptions(-borderSize / 2, mapSize.h / 2, borderSize, mapSize.h);
  var wallRight = getBorderOptions(mapSize.w + borderSize / 2, mapSize.h / 2, borderSize, mapSize.h);

  this.staticItems.push(new PhysicsItem(wallTop));
  this.staticItems.push(new PhysicsItem(wallBottom));
  this.staticItems.push(new PhysicsItem(wallLeft));
  this.staticItems.push(new PhysicsItem(wallRight));

};
PhysicsEngine.prototype.loadStaticItems = function(_staticItems) {

  for(var i = 0; i < _staticItems.length; i++) {
    var w = _staticItems[i];

    var _staticItemOptions = {
      "physicsEngine": this,
      "position": w.position,
      "size": w.size,
      "density": 0.0,
      "friction": 0.0,
      "name": w.name,
      "type": "static"
    };
    var staticItem = new PhysicsItem(_staticItemOptions);
    this.staticItems.push(staticItem);

  };

}



module.exports = PhysicsEngine;