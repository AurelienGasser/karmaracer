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
    worldAABB.lowerBound.Set(-10.0, -10.0);
    worldAABB.upperBound.Set(_size.w + 10.0, _size.h + 10.0);

    var gravity = new b2d.b2Vec2(0.0, 0.0);
    var doSleep = true;
    this.world = new b2d.b2World(worldAABB, gravity, doSleep);

    this.walls = [];

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
    //console.log(this.world.GetBodyCount());
    this.world.Step(this.timeStep, this.iterations);
  },

  createSquareBody : function(_position, _size, _density, _friction){    
    try{
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
    } catch(e){
      //console.log(e);
      return null;
    }


  },
  createWalls : function(worldSize){
    var borderSize = 2.0;
    var density = 0.0;
    var friction = 0.0;    
    var wallTop = {physicsEngine : this, position:{x :  worldSize.w / 2, y :  borderSize / 2}, size : {w : worldSize.w, h : borderSize}, density : density, friction: friction};
    var wallBottom = {physicsEngine : this, position:{x : worldSize.w / 2 , y : worldSize.h - borderSize / 2}, size : {w : worldSize.w , h : borderSize }, density : density, friction: friction};
    var worldYminusBorder = worldSize.h - 2 * borderSize;
    var wallLeft = {physicsEngine : this, position:{x : borderSize / 2, y :  borderSize + worldYminusBorder / 2}, size : {w : borderSize, h : worldYminusBorder}, density : density, friction: friction};
    var wallRight = {physicsEngine : this, position:{x : worldSize.w - borderSize / 2, y : borderSize + worldYminusBorder / 2 }, size : {w : borderSize, h : worldYminusBorder}, density : density, friction: friction};
    var wallMiddle = {physicsEngine : this, position:{x : 300.0, y : 300.0}, size : {w : 100, h : 100.0}, density : 0.0, friction: 0.0};

    this.walls.push(new PhysicsItem(wallTop));
    this.walls.push(new PhysicsItem(wallBottom));
    this.walls.push(new PhysicsItem(wallLeft));
    this.walls.push(new PhysicsItem(wallRight));    

    this.walls.push(new PhysicsItem(wallMiddle));    
    
  }
});


module.exports = PhysicsEngine;