myApp.controller('getAllEventsCtrl', ['$scope', '$http',
  function($scope, $http) {
    
    $http.get('/api/events')
      .success(function(data) {
        $scope.events = data;
        // Used to debug : print all events on the browser console
        // console.log(data);
      })
      .error(function(data) {
        console.log('Error: ' + data);
      });
}]);


myApp.controller('createEventCtrl', ['$scope', 'multipartForm', 
  function($scope, multipartForm) {  
    
    $scope.event = {};
    var dateToDisable = new Date();

    $scope.event.date = dateToDisable;
    $('#date').datetimepicker({value: dateToDisable});
    $.datetimepicker.setLocale('fr');
    $('#date').datetimepicker({
      beforeShowDay: function(date) {
        if (date.getMonth() <= dateToDisable.getMonth() && date.getDate() < dateToDisable.getDate()) {
          return [false, ""]
        }
        if (date.getYear() < dateToDisable.getYear()) {
          return [false, ""]
        }
        return [true, ""];
      },
      format:'d.m.Y H:i',
      onClose: function (dateText) {
        $scope.event.date = dateText;
      },
    })

    if($scope.event.isPublic == undefined){
      console.log("Entre");
      $scope.event.isPublic = false;
    }



    $scope.createEvent = function() {
      
      // Url where the post request is sent
      var uploadURL = '/api/events';



      // the author of the event is not a field of the form, so we add
      // this information as a new attribute of the event object
      $scope.event.author = $scope.auth.getUser().username;
      
      // we use the service multipartForm to make the post request, with 
      // the event object, which contains all informations to create a new 
      // event
      multipartForm.post(uploadURL, $scope.event);
        
    };
}]);



