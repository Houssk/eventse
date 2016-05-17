var express = require('express');
var userRouter = express.Router();
var User = require('../models/user').User;

userRouter.route('/getUsers/:asker/:query/:eventId')

  /* API route to get all users with a certain username */
  .get(function(req, res) {
    
    console.log('Someone GET all users containing ' + req.params.query);
    
    /* This request get all users with a username containing 'query', and case
     * insensitive. It also only returns the username field and a status to
     * tell if the user has already been invited for this event, and limit the
     * number of results to 20 */
    User.find({username: new RegExp(req.params.query, "i")}, 'username notifications', {limit: 20},
      function(err, users) {
        if(err) {
        console.log('Error while retrieving users from MongoDB');
        res.send(err);
        }
      
      results = [];
      
      /* Go through each element of the query and check if it already has an
       * invitation for the 'eventId' */
      users.forEach(function(elem) {
        var invited = false;
        
        for (var i = 0; i < elem.notifications.length; i++) {
          if (elem.notifications[i].eventId === req.params.eventId) {
            invited = true;
            break;
          }
        }
        
        // do not return the asker (because the asker cannot invite himself)
        if (elem.username !== req.params.asker)
          // only return the username and invitation status 
          results.push({username: elem.username, alreadyInvited: invited});
      });
      
      res.json(results);
    });
    
  });
    

userRouter.route('/sendInvitation/:recipient/:sender/:eventId/:eventName')

  /* API route to send an invition for the event to the recipient */
  .post(function(req, res) {
    
    console.log('Someone sends an invitation for ' + req.params.eventName);
    
    User.findOne({username: req.params.recipient}, function(err, user) {
      var invitation = { sender:    req.params.sender,
                         eventId:   req.params.eventId,
                         eventName: req.params.eventName,
                       }
                       
      user.notifications.push(invitation);
      user.save(function(err) {
        if (err)
          res.send(err);
      
        res.json({message: 'Invitation successfully sent!'});
      });
    });
  });
  

userRouter.route('/invitations_of/:asker')

  /* API route to get all invitations of a user */
  .get(function(req, res) {
    
    console.log('Someone GET his invitations');
    
    // only return the notifications of the user
    User.findOne({username: req.params.asker}, 'notifications', 
      function(err, invitations) {
      if(err) {
        console.log('Error while retrieving data from MongoDB');
        res.send(err);
      }
      res.json(invitations);
    });
  });
  
  
module.exports = userRouter;

