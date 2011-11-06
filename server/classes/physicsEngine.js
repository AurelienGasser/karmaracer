var backbone = require('backbone');
var _ = require('underscore');
var b2d = require("box2d");

var PhysicsItem = require("./physicsItem");

var PhysicsEngine = backbone.Model.extend({
  urlRoot : '/physicsEngine',
  initialize : function(_size){

    this.timeStep = 1.0 / 60.0;
    this.iterations = 10;

    // Define world
    var worldAABB = new b2d.b2AABB();
    worldAABB.lowerBound.Set(0, 0);
    worldAABB.upperBound.Set(_size.w, _size.h);

    var gravity = new b2d.b2Vec2(0.0, 0.0);
    var doSleep = true;
    this.world = new b2d.b2World(worldAABB, gravity, doSleep);

    this.walls = [];

    
    //var _pos = {x : 10, y : 10};
    //var _size = '&';//{w : 5, h : 5};
    //var b1 = new PhysicsItem(this, _pos, _size, 1, 0);
    //this.walls.push(b1);
  },
  getShareWalls : function (){
    var shareWalls = [];
    _.each(this.walls, function(w){
      shareWalls.push(w.getShared());
    });
    return shareWalls;
  },
  step : function(){
    // Run Simulation!
    this.world.Step(this.timeStep, this.iterations);
  },
  createSquareBody : function(_position, _size, _density, _friction){    
    try{
      var bodyDef = new b2d.b2BodyDef();
      bodyDef.position.Set(_position.x, _position.y);
      var body = this.world.CreateBody(bodyDef);
      var shapeDef = new b2d.b2PolygonDef();
      shapeDef.SetAsBox(_size.w, _size.h);
      shapeDef.density = _density;
      shapeDef.friction = _friction;
      shapeDef.restitution = 0;
      body.CreateShape(shapeDef);
      body.SetMassFromShapes();
      return body;         
    } catch(e){
      //console.log(e);
      return null;
    }


  },
  createWalls : function(worldSize){

    var borderSize = 1;
    var density = 0;
    var friction = 0;
    var padding = 10;
    var wallTop = {physicsEngine : this, position:{x : padding, y : padding}, size : {w : worldSize.w - (2 * padding), h : borderSize}, density : density, friction: friction};
    var wallBottom = {physicsEngine : this, position:{x : padding, y : worldSize.h - borderSize - padding}, size : {w : worldSize.w - (2 * padding), h : borderSize }, density : density, friction: friction};
    var wallLeft = {physicsEngine : this, position:{x : padding, y : padding + borderSize}, size : {w : borderSize, h : worldSize.h - (borderSize * 2) - (2 * padding)}, density : density, friction: friction};
    var wallRight = {physicsEngine : this, position:{x : worldSize.w - borderSize - padding, y : borderSize + padding}, size : {w : borderSize, h : worldSize.h - (borderSize * 2) - (2 * padding)}, density : density, friction: friction};


    this.walls.push(new PhysicsItem(wallTop));
    this.walls.push(new PhysicsItem(wallBottom));
    this.walls.push(new PhysicsItem(wallLeft));
    this.walls.push(new PhysicsItem(wallRight));    
    
  }
});


module.exports = PhysicsEngine;