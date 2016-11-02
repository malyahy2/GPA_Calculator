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

.controller('gradebooksCtrl', function($scope, $state, AppManager, GradebookManager, $ionicActionSheet, $ionicPopup) {
  $scope.gradebooksList = AppManager.getGradebooks();
  $scope.data = {};
  // AppManager.printList($scope.gradebooksList, "gradebooksCtrl - After:");

  $scope.createGradebook = function() {
    $scope.showPopup("create");
    //var newGradebook = AppManager.createGradebook("Testing Gradebook");
    //GradebookManager.updateName(newGradebook.id, "Gradebook "+newGradebook.id.slice(newGradebook.id.indexOf("_")+1));
  }

  $scope.goToGradebook = function(gradebookID) {
    //console.log("this item was clicked: " + gradebookID);
    $state.go('gradebook', {id: gradebookID});
  }

  // var myPopup = $ionicPopup.show({
  //   template: '<input type="text" ng-model="newName">',
  //   title: 'Enter New Name',
  //   scope: $scope,
  //   buttons: [
  //     { text: 'Cancel' },
  //     {
  //       text: '<b>Save</b>',
  //       type: 'button-positive',
  //       onTap: function(e) {
  //         if (!$scope.newName) {
  //           //don't allow the user to close unless he enters wifi password
  //           e.preventDefault();
  //         } else {
  //           console.log($scope.newName);
  //           return $scope.newName;
  //         }
  //       }
  //     }
  //   ]
  // });
    //  $scope.newName = "";
  $scope.showPopup = function(action, gradebookID) {

     // An elaborate, custom popup
     var myPopup = $ionicPopup.show({
       template: '<input type="text" ng-model="data.value">',
       title: 'Enter New Name',
       scope: $scope,
       buttons: [
         { text: 'Cancel' },
         {
           text: '<b>Save</b>',
           type: 'button-positive',
           onTap: function() {
             if (!$scope.data.value) {
               //don't allow the user to close unless he enters wifi password
               console.log($scope.data.value);
               //e.preventDefault();
             } else {
               console.log($scope.data.value);
               return { id: gradebookID, newName: $scope.data.value};
             }
           }
         },
       ]
     });
     myPopup.then(function(res) {
       if(action == "update")
        GradebookManager.updateName(res.id, res.newName);
      else if(action == "create")
        AppManager.createGradebook(res.newName);
       console.log('Tapped!', res);
     });
    //  $timeout(function() {
    //     myPopup.close(); //close the popup after 3 seconds for some reason
    //  }, 3000);
  };


  $scope.show = function(gradebookID) {
     var hideSheet = $ionicActionSheet.show({
       buttons: [
         { text: 'Rename' },
         { text: 'Copy'}
       ],
       destructiveText: 'Delete',
       titleText: 'Gradebook Options',
       cancelText: 'Cancel',
       destructiveButtonClicked: function() {
         GradebookManager.deleteGradebook(gradebookID);
       },
       cancel: function() {
            // add cancel code..
          },
       buttonClicked: function(index, button) {
         console.log(button);
         if(index == 0){
           $scope.showPopup("update", gradebookID);
         } else if(index == 1) {
           GradebookManager.copyGradebook(gradebookID);
         }
         return true;
       }
     });

     // For example's sake, hide the sheet after two seconds
    //  $timeout(function() {
    //    hideSheet();
    //  }, 2000);
   };

})

