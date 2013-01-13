var backbone = require('backbone');
var _ = require('underscore');
var b2d = require("box2d");
var fs = require('fs');

var PhysicsItem = require("./physicsItem");


var PhysicsEngine = backbone.Model.extend({
  urlRoot: '/physicsEngine',
  initialize: function(_map) {

    this.map = _map;
    this.timeStep = 1.0 / 60.0;
    this.iterations = 10;
    this.gScale = 128; // graphical scale

    // Define world
    var worldAABB = new b2d.b2AABB();
    worldAABB.lowerBound.Set(-10.0 - _map.size.w, -10.0 - _map.size.h);
    worldAABB.upperBound.Set(_map.size.w + 10.0, _map.size.h + 10.0);

    var gravity = new b2d.b2Vec2(0.0, 0.0);
    var doSleep = true;
    this.world = new b2d.b2World(worldAABB, gravity, doSleep);
    this.staticItems = [];

    // LOAD STATIC ITEMS ONCE FOR CLIENT
    this.itemsInMap = {};
    _.each(this.map.staticItems, function(i) {
      var itemJSONPath = __dirname + '/../public/items/' + i.name + '.json';
      var itemJSONString = fs.readFileSync(itemJSONPath);
      var itemJSON = JSON.parse(itemJSONString);
      if(this.itemsInMap[itemJSON.name] == undefined) {
        this.itemsInMap[itemJSON.name] = itemJSON;
      }
    }.bind(this));


    var listener = new b2d.b2ContactListener();
    listener.BeginContact = function(contact) {
      console.log(contact.GetFixtureA().GetBody().GetUserData());
    }
    listener.EndContact = function(contact) {
      console.log(contact.GetFixtureA().GetBody().GetUserData());
    }
    listener.PostSolve = function(contact, impulse) {
      console.log('post solve');
    }
    listener.PreSolve = function(contact, oldManifold) {
      console.log('pre solve');
    }
    this.world.SetContactListener(listener);



    this.createBorders(this.map.size);
    this.loadStaticItems(this.map.staticItems);
  },
  getGraphicalStaticItems: function() {
    var that = this;
    return this.map.staticItems.map(function(item) { return that.scaleStaticItem(item) })    
  },
  scaleStaticItem: function(staticItem) {    
    return {
      name: staticItem.name,
      size: {
        w: staticItem.size.w * this.gScale,
        h: staticItem.size.h * this.gScale
      },
      position: {
        x: staticItem.position.x * this.gScale,
        y: staticItem.position.y * this.gScale
      }
    }
  },  
  // scaleItemInMap: function(itemInMap) {
  //   return {
  //     name: itemInMap.name,
  //     size: {
  //       w: itemInMap.size.w * this.gScale,
  //       h: itemInMap.size.h * this.gScale
  //     },
  //     position: {
  //       x: itemInMap.position.x * this.gScale,
  //       y: itemInMap.position.y * this.gScale
  //     }
  //   }
  //   }
  // }
  getGraphicalItemsInMap: function() {
    return this.itemsInMap;
    // return this.itemsInMap.map(this.scaleItemInMap);
  },
  getWorldInfo: function() {
    var res = { w: this.map.size.w * this.gScale, h: this.map.size.h * this.gScale };
    return {
      "size": res,
      "staticItems": this.getGraphicalStaticItems(),
      "itemsInMap": this.getGraphicalItemsInMap(),
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
  createSquareBody: function(_position, _size, _density, _friction) {
    try {
      var bodyDef = new b2d.b2BodyDef();
      bodyDef.position.Set(_position.x, _position.y);
      var body = this.world.CreateBody(bodyDef);
      var shapeDef = new b2d.b2PolygonDef();
      shapeDef.SetAsBox(_size.w / 2, _size.h / 2);
      shapeDef.density = _density;
      shapeDef.friction = _friction;
      shapeDef.restitution = 0;
      body.CreateShape(shapeDef);
      body.SetMassFromShapes();
      return body;
    } catch(e) {
      //console.log(e);
      return null;
    }
  },
  createBorders: function(mapSize) {
    var borderSize = 2.0;
    var density = 0.0;
    var friction = 0.0;
    var wallTop = {
      physicsEngine: this,
      position: {
        x: mapSize.w / 2,
        y: borderSize / 2
      },
      size: {
        w: mapSize.w,
        h: borderSize
      },
      density: density,
      friction: friction
    };
    var wallBottom = {
      physicsEngine: this,
      position: {
        x: mapSize.w / 2,
        y: mapSize.h - borderSize / 2
      },
      size: {
        w: mapSize.w,
        h: borderSize
      },
      density: density,
      friction: friction
    };
    var worldYminusBorder = mapSize.h - 2 * borderSize;
    var wallLeft = {
      physicsEngine: this,
      position: {
        x: borderSize / 2,
        y: borderSize + worldYminusBorder / 2
      },
      size: {
        w: borderSize,
        h: worldYminusBorder
      },
      density: density,
      friction: friction
    };
    var wallRight = {
      physicsEngine: this,
      position: {
        x: mapSize.w - borderSize / 2,
        y: borderSize + worldYminusBorder / 2
      },
      size: {
        w: borderSize,
        h: worldYminusBorder
      },
      density: density,
      friction: friction
    };

    this.staticItems.push(new PhysicsItem(wallTop));
    this.staticItems.push(new PhysicsItem(wallBottom));
    this.staticItems.push(new PhysicsItem(wallLeft));
    this.staticItems.push(new PhysicsItem(wallRight));

    this.map.staticItems.push({
      "name": "wall",
      "size": wallTop.size,
      "position": wallTop.position
    });
    this.map.staticItems.push({
      "name": "wall",
      "size": wallBottom.size,
      "position": wallBottom.position
    });
    this.map.staticItems.push({
      "name": "wall",
      "size": wallLeft.size,
      "position": wallLeft.position
    });
    this.map.staticItems.push({
      "name": "wall",
      "size": wallRight.size,
      "position": wallRight.position
    });

  },
  loadStaticItems: function(_staticItems) {
    _.each(_staticItems, function(w) {
      var _staticItemOptions = {
        "physicsEngine": this,
        "position": w.position,
        "size": w.size,
        "density": 0.0,
        "friction": 0.0
      };
      this.staticItems.push(new PhysicsItem(_staticItemOptions));
    }.bind(this));

  }
});


module.exports = PhysicsEngine;