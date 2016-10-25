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
  
});
