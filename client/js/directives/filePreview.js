myApp.directive('ngFilePreview', [function() {
  return {
    link: function($scope, element, attrs) {

      element.bind('change', function (e) {
        $scope.filePreview = (e.srcElement || e.target).files[0];

        var reader = new FileReader();
        reader.onload = function(e1) {
          $scope.$apply(function() {
            $scope.coverPreview = reader.result;
          });
        };

        reader.readAsDataURL($scope.filePreview);

      })
    }
  }
}]);
