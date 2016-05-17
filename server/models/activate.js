var mongoose = require('../config/database').mongoose;
var bcrypt = require('bcrypt-nodejs');
var SALT_WORK_FACTOR = 10;

// Activation Schema
var activationSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true},
  hashedEmail: { type: String, required: true, unique: true },
  verifyStatus: Boolean, // Used to check status
  createdAt: { type: Date, expires: '1.5h', default: Date.now }
});

// generating a hash
activationSchema.methods.generateHashedEmail = function(email) {
    return bcrypt.hashSync(email, bcrypt.genSaltSync(8), null);
};

activationSchema.pre('save', function (next) {
  var _status = this;

  bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if(err) return next(err);

    bcrypt.hash(_status.email, salt, null, function (err, hash) {
      if(err) return next(err);
      _status.hashedEmail = hash;
      next();
    });
  });
});

// Activation Status
var As = mongoose.model('As', activationSchema);

// Expose Activation Status
exports.As = As;
