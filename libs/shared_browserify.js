var Body = require('./classes/Physics/Body.js');
var Engine = require('./classes/Physics/Engine.js');
var UserCommand = require('./classes/UserCommand');
window.Karma = window.Karma || {};
window.Karma.Engine = Engine
window.Karma.Body = Body;
window.Karma.UserCommand = UserCommand;