myApp.controller('updateEventCtrl', ['$scope', '$http', '$routeParams', '$location', '$rootScope', 'eventLocation',
  function($scope, $http, $routeParams, $location, $rootScope, eventLocation) {  
    
    // get all infos about the event we want to modify, so the input can be set
    $http.get('/api/events/' + $routeParams.id)
      .success(function(data) {
        $scope.event = data;
        // date is stored as string in database, that is why we need to convert 
        // it to a date
        $scope.event.date = new Date($scope.event.date);

          var dateToDisable = new Date();

          $('#date').datetimepicker({value: $scope.event.date});
          $.datetimepicker.setLocale('fr');
          $('#date').datetimepicker({
            beforeShowDay: function(date) {
              if (date.getMonth() <= dateToDisable.getMonth() && date.getDate() < dateToDisable.getDate()) {
                return [false, ""]
              }
                if (date.getYear() < dateToDisable.getYear()) {
                  return [false, ""]
                }
              return [true, ""];
            },
            format:'d.m.Y H:i',
            onClose: function (dateText) {
              $scope.event.date = dateText;
              $('#date').datetimepicker({value: dateText});
            }
          })

        // set the location data into the service so the googleController can
        // access it. Use the broadcast to prevent the googleController that
        // the data are set
        eventLocation.setData($scope.event.address, $scope.event.latitude, $scope.event.longitude);
        $rootScope.$broadcast('dataReady');
      })
      .error(function(data) {
        console.log('Error: ' + data);
      });
      
    $scope.updateEvent = function() {
      
      $http.put('/api/events/' + $routeParams.id, $scope.event)
        .success(function(data) {
          // if the event is updated, redirect the user to this event page
          $location.path('/events/' + $routeParams.id);
        })
        .error(function(data) {
          console.log('Error: ' + data);
        });
    };
    
}]);
    
    
myApp.controller('getOneEventCtrl', ['$scope', '$http', '$routeParams', '$location', '$rootScope', 'eventLocation',

  function($scope, $http, $routeParams, $location, $rootScope, eventLocation) {  
    
    // used to debug -> print the id of the event we access
    // console.log($routeParams.id);
    
    $http.get('/api/events/' + $routeParams.id)
      .success(function(data) {
        $scope.event = data;
        // set the location data into the service so the googleController can
        // access it. Use the broadcast to prevent the googleController that
        // the data are set
        eventLocation.setData($scope.event.address, $scope.event.latitude, $scope.event.longitude);
        $rootScope.$broadcast('dataReady');
        
        // the variable showDelete is true if the user logged in is the event's author
        if ($scope.auth.getUser().username === undefined) {
          // user is not connected so the variable are false
          $scope.showDelete = false;
          $scope.isRegistered = false;
        }
        else {
          $scope.showDelete = $scope.auth.getUser().username === $scope.event.author;
          
          /* if the user is not in the participants list, the variable
           * isRegistered is false and the user can register for the event.
           * Otherwise, it is true and the user can unregister for the event */
          if ($scope.event.participants.indexOf($scope.auth.getUser().username) == -1) {
            $scope.isRegistered = false;
          }
          else {
            $scope.isRegistered = true;
          }
        }

        /* Gallery*/
        $scope.gallery = [];
        $scope.gallery.pictures = [];
        $scope.event.picturesPath.forEach(function (picturePath, index) {
          $scope.gallery.pictures.push({ id: picturePath,
                                thumb: 'uploads/pictures/' + picturePath,
                                img: 'uploads/pictures/' + picturePath
                              });
        });
        
        // used to debug : print in the browser console the events returned
        //console.log(data);
      })
      .error(function(data) {
        console.log('Error: ' + data);
      });
      
    $scope.deleteEvent = function(event) {
      $http.delete('/api/events/' + $routeParams.id + '/' + $scope.auth.getUser().username)
        .success(function(data) {
          console.log(data);
           // once the event is deleted, redirect user to allEvents page
          $location.path('/events/');
        })
        .error(function(data) {
          console.log('Error: ' + data);
        });
    };
    
    /* I use the same function to register and unregister. The difference is 
     * made thanks to the variable wantToregister. */
    $scope.registerForEvent = function(wantToRegister) {
      
      if (wantToRegister) {
        $http.post('/api/events/' + $routeParams.id + '/' + $scope.auth.getUser().username)
            .success(function() {
              // console.log('It worked');

              // Add the user into the particpant list in the page
              $scope.event.participants.push($scope.auth.getUser().username);
              // Set the variable to true so the user can no longer register
              $scope.isRegistered = true;
            })
      }
      
      else {
        $http.put('/api/events/' + $routeParams.id + '/' + $scope.auth.getUser().username)
          .success(function(data) {
            // console.log('I get out!');
            
            // Remove the user from the participant list in the event page
            $scope.event.participants.splice(data.index, 1);
            // Set the variable to false so the user can register again
            $scope.isRegistered = false;
          })
      }
    };
    
    $scope.searchUser = function() {
      // only do a server request if field not empty
      if ($scope.nameQuery) {
        $http.get('/user/getUsers/' + $scope.event.author + 
                  '/' + $scope.nameQuery +
                  '/' + $scope.event._id)
          .success(function(data) {
            $scope.results = data;
            
            // variable to tell the user that nothing was found
            if (data.length == 0)
              $scope.results.message = "Aucun utilisateur de ce nom.";
            
            // Used to debug : print all user on the browser console
            // console.log(data);
            })
            .error(function(data) {
              console.log('Error: ' + data);
            });
      }
    };
    
    $scope.addComment = function() {

      var author;
      
      // set the author to anonyme if the user is not connected
      if (typeof $scope.auth.getUser().username != 'undefined')
        author = $scope.auth.getUser().username;
      else
        author = 'Anonyme';
        
      $http.post('/api/events/'+$scope.event._id+'/comment',{message : $scope.message, user : author})
        .success(function() {

          // add comment to current page
          var tmp = {'message': $scope.message, 'author': author};
          $scope.event.comments.push(tmp);
          $scope.message = "";
        });
    };
    
    $scope.sendInvitation = function(recipient) {
      
      $http.post('/user/sendInvitation/' + recipient.username + 
                 '/' + $scope.auth.getUser().username +
                 '/' + $scope.event._id + 
                 '/' + $scope.event.name )
        .success(function() {
          // set the variable to true so we cannot re-invite the same user
          recipient.alreadyInvited = true;
          $scope.results.message = recipient.username + " a été invité à l'événement.";
        });
      
    };
    
}]);


myApp.controller('getMyEventsCtrl', ['$scope', '$http', 
  function($scope, $http) {  
    
    // the route /myevents is restricted so we are sure that .getUser().username
    // is not null
    $http.get('/api/events_of/' + $scope.auth.getUser().username)
      .success(function(data) {
        $scope.events = data;
      })
      .error(function(data) {
        console.log('Error: ' + data);
      });
}]);

myApp.controller('getMyInvitationsCtrl', ['$scope', '$http', 
  function($scope, $http) {  
    
    /* the route /mynotifications is restricted so we are sure that 
     * .getUser().username is not null */
    $http.get('/user/invitations_of/' + $scope.auth.getUser().username)
      .success(function(data) {
        $scope.invitations = data.notifications;
      })
      .error(function(data) {
        console.log('Error: ' + data);
      });
}]);


myApp.controller('uploadFilesCtrl', ['$scope',
  function ($scope) {

    $scope.uploadFiles = function() {
        $scope.processDropzone();
    };

    $scope.reset = function() {
        $scope.resetDropzone();
    };

  }
]);
