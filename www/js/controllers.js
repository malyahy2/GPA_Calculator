angular.module('gpaCalc.controllers', [])

.controller('loadingCtrl', function($scope, $state, $ionicPlatform, HomeReference) {
  $scope.loadingComplete = false;

  var loadHome = function() {
    $state.go(HomeReference.getHome());
  }

  $ionicPlatform.ready(function() {
    $scope.loadingComplete = true;
    loadHome();
  });

})

.controller('gradebooksCtrl', function($scope, $state, AppManager) {
  $scope.gradebooksList = AppManager.getGradebooks();
  console.log($scope.gradebooksList);

  $scope.createGradebook = function() {
    var newGradebook = AppManager.createGradebook("Testing Gradebook");
    $scope.gradebooksList = AppManager.getGradebooks();
    console.log($scope.gradebooksList);
  }

});
