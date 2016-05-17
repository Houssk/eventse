myApp.controller('mapSingleEventCtrl', ['$scope', 'eventLocation', 
  function($scope, eventLocation){
    
    // we wait until the eventController get the event and set the 
    // location data.
    $scope.$on('dataReady', function() {
      var eventData = eventLocation.getData();
      var myLatlng = new google.maps.LatLng(eventData.latitude,eventData.longitude);
      var mapOptions = {
                zoom: 15,
                center: myLatlng,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
      var map = new google.maps.Map(document.getElementById('map'), mapOptions)
      var marker = new google.maps.Marker({position: myLatlng});
      
      marker.setMap(map); // add the marker to the map
      marker.setAnimation(google.maps.Animation.BOUNCE);
            
    });
}])


myApp.controller('MyCtrl', ['$scope','$http',
 function($scope,$http) {
     $http.get('/api/events/')
         .success(function(data) {
  // initialise the map and center it on Paris
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 48.85661400000001, lng: 2.3522219000000177},
    zoom: 15,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });
  // Create the search box and link it to the UI element.
  var input = document.getElementById('pac-input');
  var searchBox = new google.maps.places.SearchBox(input);

  var marker = new google.maps.Marker({
      position: {lat: 48.85661400000001, lng: 2.3522219000000177},
  });
  // To add the marker to the map, call setMap();
  marker.setMap(null);
  marker.setMap(map);
  $scope.event.latitude = marker.getPosition().lat();
  $scope.event.longitude = marker.getPosition().lng();

     var pos = {
         lat: marker.getPosition().lat(),
         lng: marker.getPosition().lng()
     };
     var geocoder = new google.maps.Geocoder;
     geocoder.geocode({'location': pos}, function (results) {
         $scope.event.address   = results[0].formatted_address;
         input.value = results[0].formatted_address;
     });



     navigator.geolocation.getCurrentPosition(function (position) {
      var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
      };
      map.setCenter(pos);

      marker.setPosition(pos);
      // To add the marker to the map, call setMap();
      marker.setMap(null);
      marker.setMap(map);
      $scope.event.latitude  = marker.getPosition().lat();
      $scope.event.longitude = marker.getPosition().lng();

         var pos = {
             lat: marker.getPosition().lat(),
             lng: marker.getPosition().lng()
         };
         var geocoder = new google.maps.Geocoder;
         geocoder.geocode({'location': pos}, function (results) {
             $scope.event.address   = results[0].formatted_address;
             input.value = results[0].formatted_address;
         });

     })

  map.addListener('click', function(e){
    marker.setMap(null);
    marker = new google.maps.Marker({
      position: e.latLng,
      map: map
    });

    /* This happens when we click on the map
     *  -> set the latitude and longitude  of the event */
    $scope.event.latitude  = marker.getPosition().lat();
    $scope.event.longitude = marker.getPosition().lng();

      var pos = {
          lat: marker.getPosition().lat(),
          lng: marker.getPosition().lng()
      };
      var geocoder = new google.maps.Geocoder;
      geocoder.geocode({'location': pos}, function (results) {
          $scope.event.address   = results[0].formatted_address;
          input.value = results[0].formatted_address;
      });
  });


  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();
    if (places.length == 0) {
      return;
    }
    // For each place, get name and location.
    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {
      marker.setMap(null);
      marker = new google.maps.Marker({
        position: place.geometry.location,
        map: map
      });

      /* This happens when I hit enter on the search box or I
       * click on one of the suggestion
       *  -> set the longitude and latitude of the event. The address of
       *     the event is the one in the search box (binded via ng-model
       *     in eventCreate.html */
      $scope.event.latitude  = marker.getPosition().lat();
      $scope.event.longitude = marker.getPosition().lng();

        var pos = {
            lat: marker.getPosition().lat(),
            lng: marker.getPosition().lng()
        };
        var geocoder = new google.maps.Geocoder;
        geocoder.geocode({'location': pos}, function (results) {
            $scope.event.address   = results[0].formatted_address;
        });


        if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
  });
 })
}]);


