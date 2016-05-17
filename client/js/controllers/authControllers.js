myApp.controller('mainCtrl', function($scope) {
  $scope.message = 'This is the home page of EvenT\'SE';
});

/**********************************************************************
 * Login controller
 **********************************************************************/
myApp.controller('loginCtrl', 
  ['$scope', '$location', 'authService',
  function ($scope, $location, authService) {

    // Register the login() function
    $scope.login = function(loginForm){
      // Initial values
      $scope.error_message = '';

      authService.login(loginForm.username, loginForm.password)
        .then(function(){
          // No error: authentication OK
          $location.url('/');
        })
        .catch(function() {
          // Error: authentication failed
          $scope.error_message = 'Authentication failed.';
          $location.url('/login');
        });
    };
}]);

/**********************************************************************
 * Logout controller
 **********************************************************************/
myApp.controller('logoutCtrl',
  ['$scope', '$location', 'authService',
  function ($scope, $location, authService) {

    $scope.logout = function () {

      console.log(authService.getUser());

      // call logout from service
      authService.logout()
        .then(function () {
          $location.path('/login');
        });

    };

}]);

/**********************************************************************
 * Register controller
 **********************************************************************/
myApp.controller('registerCtrl', function($scope, $rootScope, $http, registration) {

  // Register the active() function
  $scope.register = function(registerForm){
    // Initial values
    $scope.success_message = '';
    $scope.error_message = '';
    registerForm.glyphiconStatus = "glyphicon-repeat glyphicon-spin";

    // Envoie des infos (web service)
    registration.register(registerForm.email, function (status, message) {
      if (status) {
        $scope.success_message = message;
        registerForm.glyphiconStatus = "glyphicon-ok";
        registerForm.successOrError = "has-success";  
      } else {
        $scope.error_message = message;
        registerForm.glyphiconStatus = "glyphicon-remove";
        registerForm.successOrError = "has-error";
      }
    });
  };
});

/**********************************************************************
 * SignUp with Token controller
 **********************************************************************/
myApp.controller('signupTokenCtrl', function($scope, $rootScope, $http, $location, $routeParams, registration) {
  // This object will be filled by the form
  $scope.signupForm = {};

  var token = $location.search().token;

  // Check if token is valid
  registration.getEmailByToken(token, function (status, email, message) {
    if (status) {
      $scope.email = email;
    } else {
      $scope.error_message = message;
      $location.url('/');
    }
  });

  usernameIsValid = false;
  passwordIsValid = false;

  $scope.checkUsername = function() {
    $scope.glyphiconStatus_username = "glyphicon-repeat glyphicon-spin";

    if (!registration.checkPatternUsername($scope.username)) {
      $scope.glyphiconStatus_username = "glyphicon-warning-sign";
      $scope.successOrError_username = "has-warning";
      $scope.popover_username = "Le nom d'utisateur ne doit contenir que des caractères alphanumériques ou tirets, et doit posséder au minimum 3 caractères";
      usernameIsValid = false;
      return;
    }

    registration.checkUsernameIsFree($scope.username, function (isFree) {
      if (isFree) {
        // Success: message instruction
        $scope.glyphiconStatus_username = "glyphicon-ok";
        $scope.successOrError_username = "has-success";
        $scope.popover_username = "";
        //console.log(response.data.message);
        usernameIsValid = true;
      } else {
        // Success: message d'erreur
        $scope.glyphiconStatus_username = "glyphicon-remove";
        $scope.successOrError_username = "has-error";
        $scope.popover_username = "Nom d'utilisateur déjà utilisé";
        //console.log(response.data.message);
        usernameIsValid = false;
      }
    });
  };

  $scope.checkPassword = function() {
    $scope.glyphiconStatus_password = $scope.password && registration.checkPatternPassword($scope.password) ? "glyphicon-ok" : "glyphicon-warning-sign";
    $scope.successOrError_password = $scope.password && registration.checkPatternPassword($scope.password) ? "has-success" :"has-warning";
    $scope.popover_password = $scope.password && registration.checkPatternPassword($scope.password) ? "" : "Le mot de passe doit posséder minimum 4 caractères";
  }

  $scope.checkConfirmPassword = function() {
    // Check if the case password is valid before confronting the 2 passwords
    passwordIsValid = $scope.password ? $scope.password == $scope.confirmPassword : false;

    $scope.glyphiconStatus_confirmPassword = passwordIsValid ? "glyphicon-ok" : "glyphicon-remove";
    $scope.successOrError_confirmPassword = passwordIsValid ? "has-success" : "has-error";
    $scope.popover_confirmPassword = passwordIsValid ? "" : "Le mot de passe ne correspond pas au précédent";
  };

  // Disabled button if form is not valid
  $scope.formIsValid = function() {
    return !(usernameIsValid & passwordIsValid);
  };


  $scope.signupToken = function(){
    // On vide les messages
    $scope.success_message = '';
    $scope.error_message = '';
    // Envoie des infos (web service)
    registration.signup(
      { email :   $scope.email,
        username: $scope.username,
        password: $scope.password,
        token:    token
      },
      function(success, message) {
        if(success) {
          $location.url('/');
        } else {
          $scope.error_message = message;
        }
      });
  };
});

