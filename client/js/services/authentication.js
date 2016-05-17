myApp.factory('authService',
  ['$q', '$timeout', '$http',
  function ($q, $timeout, $http) {

    // create user variable
    var user = null;

    // return available functions for use in controllers
    return ({
      isLoggedIn: isLoggedIn,
      setUser: setUser,
      getUser: getUser,
      login: login,
      logout: logout
    });

    function isLoggedIn() {
        if(user) {
          return true;
        } else {
          return false;
        }
    }

    // Use to get user from server
    function setUser(userSession) {
      user = userSession;
    }

    function getUser() {
      return user;
    }

    function login(username, password) {
      // create a new instance of deferred
      var deferred = $q.defer();

      // send a post request to the server
      $http.post('/auth/login', {username: username, password: password})
        // handle success
        .then(function (response) {
          if(response.status === 200){
            user = response.data.user;
            deferred.resolve();
          } else {
            user = false;
            deferred.reject();
          }
        })
        // handle error
        .catch(function (response) {
          user = false;
          deferred.reject();
        });

      // return promise object
      return deferred.promise;
    }

    function logout() {
      // create a new instance of deferred
      var deferred = $q.defer();

      // send a get request to the server
      $http.get('/auth/logout')
        // handle success
        .then(function (response) {
          user = false;
          deferred.resolve();
        })
        // handle error
        .catch(function (response) {
          user = false;
          deferred.reject();
        });

      // return promise object
      return deferred.promise;
    }

}]);
