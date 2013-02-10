var PhysicsEngine = function(gameInstance, physicalConfig) {
  this.config = physicalConfig;
  this.staticItems = [];
  this.gameInstance = gameInstance;
  var gravity = new box2d.b2Vec2(0.0, 0.0);
  this.world = new box2d.b2World(gravity, false);
  this.loadStaticItems();
  setInterval(this.step.bind(this), 1000 / this.config.step.ticksPerSecond);
}

PhysicsEngine.prototype.step = function() {
  var ts = new Date();
  var tolerance = 2;
  if (this.tickTs && ts - this.tickTs > 1000 / this.config.step.ticksPerSecond * tolerance) {
    console.log('Warning: main step takes too long...')
  }
  this.tickTs = ts;
  this.world.Step(1 / this.config.step.ticksPerSecond, this.config.step.velocityIterations, this.config.step.positionIterations);
}

PhysicsEngine.prototype.createSquareBody = function(bodyParams) {
  try {
    var def = new box2d.b2BodyDef();
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
    fixtureDef.shape.SetAsBox(bodyParams.size.w / 2, bodyParams.size.h / 2);
    var body = this.world.CreateBody(def);
    body.CreateFixture(fixtureDef);
    return body;
  } catch(e) {
    console.log('error on body creation', e, e.stack);
    return null;
  }
}

PhysicsEngine.prototype.loadStaticItems = function() {
  _.each(this.gameInstance.walls, function(i) {
    var staticItem = {
      "position": { x: i.x, y: i.y },
      "size": { w: i.w, h: i.h},
      "density": 0.0,
      "friction": 0.0,
      "name": i.name,
      "type": "static"
    };
    this.staticItems.push(staticItem);
    this.createSquareBody(staticItem);
  }.bind(this));
}

PhysicsEngine.prototype.loadMyCar = function() {
  if (this.carBody) {
    this.world.DestroyBody(this.carBody);
  }
  var myCar = this.gameInstance.myCar;
  var car = {
    "position": { x: myCar.x, y: myCar.y },
    "size": { w: myCar.w, h: myCar.h },
    "density": this.config.car.density,
    "friction": this.config.car.friction,
    "restitution": this.config.car.restitution,
    "angle": myCar.r,
    "name": 'car'
  };
  this.carBody = this.createSquareBody(car);
}