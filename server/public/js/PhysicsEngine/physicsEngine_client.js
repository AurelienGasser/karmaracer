var PhysicsEngine = function(gameInstance) {
  this.timeStep = 1.0 / 60.0;
  this.iterations = 10;
  this.staticItems = [];
  this.gameInstance = gameInstance;
  var gravity = new box2d.b2Vec2(0.0, 0.0);
  this.world = new box2d.b2World(gravity, false);
  this.loadStaticItems();
  this.tickInterval = 1000 / 60;
  setInterval(this.step.bind(this), this.tickInterval);
}

PhysicsEngine.prototype.step = function() {
  var ts = new Date();
  var tolerance = 2;
  if (this.tickTs && ts - this.tickTs > this.tickInterval * tolerance) {
    console.log('Warning: main step takes too long...')
  }
  this.tickTs = ts;
  if (this.carBody) {
    console.log(this.carBody.GetPosition())
  }
  this.world.Step(this.timeStep, 8, // velocity iterations
  3); // position iterations
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
    "density": myCar.density,
    "friction": myCar.friction,
    "angle": myCar.r,
    "name": 'car'
  };
  this.carBody = this.createSquareBody(car);
}