.controller('gradebookCtrl', function($scope, $state, $stateParams, GradebookManager, TermManager, $ionicActionSheet, $ionicPopup) {
  $scope.currentGradebook = GradebookManager.getGradebook($stateParams.id);
  //console.log("gradebookCtrl ID: "+$scope.currentGradebook.id);
  $scope.termsList = GradebookManager.getTerms($scope.currentGradebook.id);
  $scope.data = {};
  //console.log("gradebookCtrl termsList length: "+$scope.termsList.length);
  // var termsIDs = "gradebookCtrl Terms List: ";
  // for(var i=0; i<$scope.termsList.length; i++){
  //   termsIDs +=$scope.termsList[i].id;
  // }
  //console.log(termsIDs);

  var updatePageList = function(){
    $scope.termsList = GradebookManager.getTerms($scope.currentGradebook.id);
  }

  $scope.createTerm = function() {
    $scope.showPopup("create", $scope.currentGradebook.id);
    // var newTerm = GradebookManager.createTerm($scope.currentGradebook.id, "Testing Term");
    // TermManager.updateName(newTerm.id, "Term "+newTerm.id.slice(newTerm.id.indexOf("_")+1));
    updatePageList();
    //console.log("createTerm termsList length: "+$scope.termsList.length);
    // var termsIDs2 = "createTerm Terms List: ";
    // for(var i=0; i<$scope.termsList.length; i++){
    //   termsIDs2 +=$scope.termsList[i].id;
    // }
    //console.log(termsIDs2);
  }

  $scope.goToTerm = function(termID) {
    //console.log("this item was clicked: " + termID);
    $state.go('term', {id: termID});
  }

  $scope.showPopup = function(action, termID) {

     // An elaborate, custom popup
     var myPopup = $ionicPopup.show({
       template: '<input type="text" ng-model="data.value">',
       title: 'Enter New Name',
       scope: $scope,
       buttons: [
         { text: 'Cancel' },
         {
           text: '<b>Save</b>',
           type: 'button-positive',
           onTap: function() {
             if (!$scope.data.value) {
               //don't allow the user to close unless he enters wifi password
               console.log($scope.data.value);
               //e.preventDefault();
             } else {
               console.log($scope.data.value);
               return { id: termID, newName: $scope.data.value};
             }
           }
         },
       ]
     });
     myPopup.then(function(res) {
       if(action == "update")
        TermManager.updateName(res.id, res.newName);
      else if(action == "create") {
        GradebookManager.createTerm(termID, res.newName);
        updatePageList();
      }
       console.log('Tapped!', res);
     });
    //  $timeout(function() {
    //     myPopup.close(); //close the popup after 3 seconds for some reason
    //  }, 3000);
  };


  $scope.show = function(termID) {
     var hideSheet = $ionicActionSheet.show({
       buttons: [
         { text: 'Rename' },
         { text: 'Copy'},
         { text: 'Move'}
       ],
       destructiveText: 'Delete',
       titleText: 'Term Options',
       cancelText: 'Cancel',
       destructiveButtonClicked: function() {
         TermManager.deleteTerm(termID);
         updatePageList();
         return true;
       },
       cancel: function() {
            // add cancel code..
          },
       buttonClicked: function(index, button) {
         console.log(button);
         if(index == 0){
           $scope.showPopup("update", termID);
         } else if(index == 1) {
           GradebookManager.copyTerm(termID);
           updatePageList();
         }
         return true;
       }
     });

     // For example's sake, hide the sheet after two seconds
    //  $timeout(function() {
    //    hideSheet();
    //  }, 2000);
   };
})

