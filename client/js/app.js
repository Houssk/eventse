var myApp = angular.module('myApp', [
  'ngRoute', 
  'ngMap',
  'ngAnimate',
  'ui.bootstrap',
  'xeditable',
  'events.gallery',
  'toggle-switch',
]);


myApp.config(['$routeProvider', function($routeProvider) {
  // Define all the routes
  $routeProvider.
    when('/', {
      templateUrl: 'partials/home.html',
      controller: 'mainCtrl',
    }).
    when('/login', {
      templateUrl: 'partials/auth/login.html',
      controller: 'loginCtrl',
      access: {restricted: false}
    }).
    when('/profile', {
      templateUrl: 'partials/auth/profile.html',
      controller: 'profileCtrl',
      access: {restricted: true}
    }).
    when('/register', {
      templateUrl: 'partials/auth/register.html',
      controller: 'registerCtrl'
    }).
    when('/signup_token', {
      templateUrl: 'partials/auth/signup_token.html',
      controller: 'signupTokenCtrl'
    }).
    when('/signup_notoken', {
      templateUrl: 'partials/auth/signup_notoken.html',
      controller: 'signupNoTokenCtrl'
    }).
    when('/events', {
      templateUrl: 'partials/eventAll.html',
      controller: 'getAllEventsCtrl',
    }).
    when('/events/:id', {
      templateUrl: 'partials/eventSingle.html',
      controller: 'getOneEventCtrl'
    }).
    when('/create_event', {
      templateUrl: 'partials/eventCreate.html',
      controller: 'createEventCtrl',
      access: {restricted: true}
    }).
    when('/update_event/:id', {
      templateUrl: 'partials/eventUpdate.html',
      controller: 'updateEventCtrl',
      access: {restricted: true}
    }).
    when('/myevents', {
      templateUrl: 'partials/eventAll.html',
      controller: 'getMyEventsCtrl',
      access: {restricted: true}
    }).
    when('/myinvitations', {
      templateUrl: 'partials/invitations.html',
      controller: 'getMyInvitationsCtrl',
      access: {restricted: true}
    }).
    when('/mapEvents', {
      templateUrl: 'partials/mapEvents.html',
      controller: 'mapEventsCtrl',
    }).
    otherwise({
      redirectTo: '/'
    });
}]);

myApp.run(function(editableOptions) {
  editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
});

myApp.run(function ($rootScope, $location, $route, authService, $http) {
  // Route to /login if user is not login where access: {restricted: true}
  $rootScope.$on('$routeChangeStart', function (event, next, current) {

    // handle session start event (methode called page is refreshed)
    if (!current) {
      // Demande au server si on est toujous connecté
      $http.get('/auth/loggedin')
        .then(function (response) {
          var user = response.data.user;
          if (!user) {
            user = false;
            // Si page restricted, on le redirige
            if (typeof next.access !== "undefined") {
              if (next.access.restricted) {
                $location.path('/login');
              }
            }
          }
          // Sauvegarde de l'user dans une variable
          authService.setUser(user);
          // parametre global auth
          $rootScope.auth = authService;
        })
        .catch(function (response) {
          authService.setUser(false);
          // Si page restricted, on le redirige
          if (typeof next.access !== "undefined") {
            if (next.access.restricted) {
              $location.path('/login');
            }
          }
        });
    }

    // Restricted access
    else if (typeof next.access !== "undefined") {
      if (next.access.restricted && authService.isLoggedIn() === false) {
        $location.path('/login');
      }
    }
    
  });
});