/**********************************************************************
 * SignUp without Token controller
 **********************************************************************/
myApp.controller('signupNoTokenCtrl', function($scope, $rootScope, $http, $location, $routeParams, registration) {

  emailIsValid = false;
  usernameIsValid = false;
  passwordIsValid = false;


  $scope.checkEmail = function() {

    $scope.glyphiconStatus_email = "glyphicon-repeat glyphicon-spin";

    if(!registration.checkPatternEmail($scope.email)) {
      $scope.glyphiconStatus_email = "glyphicon-warning-sign";
      $scope.successOrError_email = "has-warning";
      $scope.popover_email = "Format adresse email invalide";
      emailIsValid = false;
      return;
    }

    registration.checkEmailIsFree($scope.email, function (isFree) {
      if (isFree) {
        // Success: message instruction
        $scope.glyphiconStatus_email = "glyphicon-ok";
        $scope.successOrError_email = "has-success";
        $scope.popover_email = "";
        //console.log(response.data.message);
        emailIsValid = true;
      } else {
        $scope.glyphiconStatus_email = "glyphicon-remove";
        $scope.successOrError_email = "has-error";
        $scope.popover_email = "Adresse email déjà enregistrée";
        //console.log(response.data.message);
        emailIsValid = false;
      }
    });
  };

  $scope.checkUsername = function() {
    $scope.glyphiconStatus_username = "glyphicon-repeat glyphicon-spin";

    if (!registration.checkPatternUsername($scope.username)) {
      $scope.glyphiconStatus_username = "glyphicon-warning-sign";
      $scope.successOrError_username = "has-warning";
      $scope.popover_username = "Le nom d'utisateur ne doit contenir que des caractères alphanumériques ou tirets, et doit posséder au minimum 3 caractères";
      usernameIsValid = false;
      return;
    }

    registration.checkUsernameIsFree($scope.username, function (isFree) {
      if (isFree) {
        // Success: message instruction
        $scope.glyphiconStatus_username = "glyphicon-ok";
        $scope.successOrError_username = "has-success";
        $scope.popover_username = "";
        //console.log(response.data.message);
        usernameIsValid = true;
      } else {
        // Success: message d'erreur
        $scope.glyphiconStatus_username = "glyphicon-remove";
        $scope.successOrError_username = "has-error";
        $scope.popover_username = "Nom d'utilisateur déjà utilisé";
        //console.log(response.data.message);
        usernameIsValid = false;
      }
    });
  };

  $scope.checkPassword = function() {
    $scope.glyphiconStatus_password = $scope.password && registration.checkPatternPassword($scope.password) ? "glyphicon-ok" : "glyphicon-warning-sign";
    $scope.successOrError_password = $scope.password && registration.checkPatternPassword($scope.password) ? "has-success" :"has-warning";
    $scope.popover_password = $scope.password && registration.checkPatternPassword($scope.password) ? "" : "Le mot de passe doit posséder minimum 4 caractères";
  }

  $scope.checkConfirmPassword = function() {
    // Check if the case password is valid before confronting the 2 passwords
    passwordIsValid = $scope.password ? $scope.password == $scope.confirmPassword : false;

    $scope.glyphiconStatus_confirmPassword = passwordIsValid ? "glyphicon-ok" : "glyphicon-remove";
    $scope.successOrError_confirmPassword = passwordIsValid ? "has-success" : "has-error";
    $scope.popover_confirmPassword = passwordIsValid ? "" : "Le mot de passe ne correspond pas au précédent";
  };

  // Disabled button if form is not valid
  $scope.formIsValid = function() {
    return !(emailIsValid & usernameIsValid & passwordIsValid);
  };


  $scope.signupNoToken = function(){
    // On vide les messages
    $scope.success_message = '';
    $scope.error_message = '';
    // Envoie des infos (web service)

    registration.signup(
      { email :   $scope.email,
        username: $scope.username,
        password: $scope.password
      },
      function(success, message) {
        if(success) {
          $location.url('/');
        } else {
          $scope.error_message = message;
        }
      });
  };
});


