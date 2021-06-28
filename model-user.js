var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({    
      email: String,
      liked: [mongoose.ObjectId]
});

module.exports = new mongoose.model('User', userSchema);