var express = require('express');
var path = require('path');
var fs = require('fs'); // used to delete cover image when deleting event
var eventRouter = express.Router();

var Event = require('../models/eventModel');

var multer = require('multer');

// set the adress where we save all images
var upload = function(folder) {
  return multer({ dest : path.join(__dirname, '../../client/uploads/' + folder) })
};

/* Handle every request made to the server */
eventRouter.use(function(req, res, next) {
  // we can do statistics here, or make sure that every request is safe and sound
  //~ console.log(req.rawHeaders); // print the user agent of the client
  console.log('Something is happening.');
  next();
});


/* For clarity, regroup multiples routes under the same URL */
eventRouter.route('/events')

  /* API route to get all events */
  .get(function(req, res) {
    
    console.log('Someone GET all events');
    // Only get public events
    Event.find({'isPublic': true, 'date': {"$gte": new Date()}}, function(err, events) {
          
      if(err) {
        console.log('Error while retrieving data from MongoDB');
        res.send(err);
      }
        
      res.json(events);
    });
  })
  
  
  /* API route to add a new event */
  .post(upload('covers').single('cover'), function(req, res) {
    
    console.log('Someone POST one event');

    /* The object we gonna save in the database */
    var event = new Event();
    
    /* Set all attributes based on the post request */
    event.name = req.body.name;
    event.author = req.body.author;
    event.description = req.body.description;
    event.date = req.body.date;
    event.viewCount = 0; // when we create the page, the view count is zero
    event.isPublic = req.body.isPublic;
    event.coverPath = req.file.filename;
    event.address = req.body.address;
    event.longitude = req.body.longitude;
    event.latitude = req.body.latitude;
    event.participants = []; // at the beginning, no participants
    event.comment = []; // No comment at the beginning

    event.save(function(err) {
      if(err)
        res.send(err);
      
      // only for debug (print the id of the newly created event)
      console.log('Id of the new event -> ', event._id);

      // send the event id so the user can be redirected to the event page
      res.json({message: 'Event created successfully', id: event._id});
    });
  });
    

/* Regroup all routes related to a single event under the same URL*/
eventRouter.route('/events/:event_id')

  /* API route to get one event with its id */
  .get(function(req, res) {
    
    console.log('Someone GET one event');
    Event.findById(req.params.event_id, function(err, event) {
      if(err) {
        console.log('Error while retrieving a single event');
        res.send(err);
      }
      
      /* update the view count */
      event.viewCount += 1;
      event.save(); // do not handle any errors that might happen. If there is an error, well, not a big deal, it simply means that the view count is not incremented

      res.json(event);
    });
  })
  
  
  /* API route to update infos on an event */
  .put(function(req, res) {
    
    console.log('Someone PUT one event');
    
    // First we need to get the event
    Event.findById(req.params.event_id, function(err, event) {
      if(err) {
        console.log('Error while retrieving a single event');
        res.send(err);
      }
      
      /* update informations according to the body of page. Only the field
       * that can be modified are updated */
      event.name = req.body.name;
      event.description = req.body.description;
      event.date = req.body.date;
      event.isPublic = req.body.isPublic;
      event.address = req.body.address;
      event.longitude = req.body.longitude;
      event.latitude = req.body.latitude;

      
      event.save(function(err) {
        if(err)
          res.send(err);
          
        res.json({message: 'Event updated successfully'});
      });
    });
  })

/* API route to add pictures on an event*/
  .post(upload('pictures').single('picture'), function (req, res) {

    console.log('Someone POST a picture to an event');

    // First we need to get the event
    Event.findById(req.params.event_id, function(err, event) {
      if(err) {
        console.log('Error while retrieving a single event');
        res.send(err);
      }
      
      /* update informations according to the body of page.
       * Only pictures are added*/
      
      event.picturesPath.push(req.file.filename)
      
      event.save(function(err) {
        if(err)
          res.send(err);
          
        res.json({message: 'Pictures uploaded successfully'});
      });
    });

  });
  
  
/* The two following routes are special. There are only here to fulfill a need
 * - when we need to know the user of the request (to get his events)
 * - when want to be sure only the creator of an event can delete it */
