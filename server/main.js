// set up ====================
var compression = require('compression');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');
var auth = require('./routes/auth');
var path = require('path')
var eventRoutes = require('./routes/eventRoutes');
var userRoutes = require('./routes/userRoutes');


// configuration =============
app.use(compression());
app.use(express.static(path.join(__dirname, '../client')));

/**** CATCH EXCEPTIONS ****/
process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err.stack);
});

/**** BODY PARSER ****/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/**** AUTHENTIFICATION ****/
// required for passport
require('./config/passport');
app.use(session({ 
    secret: 'eventse',
    resave: false,
    saveUninitialized: false
    }));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(function(req, res, next){
    res.locals.session = req.session;
    res.locals.user = req.user;
    next();
});

/**** ROUTES ****/
// auth
app.use('/auth', auth);
app.use('/api', eventRoutes);
app.use('/user', userRoutes);

/**** Handle 404 error. ALWAYS PUT IT AFTER THE ROUTES DECLARATIONS ****/
app.use(function(req, res, next){
  /* Tell the user the page is not found */
  // res.status(404).send('Page Not found');
  
  /* Redirect the user to the home page */
  res.redirect('/');
});


module.exports = app;
