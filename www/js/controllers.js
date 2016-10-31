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
  AppManager.printList($scope.gradebooksList, "gradebooksCtrl - After:");

  $scope.createGradebook = function() {
    AppManager.createGradebook("Testing Gradebook");
  }

  $scope.displayID = function(itemID) {
    console.log("this item was clicked: " + itemID);
  }

});
