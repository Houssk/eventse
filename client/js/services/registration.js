myApp.service('registration', ['$http', function ($http) {

  /**********************************************************************
   * Functions to check pattern of string
   **********************************************************************/
  this.checkPatternEmail = function (email) {
    if (!email) return false;

    // regex for email
    var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/;
    // check if email respect the regex
    var testRegex = regex.test(email); // true if correct, false otherwise
    return testRegex;
  }

  this.checkPatternUsername = function (username) {
    if (!username) return false;

      // regex for email
    var regex = /^[a-zA-Z0-9-_]*$/;
    // check if email respect the regex
    var testRegex = regex.test(username); // true if correct, false otherwise
    // check if username respect min lenght
    var testMinLength = username.length >= 3;
    return testRegex && testMinLength;
  }

  this.checkPatternPassword = function (password) {
    if (!password) return false;

    return password.length >= 4;
  }

  /**********************************************************************
   * Check if email does not exist in database
   **********************************************************************/
  this.checkEmailIsFree = function (email, callback) {
    $http.post('/auth/checkEmailIsFree', { email: email })
    .then(function(response){
      if (typeof(callback) == "function") {
        if (response.data.status === true) {
          callback(true);
        } else {
          callback(false);
        }
      }
    });
  }

  /**********************************************************************
   * Check if username does not exist in database
   **********************************************************************/
  this.checkUsernameIsFree = function (username, callback) {
    $http.post('/auth/checkUsernameIsFree', { username: username })
    .then(function(response){
      if (typeof(callback) == "function") {
        if (response.data.status === true) {
          callback(true);
        } else {
          callback(false);
        }
      }
    });
  }

  /**********************************************************************
  * Register user email
  **********************************************************************/
    this.register = function(email, callback) {
      $http.post('/auth/register', { email: email })
      .then(function(response){
        if (typeof(callback) == "function") {
          if (response.data.status === true) {
            // Success: message instruction
            callback(true, response.data.message); // format : callback(status, message)     
          } else {
            // Success: message d'erreur
            callback(false, response.data.message);
          }
        }
      })
      .catch(function(response){
        // Error: message d'erreur
        if (typeof(callback) == "function") {
          callback(false, response.data.message);
        }
      });
    }

  /**********************************************************************
  * Sign Up Token : Check if token is valid and get associated email
  **********************************************************************/
  this.getEmailByToken = function (token, callback) {
  // Check if token is valid
  $http.get('/auth/signup?token=' + token)
    .then(function(response){
      if (typeof(callback) == "function") {
        if (response.data.status === true) {
          // format : callback(status, email, message)
          callback(true, response.data.email, null);
        } else {
          callback(false, null,response.data.message);
        }
      }
    })
    .catch(function(response){
      if (typeof(callback) == "function") {
        callback(false, null, response.data.message);
      }
    });
  }

  /**********************************************************************
  * Sign Up user
  **********************************************************************/
  this.signup = function (data, callback) {
    $http.post('/auth/signup', data)
    .then(function(response){
      if (typeof(callback) == "function") {
        if (response.data.status === true) {
          // format : callback(status, message)
          callback(true);
        } else {
          callback(false, response.data.message);
        }
      }
    });
  }

    /**********************************************************************
  * Check username and password from user
  **********************************************************************/
  this.checkUser = function (username, password, callback) {
    $http.post('/auth/checkUser', { username: username, password: password })
    .then(function(response){
      if (typeof(callback) == "function") {
        if (response.data.status === true) {
          callback(true);
        } else {
          callback(false);
        }
      }
    });
  }

}]);