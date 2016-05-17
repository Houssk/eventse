var mongoose = require('mongoose');

var dbUrl = 'mongodb://localhost/eventse';

mongoose.connect(dbUrl);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
  console.log('Connected to DB');
});

exports.mongoose = mongoose;