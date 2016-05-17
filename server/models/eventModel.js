var mongoose = require('../config/database').mongoose;

/* Event schema 
 * id and type of attributes of the Event class stored in MongoDB
 */
var eventSchema = new mongoose.Schema({
  name:         String,
  author:       String,
  description:  String,
  coverPath:    String,
  date:         Date,
  viewCount:    Number,
  isPublic:     Boolean,
  latitude:     Number,
  longitude:    Number,
  address:      String,
  participants: [String],
  picturesPath: [String],
  comments:     [mongoose.Schema.Types.Mixed],
});

module.exports = mongoose.model('Event', eventSchema);

