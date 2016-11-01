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

.controller('gradebooksCtrl', function($scope, $state, AppManager, GradebookManager) {
  $scope.gradebooksList = AppManager.getGradebooks();
  AppManager.printList($scope.gradebooksList, "gradebooksCtrl - After:");

  $scope.createGradebook = function() {
    var newGradebook = AppManager.createGradebook("Testing Gradebook");
    GradebookManager.updateName(newGradebook.id, "Gradebook "+newGradebook.id.slice(newGradebook.id.indexOf("_")+1));
  }

  $scope.goToGradebook = function(gradebookID) {
    //console.log("this item was clicked: " + gradebookID);
    $state.go('gradebook', {id: gradebookID});
  }

})

.controller('gradebookCtrl', function($scope, $state, $stateParams, GradebookManager, TermManager) {
  $scope.currentGradebook = GradebookManager.getGradebook($stateParams.id);
  //console.log("gradebookCtrl ID: "+$scope.currentGradebook.id);
  $scope.termsList = GradebookManager.getTerms($scope.currentGradebook.id);
  //console.log("gradebookCtrl termsList length: "+$scope.termsList.length);
  var termsIDs = "gradebookCtrl Terms List: ";
  for(var i=0; i<$scope.termsList.length; i++){
    termsIDs +=$scope.termsList[i].id;
  }
  //console.log(termsIDs);

  $scope.createTerm = function() {
    var newTerm = GradebookManager.createTerm($scope.currentGradebook.id, "Testing Term");
    TermManager.updateName(newTerm.id, "Term "+newTerm.id.slice(newTerm.id.indexOf("_")+1));
    $scope.termsList = GradebookManager.getTerms($scope.currentGradebook.id);
    //console.log("createTerm termsList length: "+$scope.termsList.length);
    var termsIDs2 = "createTerm Terms List: ";
    for(var i=0; i<$scope.termsList.length; i++){
      termsIDs2 +=$scope.termsList[i].id;
    }
    //console.log(termsIDs2);
  }

  $scope.goToTerm = function(termID) {
    //console.log("this item was clicked: " + termID);
    $state.go('term', {id: termID});
  }
})

.controller('termCtrl', function($scope, $state, $stateParams, TermManager, CourseManager) {
  $scope.currentTerm = TermManager.getTerm($stateParams.id);
  //console.log("gradebookCtrl ID: "+$scope.currentGradebook.id);
  $scope.coursesList = TermManager.getCourses($scope.currentTerm.id);
  //console.log("gradebookCtrl termsList length: "+$scope.termsList.length);
  // var termsIDs = "gradebookCtrl Terms List: ";
  // for(var i=0; i<$scope.termsList.length; i++){
  //   termsIDs +=$scope.termsList[i].id;
  // }
  //console.log(termsIDs);

  $scope.createCourse = function() {
    var newCourse = TermManager.createCourse($scope.currentTerm.id, "Testing Course");
    CourseManager.updateName(newCourse.id, "Course "+newCourse.id.slice(newCourse.id.indexOf("_")+1));
    $scope.coursesList = TermManager.getCourses($scope.currentTerm.id);
    //console.log("createTerm termsList length: "+$scope.termsList.length);
    // var termsIDs2 = "createTerm Terms List: ";
    // for(var i=0; i<$scope.termsList.length; i++){
    //   termsIDs2 +=$scope.termsList[i].id;
    // }
    //console.log(termsIDs2);
  }
});
