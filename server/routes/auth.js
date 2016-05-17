var express = require('express');
var router = express.Router();

var passport = require('passport');

var As = require('../models/activate').As;
var User = require('../models/user').User;
var smtpTransport = require('../config/mail').smtpTransport;
var sender = require('../config/mail').sender;
var auth_email = require('../config/mail').auth_email;

var siteUrl = 'http://localhost:8000';



/**********************************************************************
 * Login router (POST)
 **********************************************************************/
router.post('/login', passport.authenticate('local-login'), function (req, res) {
  res.status(200).json({
    user : {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      status: req.user.status,
    }
  });
});

/**********************************************************************
 * Loggout router (GET)
 **********************************************************************/
router.get('/logout', function (req, res) {
  req.logout();
  res.status(200).json({message: 'Bye!'});
});

/**********************************************************************
 * Register router (POST)
 * Active mail and send mail for SignUp
 **********************************************************************/
router.post('/register', checkActivateStatusAJ, checkEmailAJ, function (req, res, next) {
  var _mail = req.body.email;

  var activationStatus = new As({ email: _mail, hashedEmail: _mail, verifyStatus: false });
  console.log(activationStatus);

  var mailOptions = {
    from: sender + ' < ' + auth_email + ' >', // sender address
    to: activationStatus.email, // list of receivers
    subject: "[event'se] Confirmation d'inscription", // Subject line
    text: "Confirmation d'inscription", // plaintext body
    html: '<b>Confirmation d\'inscription</b><br />'
        + 'Votre adresse mail : <strong>' + activationStatus.email + '</strong> a bien été enregistré.<br />'
        + '<a href="'+ siteUrl +'/app/#/signup_token?token=' + activationStatus.hashedEmail + '">Cliquer ici pour terminer votre inscription.</a>'
  };


  smtpTransport.sendMail(mailOptions, function (error, info){
    if(error) {
      console.log(error);
      res.status(200)
             .json({status: false, message: 'Désolé, nous somme dans l\'incapacité de vous envoyer un mail.'});
    } else {
      activationStatus.save(function (err, data) {
        if(err) {
          return next(err);
        } else {
          res.status(200)
             .json({status: true, message: 'Un mail vous a été envoyé. Veuillez suivre les instructions.'});
        }
      });
    }
    console.log('Message sent: ' + info.response);
  });

  
});

/**********************************************************************
 * SignUp router (GET)
 * Return user.email from token
 **********************************************************************/
router.get('/signup', function (req, res, next) {
  var token = req.query["token"];
  console.log(token);
  As.findOne({ hashedEmail: token }, function(err, data) {
    if(err) { return next(err) };
    if(!data) {
      res.status(200)
         .json({status: false, message: 'Token not found.'});
    } else {
      if ( data.verifyStatus == true) {
        res.status(200)
           .json({status: false, message: 'Votre compte a déjà été activé.'});
      } else {
        res.status(200).json({status: true, email: data.email});
      }
    };
  });
});

/**********************************************************************
 * SignUp router (POST)
 * Save new user in database
 **********************************************************************/
router.post('/signup', checkEmailAJ, checkUsernameAJ, function (req, res) {
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;

  // if there is no user with that username
  // create the user
  var newUser = new User();

  // set the user's local credentials
  newUser.email         = email;
  newUser.username      = username;
  newUser.password      = newUser.generateHash(password);
  newUser.notifications = [] // at the creation, no notifications

  // save the user
  newUser.save(function (err) {
    if (err) return next(err);

    // Desactive mail token
    As.update({email: email}, {verifyStatus: true}, function(err) {
      if (err) return next(err);
    })

    res.status(200).json({status: true, newUser: newUser});
  });
});

/**********************************************************************
 * LoggedIn router (POST)
 * route to test if the user is logged in or not
 **********************************************************************/
router.get('/loggedin', function (req, res) {
  res.status(200).json({user:req.isAuthenticated() ? {
    id: req.user._id,
    username: req.user.username,
    email: req.user.email,
    status: req.user.status,
  } : 0});
});