.controller('termCtrl', function($scope, $state, $stateParams, TermManager, CourseManager, GradingScaleManager, AppManager, $ionicActionSheet, $ionicPopup) {
  $scope.currentTerm = TermManager.getTerm($stateParams.id);
  //console.log("gradebookCtrl ID: "+$scope.currentGradebook.id);
  $scope.coursesList = TermManager.getCourses($scope.currentTerm.id);
  $scope.data = {};

  $scope.termGPA = null;
  $scope.termHours = null;
  $scope.cumulGPA = null;
  $scope.cumulHours = null;

  var updateCalc = function(){
    $scope.termGPA = $scope.currentTerm.GPA;
    $scope.termHours = $scope.currentTerm.hours;
    $scope.cumulGPA = AppManager.getParentObject($scope.currentTerm.id).GPA;
    $scope.cumulHours = AppManager.getParentObject($scope.currentTerm.id).hours;
  }

  updateCalc();

  $scope.selectedGrade = null;
  $scope.inputHours = null;

  $scope.gradingScaleList = GradingScaleManager.getAssociatedGradingScale(AppManager.getParentObject($scope.currentTerm.id).id).grades;
  // console.log("termCtrl gradingScaleList length: "+$scope.gradingScaleList.length);
  // var termsIDs = "termCtrl gradingScaleList : ";
  // for(var i=0; i<$scope.gradingScaleList.length; i++){
  //   termsIDs +=$scope.gradingScaleList[i].points +", ";
  // }
  // console.log(termsIDs);

  $scope.updateGrade = function(courseID, newGrade) {
    console.log("changed Grade for: "+courseID+" to: "+newGrade);
    CourseManager.updateGrade(courseID,newGrade);
    updateCalc();
  }

  $scope.updateHours = function(courseID, newHours) {
    console.log("changed Hours for: "+courseID+" to: "+newHours);
    CourseManager.updateHours(courseID,newHours);
    updateCalc();
  }

  var updatePageList = function(){
    $scope.coursesList = TermManager.getCourses($scope.currentTerm.id);
  }

  $scope.createCourse = function() {
    $scope.showPopup("create", $scope.currentTerm.id);
    updatePageList();
    // var newCourse = TermManager.createCourse($scope.currentTerm.id, "Testing Course");
    // CourseManager.updateName(newCourse.id, "Course "+newCourse.id.slice(newCourse.id.indexOf("_")+1));
    $scope.coursesList = TermManager.getCourses($scope.currentTerm.id);
    //console.log("createTerm termsList length: "+$scope.termsList.length);
    // var termsIDs2 = "createTerm Terms List: ";
    // for(var i=0; i<$scope.termsList.length; i++){
    //   termsIDs2 +=$scope.termsList[i].id;
    // }
    //console.log(termsIDs2);
  }

  $scope.showPopup = function(action, courseID) {

     // An elaborate, custom popup
     var myPopup = $ionicPopup.show({
       template: '<input type="text" ng-model="data.value">',
       title: 'Enter New Name',
       scope: $scope,
       buttons: [
         { text: 'Cancel' },
         {
           text: '<b>Save</b>',
           type: 'button-positive',
           onTap: function() {
             if (!$scope.data.value) {
               //don't allow the user to close unless he enters wifi password
               console.log($scope.data.value);
               //e.preventDefault();
             } else {
               console.log($scope.data.value);
               return { id: courseID, newName: $scope.data.value};
             }
           }
         },
       ]
     });
     myPopup.then(function(res) {
       if(action == "update")
        TermManager.updateName(res.id, res.newName);
      else if(action == "create") {
        GradebookManager.createTerm(courseID, res.newName);
        updatePageList();
      }
       console.log('Tapped!', res);
     });
    //  $timeout(function() {
    //     myPopup.close(); //close the popup after 3 seconds for some reason
    //  }, 3000);
  };


  $scope.show = function(courseID) {
     var hideSheet = $ionicActionSheet.show({
       buttons: [
         { text: 'Rename' },
         { text: 'Copy'},
         { text: 'Move'}
       ],
       destructiveText: 'Delete',
       titleText: 'Term Options',
       cancelText: 'Cancel',
       destructiveButtonClicked: function() {
         CourseManager.deleteCourse(courseID);
         updatePageList();
         return true;
       },
       cancel: function() {
            // add cancel code..
          },
       buttonClicked: function(index, button) {
         console.log(button);
         if(index == 0){
           $scope.showPopup("update", courseID);
         } else if(index == 1) {
           CourseManager.copyCourse(courseID);
           updatePageList();
         }
         return true;
       }
     });

     // For example's sake, hide the sheet after two seconds
    //  $timeout(function() {
    //    hideSheet();
    //  }, 2000);
   };
});