eventRouter.route('/events_of/:asker')

  /* API route to get all events of a user (both public and private) */
  .get(function(req, res) {
    
    console.log('Someone GET his events');
    
    // Only get events of the asker
    Event.find({'author': req.params.asker}, function(err, events) {
      if(err) {
        console.log('Error while retrieving data from MongoDB');
        res.send(err);
      }
      res.json(events);
    });
  });

eventRouter.route('/events/:event_id/comment')

  /* API route to add a comment */

  .post(function(req, res) {

    Event.findById(req.params.event_id, function(err, event) {
      if(err) {
        console.log('Error while adding comment');
        res.send(err);
      }
      
      var tmp = {'message': req.body.message, 'author':req.body.user };
      
      event.comments.push(tmp);
      
      event.save(function(err) {
        if(err)
          res.send(err);

        console.log("Comment added " , tmp);

        // tell the user that everything is OK
        res.json({message: 'Comment successfully added.'});
      });
    });
  })

eventRouter.route('/events/:event_id/:asker')

  /* API route to delete an event */
  .delete(function(req, res) {
    
    // to get the path of the cover file, we need to get the event first
    Event.findOneAndRemove({
     _id: req.params.event_id,
     author: req.params.asker // only remove the event which have the same author as the asker -> only the one who created the event can delete it
    }, function(err, event) {
      if(err)
        res.send(err);
        
      res.json({message: 'Event deleted successfully' });
       
      // remove the cover image file
      fs.unlinkSync(path.join(__dirname,'../../client/uploads/covers/', event.coverPath));
       
      // remove the pictures
      event.picturesPath.forEach(function (picturePath) {
        fs.unlinkSync(path.join(__dirname,'../../client/uploads/pictures/', picturePath));
      });
       
      console.log('I deleted it!');
      
    });
  })
  
  /* API route to add a user in the event's participants list */
  .post(function(req, res) {
    
    Event.findById(req.params.event_id, function(err, event) {
      if(err) {
        console.log('Error while registering a participant.');
        res.send(err);
      }
      
      // if the user is not in the participants list, we add him
      if (event.participants.indexOf(req.params.asker) == -1) {
        event.participants.push(req.params.asker);
        event.save(function(err) {
          if(err)
            res.send(err);
        
        console.log(req.params.asker + ' registered for ' +  event.name); 
      
        // tell the user that everything is OK
        res.json({message: 'You are registered.'});
        });
      }
      
      else {
        res.json({message: 'You are already a participant of this event.'});
      }
    });
  })




/* API route to remove a user in the event's participants list */
  .put(function(req, res) {
    
    Event.findById(req.params.event_id, function(err, event) {
      if(err) {
        console.log('Error while unregistering a participant.');
        res.send(err);
      }
      
      // if the user is in the participants list, we remove him
      var index = event.participants.indexOf(req.params.asker);
      if ( index > -1) {
        event.participants.splice(index, 1);
        event.save(function(err) {
          if(err)
            res.send(err);
        
        console.log(req.params.asker + ' unregistered for ' +  event.name); 
      
        // tell the user that everything is OK
        res.json({message: 'You are unregistered.', index: index});
        
        });
      }
      
      else {
        res.json({message: 'You are not a participant of this event. You cannot unregister'});
      }
    });
  });


/* API route to delete a picture from an event*/
eventRouter.route('/picture/:event_id/:picture_id')
  .delete(function (req, res) {
    console.log('DELETE a picture ?');
    // First we need to get the event
    Event.findById(req.params.event_id, function (err, event) {
      if(err) {
        console.log('Error while retrieving a single event');
        res.send(err);
      }
      
      /* update informations according to the body of page.
       * Only pictures are added*/
      
      var index = event.picturesPath.indexOf(req.params.picture_id);    // <-- Not supported in <IE9
      if (index !== -1) {
        console.log('Someone DELETE a picture from an event (' + req.params.picture_id + ')');
        event.picturesPath.splice(index, 1);

        event.save(function (err) {
          if(err)
            res.send(err);
          
          fs.unlinkSync(path.join(__dirname,'../../client/uploads/pictures/', req.params.picture_id)); //delete from repertory
          res.json({message: 'Picture delete successfully'});
        });
      }

    });
  });


module.exports = eventRouter;
