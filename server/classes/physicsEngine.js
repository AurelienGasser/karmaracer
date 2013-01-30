var backbone = require('backbone');
var _ = require('underscore');
// var b2d = require("box2d");
var fs = require('fs');

var box2d = require('box2dweb-commonjs');

var PhysicsItem = require("./physicsItem");

var PhysicsEngine = backbone.Model.extend({
  urlRoot: '/physicsEngine',
<<<<<<< HEAD
  initialize: function(_map) {


    this.gScale = 24;
=======
  initialize: function(_map, gameServer) {
    var that = this;
    this.gScale = 32;
>>>>>>> fee60abcf7796e18fad765f87c45a6254dc160ad
    this.map = _map;
    this.timeStep = 1.0 / 60.0;
    this.iterations = 10;
    this.gameServer = gameServer;

    // Define world
<<<<<<< HEAD
    // var worldAABB = new b2dweb.b2AABB();
    // worldAABB.lowerBound.Set(-10.0, -10.0);
    // worldAABB.upperBound.Set(_map.size.w + 10.0, _map.size.h + 10.0);
    var gravity = new box2d.b2Vec2(0.0, 0.0);
    // var doSleep = true;
    this.world = new box2d.b2World(gravity, false);
=======
    var worldAABB = new b2d.b2AABB();
    worldAABB.lowerBound.Set(-10.0, -10.0);
    worldAABB.upperBound.Set(_map.size.w + 10.0, _map.size.h + 10.0);

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
    listener.Result = function(point) {
      //      console.log("c", point, impact);
      // console.log('collision between', point.shape1.m_userData, 'and', point.shape2.m_userData);
      var o1 = point.shape1.m_userData;
      var o2 = point.shape2.m_userData;
      //console.log(o1);
      if(o1.name === 'bullet' && o2.name !== 'bullet') {
        o1.explode(point);
        if (o2.name === 'car'){
          o1.car.score += 1;
        }
      } else if(o2.name === 'bullet' && o1.name !== 'bullet') {
        o2.explode(point);
        if (o1.name === 'car'){
          o2.car.score += 1;
        }
      if (o1.name == 'car' && o2.name == 'bullet') {
        var o3 = o1;
        o1 = o2;
        o2 = o3;
      }
      if (o2.name == 'car' && o1.name == 'bullet') {
        o2.receiveHit();
      }



      } else {
        return;
      }
      //console.log(o1.name, o2.name);


      //   if(point.shape1.m_userData.type == 'wall' && point.shape2.m_userData.type == 'bullet' || point.shape2.m_userData.type == 'wall' && point.shape1.m_userData.type == 'bullet') {
      //     if(point.shape1.m_userData.type == 'bullet') {
      //       that.gameServer.bullets[point.shape1.m_userData.id].life = -1
      //     } else if(point.shape2.m_userData.type == 'bullet') {
      //       that.gameServer.bullets[point.shape2.m_userData.id].life = -1
      //     }
      //   }
    }


    this.world.SetContactListener(listener);
>>>>>>> fee60abcf7796e18fad765f87c45a6254dc160ad
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

<<<<<<< HEAD
var b2ContactListener = box2d.Box2D.Dynamics.b2ContactListener;

    var listener = new b2ContactListener;
    listener.BeginContact = function(contact) {
      var a = contact.GetFixtureA().GetBody().GetUserData();
      var b = contact.GetFixtureB().GetBody().GetUserData();
      if (a.name === 'bullet' && b.name !== 'bullet'){
        if (b.name === 'wall'){
          //a.life = -1;  
        }        
        //console.log('start contact', a.name, b.name);
      }

      //console.log(contact.GetFixtureA().GetBody().GetUserData().name);
    }
    listener.EndContact = function(contact) {

    }
    listener.PostSolve = function(contact, impulse) {

      var a = contact.GetFixtureA().GetBody().GetUserData();
      var b = contact.GetFixtureB().GetBody().GetUserData();
      if (a.name === 'bullet' && b.name !== 'bullet'){
        if (b.name === 'wall'){
          a.life = -1;  
        }   
        if (b.name === 'car'){
          console.log('post solve', a.name, b.name, impulse);
            a.life = -1;  
        }     
        
      }


      //console.log('post solve', contact.GetFixtureA().GetBody().userData.name);
    }
    listener.PreSolve = function(contact, oldManifold) {
      //console.log('pre solve');
    }
    this.world.SetContactListener(listener);

=======
>>>>>>> fee60abcf7796e18fad765f87c45a6254dc160ad
    this.createBorders(this.map.size);
    this.loadStaticItems(this.map.staticItems);

  },
  getWorldInfo: function() {
    var info = {
      "size": {
        w: this.map.size.w * this.gScale,
        h: this.map.size.h * this.gScale,
      },
      //"staticItems": this.map.staticItems,
      "staticItems": this.getShareStaticItems(),
      "itemsInMap": this.itemsInMap,
      "backgroundImage": this.map.backgroundImage
    };
    return info;
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
  },
<<<<<<< HEAD
  createSquareBody: function(_position, _size, _density, _friction, type, restitution) {
    try {
      var def = new box2d.b2BodyDef();
      def.position.Set(_position.x, _position.y);
      def.type = box2d.b2Body.b2_dynamicBody;
      if (!_.isUndefined(type)){
        def.type = box2d.b2Body.b2_staticBody;
      }
      def.angle = 0;
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
      console.log("error create", e);
=======
  createSquareBody: function(userData, _position, _size, _density, _friction) {
    try {
      var bodyDef = new b2d.b2BodyDef();
      bodyDef.position.Set(_position.x, _position.y);
      var body = this.world.CreateBody(bodyDef);
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
      console.log(e);
>>>>>>> fee60abcf7796e18fad765f87c45a6254dc160ad
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
    var wallBottom = getBorderOptions(mapSize.w / 2, - borderSize / 2, mapSize.w + 2 * borderSize, borderSize);

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