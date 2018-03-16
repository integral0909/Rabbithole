// Load required packages
var mongoose = require('mongoose');

// Define our client schema
var ClientSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  id: { type: String, required: true },
  secret: { type: String, required: true },
  userId: { type: String, required: true }
});

ClientSchema.statics.findByUserId = function(userId) {
  return this.find({userId: userId}).exec();
}

// Export the Mongoose model
module.exports = mongoose.model('Client', ClientSchema);