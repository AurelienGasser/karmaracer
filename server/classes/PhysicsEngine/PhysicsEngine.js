var backbone = require('backbone');
var _ = require('underscore');
var fs = require('fs');
var box2d = require('box2dweb-commonjs');
var PhysicsItem = require("./PhysicsItem");

var PhysicsEngine = backbone.Model.extend({
  urlRoot: '/physicsEngine',
  initialize: function(_map, gameServer) {
    var that = this;
    this.gScale = 32;
    this.map = _map;
    this.timeStep = 1.0 / 60.0;
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

    // LOAD STATIC ITEMS ONCE FOR CLIENT
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

    this.world.SetContactListener(require('./ContactListener'));

    this.createBorders(this.map.size);
    this.loadStaticItems(this.map.staticItems);
  },
  getWorldInfo: function() {
    return {
      "size": {
        w: this.map.size.w * this.gScale,
        h: this.map.size.h * this.gScale,
      },
      "staticItems": this.getShareStaticItems(),
      "itemsInMap": this.itemsInMap,
      "background": this.map.background
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
    // Run Simulation!
    //console.log(this.world.GetBodyCount());
    this.world.Step(this.timeStep, 8, // velocity iterations
    3); // position iterations
    // this.world.ClearForces();
    //this.world.Step(this.timeStep, this.iterations);
    for (var i in this.itemsToDestroy) {
      var item = this.itemsToDestroy[i];
      item.destroy();
    }
    this.itemsToDestroy = [];
  },
  createSquareBody: function(userData, _position, _size, _density, _friction, _angle, isBullet, type, restitution) {
    try {
      var def = new box2d.b2BodyDef();
      def.bullet = isBullet;
      def.userData = userData;
      def.position.Set(_position.x, _position.y);
      def.type = box2d.b2Body.b2_dynamicBody;
      if (!_.isUndefined(type)){
        def.type = box2d.b2Body.b2_staticBody;
      }
      def.angle = _angle || 0;
      def.linearVelocity = new box2d.b2Vec2(0.0, 0.0);

      var fixtureDef = new box2d.b2FixtureDef();
      fixtureDef.density = _density;
      fixtureDef.friction = _friction;
      fixtureDef.restitution = restitution || 0;
      fixtureDef.shape = new box2d.b2PolygonShape();
      fixtureDef.shape.SetAsBox(_size.w / 2, _size.h / 2);

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