myApp.service('multipartForm', ['$http', '$location', 
  function($http, $location) {
    
    this.post = function(uploadURL, data) {
      
      // initialize fd with the informations of the form
      var fd = new FormData();
      for(var key in data)
        fd.append(key, data[key]);
        
      $http.post(uploadURL, fd, {
        // prevent serialisation (default behavior of angular)
        transformRequest: angular.indentity,
        headers: {'Content-Type': undefined }
        })
        .success(function(data) {
          // if the event is created, redirect the user to this event page
          $location.path('/events/' + data.id);
        })
        .error(function(data) {
          console.log('Error: ' + data);
        });
  }
}]);