myApp.controller('mapUpdateEventCtrl', ['$scope','eventLocation',
  function($scope, eventLocation) {
    
    // we wait until the eventController get the event and set the 
    // location data.
    $scope.$on('dataReady', function() {
      var eventData = eventLocation.getData();
      var myLatlng = new google.maps.LatLng(eventData.latitude,eventData.longitude);
      var mapOptions = {
              zoom: 15,
              center: myLatlng,
              mapTypeId: google.maps.MapTypeId.ROADMAP
          };
          
      var input = document.getElementById('pac-input');
      var searchBox = new google.maps.places.SearchBox(input);
      var map = new google.maps.Map(document.getElementById('map'), mapOptions);
      var marker = new google.maps.Marker({position: myLatlng});
      var geocoder = new google.maps.Geocoder;
      var bounds = new google.maps.LatLngBounds();
      
      // link searchbox to the map
      map.controls[google.maps.ControlPosition.TOP_LEFT].push(input); 
      marker.setMap(map); // add the marker to the map

      
      /* The listener which listen to every click on the map */
      map.addListener('click', function (e) {
        // Set the position of the marker where we clicked
        marker.setPosition(e.latLng);
        
        /* This happens when we click on the map
         *  -> set the latitude and longitude  of the event */
        $scope.event.latitude = marker.getPosition().lat();
        $scope.event.longitude = marker.getPosition().lng();
       
        // Find the address of the position and set it to the address attribute
        geocoder.geocode({'location': marker.position}, function (results) {
          $scope.event.address = results[0].formatted_address;
          input.value = $scope.event.address; // update the value of searchbox
        });
      });
      
      
      /* The listener which retrieve places based on the input in Searchbox */
      searchBox.addListener('places_changed', function () {
        var places = searchBox.getPlaces();
        if (places.length == 0) {
            return;
        }
        // For each place, get name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
          marker.setMap(null);
          marker = new google.maps.Marker({
            position: place.geometry.location,
            map: map
          });
 
          /* This happens when I hit enter on the search box or I
           * click on one of the suggestion
           *  -> set the longitude and latitude of the event. The address is
           *     found thanks to the geocode */
          $scope.event.latitude = marker.getPosition().lat();
          $scope.event.longitude = marker.getPosition().lng();
          
          geocoder.geocode({'location': marker.position}, function (results) {
            $scope.event.address = results[0].formatted_address;
          });
          
          /* Extend the bound if the place is not on the viewport or move
           * it if the event is in the viewport but not centered */
          if (place.geometry.viewport) {
            bounds.union(place.geometry.viewport);
          } else {
            bounds.extend(place.geometry.location);
          }
        });
        // Move the viewport on the marker
        map.fitBounds(bounds);
      });


    });
}]);


myApp.controller('mapEventsCtrl', ['$http',
    function($http){
      $http.get('/api/events/')
        .success(function(data) {
          var markers = [];
          var marker, infowindow, i;
          var map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 48.85661400000001, lng: 2.3522219000000177},
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          });

          // Create the search box and link it to the UI element.
          var input = document.getElementById('pac-input');
          var searchBox = new google.maps.places.SearchBox(input);

          var pos = {
            lat: 48.85661400000001,
            lng: 2.3522219000000177
          };

          var geocoder = new google.maps.Geocoder;
          geocoder.geocode({'location': pos}, function (results) {
            input.value = results[0].formatted_address;
          });

          for (i = 0; i < data.length; i++) {
            // Create a new marker
            marker = new google.maps.Marker({
              position: new google.maps.LatLng(data[i].latitude, data[i].longitude),
              map: map,
              title: data[i].address
            });

            infowindow = new google.maps.InfoWindow();
            // Add the marker to a global array for filtering
            markers.push(marker);

            google.maps.event.addListener(marker, 'click', (function(marker, i) {
              return function() {
                infowindow.setContent('<div class="container-single-event">' +
                    '<div class = "row">' +
                   // '<div class="container-event" >' +
                    '<a href=' + "#/events/" + data[i]._id + '>' +
                    '<div class="container-img">' +
                    '<img src=' + "uploads/covers/" + data[i].coverPath + ' />' +
                    '</a>' +
                    '</div>' +
                    '</div>' +
                    '<h1>' + data[i].name + '</h1>' +
                    '<h3>' + 'by ' + data[i].author + '</h3>' +
                    '</div>'
                );

                infowindow.open(map, marker);
              }
            })(marker, i));
          }

          navigator.geolocation.getCurrentPosition(function (position) {
            var pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            map.setCenter(pos);
            geocoder = new google.maps.Geocoder;
            geocoder.geocode({'location': pos}, function (results) {
            input.value = results[0].formatted_address;
            });
          })

          // link searchbox to the map
          map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

          /* The listener which retrieve places based on the input in Searchbox */
          searchBox.addListener('places_changed', function () {
            var places = searchBox.getPlaces();
            // For each place, get name and location.
            var bounds = new google.maps.LatLngBounds();
            if (places.length == 0) {
              return;
            }

            // Find position and address of each places
            places.forEach(function (place) {
              if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
              } else {
                bounds.extend(place.geometry.location);
              }
            });
              map.fitBounds(bounds);
          });
        })
    }]);
