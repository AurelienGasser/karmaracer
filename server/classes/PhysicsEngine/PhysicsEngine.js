var backbone = require('backbone');
var _ = require('underscore');
var b2d = require("box2d");
var fs = require('fs');

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

    // Define world
    var worldAABB = new b2d.b2AABB();
    var zoneAround = 200.0;
    worldAABB.lowerBound.Set(-zoneAround, -zoneAround);
    worldAABB.upperBound.Set(_map.size.w + zoneAround, _map.size.h + zoneAround);

    var gravity = new b2d.b2Vec2(0.0, 0.0);
    var doSleep = true;
    this.world = new b2d.b2World(worldAABB, gravity, doSleep);
    var listener = new b2d.b2ContactListener;
    listener.Add(function(point) {
      // console.log('add');
    })
    listener.Persist = function(point) {
      // console.log('persist');
    }
    listener.Remove = function(point) {
      // console.log('remove');
    }


    function contact(o1, o2, callback) {
      callback(o1, o2);
      callback(o2, o1);
    }

    listener.Result = function(point) {
      var o1 = point.shape1.m_userData;
      var o2 = point.shape2.m_userData;
      contact(o1, o2, function(o1, o2) {
        if(o1.name === 'bullet' && o2.name !== 'bullet') {
          o1.explode(point);
          if(o2.name === 'car') {
            o1.car.playerCar.score += 1;
          }
        }
      });
      contact(o1, o2, function(o1, o2){
        if(o2.name === 'car' && o1.name === 'bullet') {
          o2.receiveHit();
        }
      });
    }


    this.world.SetContactListener(listener);
    this.staticItems = [];

    // LOAD STATIC ITEMS ONCE FOR CLIENT
    this.itemsInMap = {};
    _.each(this.map.staticItems, function(i) {
      var itemJSONPath = __dirname + '/../../public/items/' + i.name + '.json';
      var itemJSONString = fs.readFileSync(itemJSONPath);
      var itemJSON = JSON.parse(itemJSONString);
      if(this.itemsInMap[itemJSON.name] == undefined) {
        this.itemsInMap[itemJSON.name] = itemJSON;
      }
    }.bind(this));

    this.createBorders(this.map.size);
    this.loadStaticItems(this.map.staticItems);
  },
  getWorldInfo: function() {
    return {
      "size": {
        w: this.map.size.w * this.gScale,
        h: this.map.size.h * this.gScale,
      },
      //"staticItems": this.map.staticItems,
      "staticItems": this.getShareStaticItems(),
      "itemsInMap": this.itemsInMap,
      "backgroundImage": this.map.backgroundImage
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
    this.world.Step(this.timeStep, this.iterations);
  },
  createSquareBody: function(userData, _position, _size, _density, _friction) {
    try {
      var bodyDef = new b2d.b2BodyDef();
      bodyDef.position.Set(_position.x, _position.y);
      var body = this.world.CreateBody(bodyDef);
      if (body === null){
        return null;
      }
      var shapeDef = new b2d.b2PolygonDef();
      shapeDef.SetAsBox(_size.w / 2, _size.h / 2);
      shapeDef.density = _density;
      shapeDef.friction = _friction;
      shapeDef.restitution = 0;
      shapeDef.userData = userData;
      body.CreateShape(shapeDef);
      body.SetMassFromShapes();
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
        friction: friction
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
        "name": w.name
      };
      var staticItem = new PhysicsItem(_staticItemOptions);
      this.staticItems.push(staticItem);
    }.bind(this));

  }
});


module.exports = PhysicsEngine;