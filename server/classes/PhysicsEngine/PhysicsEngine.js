var backbone = require('backbone');
var _ = require('underscore');
var fs = require('fs');
var box2d = require('box2dweb-commonjs');
var PhysicsItem = require("./PhysicsItem");
var Car = require("./Car");
var ContactListener = require('./ContactListener');

var PhysicsEngine = backbone.Model.extend({
  urlRoot: '/physicsEngine',
  initialize: function(_map, gameServer) {
    var that = this;
    this.gScale = 32;
    this.config = {
      car: Car.prototype.config,
      step: {
        ticksPerSecond: 60,
        velocityIterations: 8,
        positionIterations: 3,
      }
    }
    this.map = _map;
    this.iterations = 10;
    this.gameServer = gameServer;
    this.itemsToDestroy = [];

    // Define world
    // var worldAABB = new b2dweb.b2AABB();
    // worldAABB.lowerBound.Set(-10.0, -10.0);
    // worldAABB.upperBound.Set(_map.size.w + 10.0, _map.size.h + 10.0);
    var gravity = new box2d.b2Vec2(0.0, 0.0);
    // var doSleep = true;
    this.world = new box2d.b2World(gravity, false);
    this.staticItems = [];

    this.itemsDir = __dirname + '/../../public/items/';
    this.itemsInMap = {};
    _.each(this.map.staticItems.concat([{ name: 'outsideWall' }]), function(i) {
      var itemJSONPath = that.itemsDir + i.name + '.json';
      var itemJSONString = fs.readFileSync(itemJSONPath);
      var itemJSON = JSON.parse(itemJSONString);
      if(this.itemsInMap[itemJSON.name] == undefined) {
        this.itemsInMap[itemJSON.name] = itemJSON;
      }
    }.bind(this));

    var contactListener = new ContactListener(this.gameServer);
    this.world.SetContactListener(contactListener.listener);

    this.createBorders(this.map.size);
    this.loadStaticItems(this.map.staticItems);
  },
  getWorldInfo: function() {
    return {
      size: {
        w: this.map.size.w * this.gScale,
        h: this.map.size.h * this.gScale,
      },
      staticItems: this.getShareStaticItems(),
      itemsInMap: this.itemsInMap,
      background: this.map.background,
      physicalConfig: this.config
    };
  },
  getShareStaticItems: function() {
    var shareStaticItems = [];
    _.each(this.staticItems, function(w) {
      shareStaticItems.push(w.getShared());
    });
    return shareStaticItems;
  },
  step: function() {
    this.world.Step(1 / this.config.step.ticksPerSecond, this.config.step.velocityIterations, this.config.step.positionIterations);
    for (var i in this.itemsToDestroy) {
      var item = this.itemsToDestroy[i];
      item.destroy();
    }
    this.itemsToDestroy = [];
  },
  createSquareBody: function(userData, bodyParams) {
    try {
      var def = new box2d.b2BodyDef();
      def.bullet = bodyParams.bullet;
      def.userData = userData;
      def.position.Set(bodyParams.position.x, bodyParams.position.y);
      def.type = box2d.b2Body.b2_dynamicBody;
      if (!_.isUndefined(bodyParams.type)){
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
      body.CreateFixture(fixtureDef);
      return body;
    } catch(e) {
      console.log('error on body creation', e, e.stack);
      return null;
    }
  },
  createBorders: function(mapSize) {

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
        type : 'static'
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

  },
  loadStaticItems: function(_staticItems) {
    _.each(_staticItems, function(w) {
      //console.log(w);
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
    }.bind(this));

  }
});


module.exports = PhysicsEngine;