var mongoose = require('../config/database').mongoose;
var bcrypt = require('bcrypt-nodejs');
var SALT_WORK_FACTOR = 10;

// User Schema
var userSchema = mongoose.Schema({
  username:          { type: String, required: true, unique: true },
  email:             { type: String, required: true, unique: true },
  password:          { type: String, required: true},
  status :           { type: Number, default: 2}, // 0: SuperAdmin, 1: Admin, 2: Simple User
  accessToken:       { type: String }, // Used for Remember Me
  notifications:     [mongoose.Schema.Types.Mixed] // array of js objects
});

// Generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(SALT_WORK_FACTOR), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

// Define a new user
var User = mongoose.model('User', userSchema);

// Expose User
exports.User = User;