router.post('/checkUser', function (req, res) {
  var username = req.body.username;
  var password = req.body.password;
  User.findOne({ username: username }, function (err, user) {
    if (err) { 
      return next(err); 
    } else if ( user === null) {
      // user not found
      res.status(200)
         .json({status: false, message: 'Utilisateur incorrect'});
    } else {
      // user found but password incorrect
      if (!user.validPassword(password))
        res.status(200)
         .json({status: false, message: 'Utilisateur incorrect'});
      // user found and password correct
      else
        res.status(200)
         .json({status: true, message: 'Utilisateur correct'});
    }
  });


});

router.post('/checkEmailIsFree', checkEmailAJ, function (req, res) {
  res.status(200)
     .json({status: true, message: 'Adresse mail non utilistée'});
});

router.post('/checkUsernameIsFree', checkUsernameAJ, function (req, res) {
  res.status(200)
     .json({status: true, message: 'Nom utilisateur non utilistée'});
});


router.post('/profile/updateUsername', isLoggedIn, checkUsernameAJ, function (req, res) {
  User.findOneAndUpdate({_id : req.user._id}, {username : req.body.username}, function (err, userUpdated){
    if (err) throw res.status(404).json({message: 'Error 404'});
    
    res.status(200).json({status: true, message: 'Nom d\'utilisateur enregistré'});
  });
});

router.post('/profile/updatePassword', isLoggedIn, function (req, res) {
  User.findOneAndUpdate({_id : req.user._id}, {password : req.user.generateHash(req.body.password)}, function (err, userUpdated){
    if (err) throw res.status(404).json({message: 'Error 404'});
    
    res.status(200).json({status: true, message: 'Nouveau mot de passe enregistré'});
  });
});

/**
 * checkActivateStatusAJ
 * Vérifie si l'email a déjà activé
 */
function checkActivateStatusAJ(req, res, next) {
  As.findOne({ email: req.body.email }, function (err, data) {
    if (err) { 
      return next(err); 
    } else if ( data === null) {
      return next();
    } else if ( data.verifyStatus === true ) {
      res.status(200)
         .json({status: true, message: 'Votre compte a déjà été activé.'});
    } else {
      res.status(200)
         .json({status: false, message: 'Un mail vous a été envoyé. Vous devrez attendre 1h30min pour demander un autre mail d\'inscription.'});
    }
  });  
}

/**
 * checkEmailAJ
 * Vérifie si l'email a déjà été utilisé par un user
 */
function checkEmailAJ(req, res, next) {
  if (!req.body.email)
    return res.status(200)
              .json({status: false, message: 'Adresse mail déjà enregistrée.'});
  User.findOne({ email: req.body.email }, function (err, data) {
    if (err) { 
      return next(err); 
    } else if ( data === null) {
      return next();
    } else {
      res.status(200)
         .json({status: false, message: 'Adresse mail déjà enregistrée.'});
    }
  });
}

/**
 * checkUsernameAJ
 * Vérifie si l'username a déjà été utilisé par un user
 */
function checkUsernameAJ(req, res, next) {
  if (!req.body.username)
    return res.status(200)
              .json({status: false, message: 'Nom utilisateur déjà utilisé'});
  User.findOne({ username: req.body.username }, function (err, data) {
    if (err) { 
      return next(err); 
    } else if ( data === null) {
      return next();
    } else {
      res.status(200)
         .json({status: false, message: 'Nom utilisateur déjà utilisé'});
    }
  });
}

/**
 * checkEmailIsNotAlreadyActivateAJ (optionnel)
 * Petite sécurité pour être sûr que la personne ne change pas l'adresse mail lors de l'inscription
 */
function checkEmailIsNotAlreadyActivateAJ(req, res, next) {
  console.log(req.body.email);
  As.findOne({ email: req.body.email, hashedEmail: req.body.token, verifyStatus: false }, function (err, data) {
    if (err) { 
      return next(err); 
    } else if ( data === null) {
      res.status(200)
         .json({status: false, message: 'Petit hackeur ! :P'});
    } else {
      return next();
    }
  });
}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  // if user is authenticated in the session, carry on 
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.status(404).json({message: 'Error 404'});
}

module.exports = router;
