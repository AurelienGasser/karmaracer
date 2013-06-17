var mongoose = require('mongoose');

exports.mongoose = mongoose;
exports.schemas = {};


exports.schemas.UserSchema = new mongoose.Schema({
  "name": {
    "type": String,
    "displayName": "Prénom"
  },
  "fbid": {
    "type": String
  },
  "score": {
    "type": Number,
    "default" : 0
  },
  "victories": {
    "type": Integer,
  }
});