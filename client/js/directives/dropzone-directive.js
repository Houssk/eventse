myApp.directive('dropzone',['$routeParams', '$http', function($routeParams, $http) {
  return {
    restrict: 'C',
    link: function(scope, element, attrs) {
      var config = {
        url: '/api/events/' + $routeParams.id,
        method: 'post',
        maxFilesize: 100,
        paramName: 'picture',
        acceptedFiles: '.jpg,.jpeg,.JPEG,.JPG,.png,.PNG',
        maxThumbnailFilesize: 10,
        parallelUploads: 1,
        autoProcessQueue: false,
        addRemoveLinks: true
      };

      dropzone = new Dropzone(element[0], config); // element[0] == "form#dropzone"

      //Permet de lancer les uploads les uns apres les autres en fonction du parallelUpload
      dropzone.on("complete", function(file) {
        if(dropzone.getQueuedFiles().length > 0) {
          dropzone.processQueue();
        }

        //Delete uploaded picture from dropzone
        setTimeout(function() {
          dropzone.removeFile(file);
        }, 1000);

        //Update picture gallery
        $http.get('/api/events/' + $routeParams.id)
        .success(function(data) {
          scope.gallery.pictures = [];
          data.picturesPath.forEach(function (picturePath, index) {
            scope.gallery.pictures.push({ id: picturePath,
                                  thumb: 'uploads/pictures/' + picturePath,
                                  img: 'uploads/pictures/' + picturePath
                                });
          });
          })
          .error(function(data) {
            console.log('Error: ' + data);
          });
      });

      //Lancer les premiers uploads
      scope.processDropzone = function() {
        dropzone.processQueue();
      }

      //Reset la liste des uploads
      scope.resetDropzone = function() {
        dropzone.removeAllFiles();
      }
    }
  }
}]);