/**********************************************************************
 * Profile controller
 **********************************************************************/
myApp.controller('profileCtrl', function($scope, $rootScope, $http, authService, registration) {
  $scope.success_message = '';
  $scope.error_message = '';

  oldPasswordIsValid = false;
  passwordIsValid = false;

  $scope.updateUser = function(data) {
    return $http.post('/auth/profile/updateUsername', {username: data})
      .then(function(response){
        if (response.data.status === true) {
          // cas où l'username est diponnible
          return true;
        } else {
          return response.data.message;
        }
      })
      .catch(function(response){
      // cas où l'username est indisponnible
        return response.data.message;
      });
    };

  $scope.checkOldPassword = function() {
    if(registration.checkPatternPassword($scope.oldPassword)) {
      registration.checkUser($rootScope.auth.getUser().username, $scope.oldPassword, function (isCorrect) {
        if (isCorrect) {
          // Success: message instruction
          $scope.glyphiconStatus_oldPassword = "glyphicon-ok";
          $scope.successOrError_oldPassword = "has-success";
          $scope.popover_oldPassword = "";
          //console.log(response.data.message);
          oldPasswordIsValid = true;
        } else {
          $scope.glyphiconStatus_oldPassword = "glyphicon-remove";
          $scope.successOrError_oldPassword = "has-error";
          $scope.popover_oldPassword = "Mot de passe incorrect";
          //console.log(response.data.message);
          oldPasswordIsValid = false;
        }
      });
    }
  }

  $scope.checkPassword = function() {
    $scope.glyphiconStatus_password = $scope.password && registration.checkPatternPassword($scope.password) ? "glyphicon-ok" : "glyphicon-warning-sign";
    $scope.successOrError_password = $scope.password && registration.checkPatternPassword($scope.password) ? "has-success" :"has-warning";
    $scope.popover_password = $scope.password && registration.checkPatternPassword($scope.password) ? "" : "Le mot de passe doit posséder minimum 4 caractères";
  }

  $scope.checkConfirmPassword = function() {
    // Check if the case password is valid before confronting the 2 passwords
    passwordIsValid = $scope.password ? $scope.password == $scope.confirmPassword : false;

    $scope.glyphiconStatus_confirmPassword = passwordIsValid ? "glyphicon-ok" : "glyphicon-remove";
    $scope.successOrError_confirmPassword = passwordIsValid ? "has-success" : "has-error";
    $scope.popover_confirmPassword = passwordIsValid ? "" : "Le mot de passe ne correspond pas au précédent";
  };

  // Disabled button if form is not valid
  $scope.formIsValid = function() {
    return !(oldPasswordIsValid && passwordIsValid);
  };

  $scope.updatePassword = function() {
    $http.post('/auth/profile/updatePassword', {password: $scope.password})
      .then(function(response){
        if (response.data.status === true) {
          $scope.success_message = 'Votre nouveau mot de passe a bien été enregistré';

        } else {
          $scope.error_message = 'Erreur lors de l\'enregistrement du nouveau mot de passe'; 
        }
      })
      .catch(function(response){
        $scope.error_message = 'Erreur lors de l\'enregistrement du nouveau mot de passe'; 
      });  
  };

});
