angular.module('gpaCalc.controllers', [])

.controller('loadingCtrl', function($scope, $state, $ionicPlatform, $ionicHistory, HomeReference) {
  $scope.loadingComplete = false;
  var loadHome = function() {
    var currentHome = HomeReference.getHome();
    $ionicHistory.nextViewOptions({
       historyRoot: true
    });
    if(currentHome.stateParams != null) {
      $state.go(currentHome.state, {id: currentHome.stateParams});
    } else {
      $state.go(currentHome.state);
    }
  }

  $ionicPlatform.ready(function() {
    $scope.loadingComplete = true;
    loadHome();
  });

})

.controller('settingsCtrl', function($scope, $state, HomeReference, SettingsReference, GradingScaleManager, $ionicPopup, $ionicHistory, $window) {
  $scope.goHome = function() {
    var currentHome = HomeReference.getHome();
    if(currentHome.stateParams != null)
      $state.go(currentHome.state, {id: currentHome.stateParams});
    else
      $state.go(currentHome.state);
  }

  $scope.deleteEverything = function() {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Deleting All Data',
      template: 'Are you sure you want to delete everything?'
    });

    confirmPopup.then(function(res) {
      if(res) {
        SettingsReference.deleteEverything();
        $state.go("gradebooks");
          $ionicHistory.clearHistory();
          setTimeout(function (){
                 $window.location.reload(true);
          }, 100);
      } else {
        console.log('Decided not to delete everything');
      }
    });
  }

  $scope.autoFillNames = SettingsReference.useDefaultNames();
  $scope.scaleOptions = [false, false, false, false];
  var gradingScaleIndex = SettingsReference.getGradingScaleOptionIndex();
  $scope.scaleOptions[gradingScaleIndex] = true;

  $scope.autoFillClicked = function() {
    $scope.autoFillNames = !$scope.autoFillNames;
    SettingsReference.setDefaultNamesUsage($scope.autoFillNames);
  };

  $scope.gradingScaleOptionClicked = function(clickedIndex) {
    $scope.scaleOptions = [false, false, false, false];
    $scope.scaleOptions[clickedIndex] = true;
    SettingsReference.setGradingScaleOptionIndex(clickedIndex);
    if(clickedIndex == 0){
      GradingScaleManager.setDefaultGradingScale_A();
    } else if(clickedIndex == 1){
      GradingScaleManager.setDefaultGradingScale_APlus();
    } else if(clickedIndex == 2){
      GradingScaleManager.setDefaultGradingScale_Traditional();
    } else if(clickedIndex == 3){
      $state.go('gpaScale');
    }
  };

  var colorSchemeArray = ['#218D9B', '#ad001c', '#f7a102'];
  var colorIndex = 0;
  $scope.colorScheme = colorSchemeArray[colorIndex];

  $scope.changeColorScheme = function() {
    colorIndex++;
    if(colorIndex == colorSchemeArray.length)
      colorIndex = 0;
    $scope.colorScheme = colorSchemeArray[colorIndex];
  };
})

.controller('gpaScaleCtrl', function($scope, $state, GradingScaleManager) {
  $scope.gradesList = GradingScaleManager.getGradingScale();
  $scope.updateName = function(gradeID, newName) {
    GradingScaleManager.updateGradeName(gradeID, newName);
  }
  $scope.updatePoints = function(gradeID, newPoints) {
    GradingScaleManager.updateGradePoints(gradeID, newPoints);
  }
  $scope.createGrade = function() {
    GradingScaleManager.createGrade();
  }
  $scope.deleteGrade = function(gradeID) {
    GradingScaleManager.deleteGrade(gradeID);
  }
  $scope.goBack = function() {
    $state.go('settings');
  }
})


.controller('gradebooksCtrl', function($scope, $state, AppManager, HomeReference, SettingsReference, $ionicPopover, GradebookManager, $ionicPopup) {
  $scope.gradebooksList = AppManager.getGradebooks();
  $scope.data = {};
  $scope.settingsButtonClicked = false;

  $scope.settingsButtons = [
    {name: "Settings", icon: "ion-android-settings", onClick:"goTo('settings')"}
    // {name: "Gradebooks List", icon: "ion-android-more-vertical", onClick:"doMethod('Gradebooks List')"},
    // {name: "Set Home", icon: "ion-plus-round", onClick:"doMethod('Set Home')"},
    // {name: "New Gradebook", icon: "ion-ios-arrow-right", onClick:"doMethod('New Gradebook')"},
    // {name: "New Term", icon: "ion-android-more-vertical", onClick:"doMethod('New Term')"},
    // {name: "What If", icon: "ion-plus-round", onClick:"doMethod('What If')"},
    // {name: "Set Initial GPA", icon: "ion-ios-arrow-right", onClick:"doMethod('Set Initial GPA')"},
    // {name: "Set Grading Scale", icon: "ion-android-more-vertical", onClick:"doMethod('GS')"},
    // {name: "Huhh", icon: "ion-plus-round", onClick:"doMethod('Huhh')"}
  ];

  var currentHome = HomeReference.getHome();
  if(currentHome.state != 'gradebooks'){
    var goHome = {name: "Home", icon:"ion-android-home", onClick:"goTo('"+currentHome.state+"','"+currentHome.stateParams+"')"};
    var setHome = {name: "Set Home", icon:"ion-pin", onClick:"setHome()"};
    $scope.settingsButtons.splice(1, 0, goHome, setHome);
  }

  $scope.settingsButtons.reverse();

  $scope.setHome = function() {
    var newHome = { state: "gradebooks", stateParams: null};
    HomeReference.setHome(newHome);
    $scope.removeOverlay();
  }

  $scope.goTo = function(state, stateParams) {
    $scope.removeOverlay();
    if(stateParams != null)
      $state.go(state, {id: stateParams});
    else
      $state.go(state);
  }

  $scope.doMethod = function(thingy) {
    $scope.removeOverlay();
    console.log("Trying to do: "+thingy);
  }

  $scope.removeOverlay = function(){
    $scope.settingsButtonClicked = false;
  }
  // AppManager.printList($scope.gradebooksList, "gradebooksCtrl - After:");

  $scope.createGradebook = function() {
    var defaultNameOption = SettingsReference.useDefaultNames();
    if(defaultNameOption) {
      var newGradebook = AppManager.createGradebook("Testing Gradebook");
      GradebookManager.updateName(newGradebook.id, "Gradebook "+newGradebook.id.slice(newGradebook.id.indexOf("_")+1));
    } else{
        $scope.showPopup("create");
    }
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
    $scope.renameObject = function(gradebookID) {
      console.log("renameClicked for: "+gradebookID);
      $scope.showPopup("update", gradebookID);
      $scope.closePopover();
    }

    $scope.copyObject = function(gradebookID) {
      console.log("copyObject for: "+gradebookID);
      GradebookManager.copyGradebook(gradebookID);
      $scope.closePopover();
    }

    $scope.moveObject = function(gradebookID) {
      console.log("moveObject for: "+gradebookID);
    }

    $scope.deleteObject = function(gradebookID) {
      console.log("deleteObject for: "+gradebookID);
      GradebookManager.deleteGradebook(gradebookID);
      $scope.closePopover();
    }

    $ionicPopover.fromTemplateUrl('templates/optionsPopoverLayout.html', {
      scope: $scope
   }).then(function(popover) {
      $scope.popover = popover;
   });

   $scope.openPopover = function($event, gradebookID) {
      $scope.objectID = gradebookID;
      $scope.popover.show($event);
   };

   $scope.closePopover = function() {
      $scope.popover.hide();
   };

   //Cleanup the popover when we're done with it!
   $scope.$on('$destroy', function() {
      $scope.popover.remove();
   });

   // Execute action on hide popover
   $scope.$on('popover.hidden', function() {
      // Execute action
   });

   // Execute action on remove popover
   $scope.$on('popover.removed', function() {
      // Execute action
   });

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

})

.controller('gradebookCtrl', function($scope, $state, $stateParams, HomeReference, SettingsReference, AppManager, GradebookManager, TermManager, $ionicPopover, $ionicPopup) {
  $scope.currentGradebook = GradebookManager.getGradebook($stateParams.id);
  //console.log("gradebookCtrl ID: "+$scope.currentGradebook.id);
  $scope.termsList = GradebookManager.getTerms($scope.currentGradebook.id);
  $scope.data = {};
  $scope.settingsButtonClicked = false;

  $scope.settingsButtons = [
    {name: "Settings", icon: "ion-android-settings", onClick:"goTo('settings')"},
    {name: "Gradebooks List", icon: "ion-ios-bookmarks", onClick:"goTo('gradebooks', null)"},
    {name: "Set Initial Data", icon: "ion-information", onClick:"showInitialGPAPopup('"+$scope.currentGradebook.id+"')"},
    // {name: "New Gradebook", icon: "ion-ios-arrow-right", onClick:"doMethod('New Gradebook')"},
    // {name: "New Term", icon: "ion-android-more-vertical", onClick:"doMethod('New Term')"},
    // {name: "What If", icon: "ion-plus-round", onClick:"doMethod('What If')"},
    // {name: "Set Initial GPA", icon: "ion-ios-arrow-right", onClick:"doMethod('Set Initial GPA')"},
    // {name: "Set Grading Scale", icon: "ion-android-more-vertical", onClick:"doMethod('GS')"},
    // {name: "Huhh", icon: "ion-plus-round", onClick:"doMethod('Huhh')"}
  ];

  var currentHome = HomeReference.getHome();
  if(currentHome.state != 'gradebook'){
    var goHome = {name: "Home", icon:"ion-android-home", onClick:"goTo('"+currentHome.state+"','"+currentHome.stateParams+"')"}
    var setHome = {name: "Set Home", icon:"ion-pin", onClick:"setHome()"};
    if(currentHome.state == 'gradebooks')
      $scope.settingsButtons.splice(1, 1, goHome, setHome);
    else
      $scope.settingsButtons.splice(1, 0, goHome, setHome);
  }

  $scope.settingsButtons.reverse();

  $scope.setHome = function() {
    var newHome = { state: "gradebook", stateParams: $stateParams.id};
    HomeReference.setHome(newHome);
    $scope.removeOverlay();
  }

  $scope.goTo = function(state, stateParams) {
    $scope.removeOverlay();
    if(stateParams != null)
      $state.go(state, {id: stateParams});
    else
      $state.go(state);
  }

  $scope.doMethod = function(thingy) {
    $scope.removeOverlay();
    console.log("Trying to do: "+thingy);
  }

  $scope.removeOverlay = function(){
    $scope.settingsButtonClicked = false;
  }

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
    var defaultNameOption = SettingsReference.useDefaultNames();
    if(defaultNameOption) {
      var newTerm = GradebookManager.createTerm($scope.currentGradebook.id, "Testing Term");
      TermManager.updateName(newTerm.id, "Term "+newTerm.id.slice(newTerm.id.indexOf("_")+1));
    } else{
      $scope.showPopup("create", $scope.currentGradebook.id);
    }
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

  $scope.renameObject = function(termID) {
    console.log("renameClicked for: "+termID);
    $scope.showPopup("update", termID);
    $scope.closePopover();
  }

  $scope.copyObject = function(termID) {
    console.log("copyObject for: "+termID);
    GradebookManager.copyTerm(termID);
    updatePageList();
    $scope.closePopover();
  }

  $scope.moveObject = function(termID, gradebookID) {
    console.log("move: "+termID+" to: "+gradebookID);
    TermManager.moveTerm(termID, gradebookID);
    updatePageList();
    $scope.closeMoveTOPopover();
    $scope.closePopover();
  }

  $scope.deleteObject = function(termID) {
    console.log("deleteObject for: "+termID);
    TermManager.deleteTerm(termID);
    updatePageList();
    $scope.closePopover();
  }

  $ionicPopover.fromTemplateUrl('templates/optionsPopoverLayout.html', {
    scope: $scope
 }).then(function(popover) {
    $scope.popover = popover;
 });

 $scope.openPopover = function($event, termID) {
    $scope.objectID = termID;
    $scope.popover.show($event);
 };

 $scope.closePopover = function() {
    $scope.popover.hide();
 };

 //Cleanup the popover when we're done with it!
 $scope.$on('$destroy', function() {
    $scope.popover.remove();
 });

 // Execute action on hide popover
 $scope.$on('popover.hidden', function() {
    // Execute action
 });

 // Execute action on remove popover
 $scope.$on('popover.removed', function() {
    // Execute action
 });

 $ionicPopover.fromTemplateUrl('templates/moveToList.html', {
   scope: $scope
}).then(function(popover) {
   $scope.moveToPopover = popover;
});

$scope.openMoveTOPopover = function($event, termID) {
   $scope.objectID = termID;
   $scope.objectsList = AppManager.getGradebooks();
  //  var gradebookID = AppManager.getParentObject(termID).id;
  //  var gradebookIndex = $scope.objectsList.findIndex(function(object) {
  //      return object.id == gradebookID;
  //  });
  //  $scope.objectsList.splice(gradebookIndex, 1);
   $scope.moveToPopover.show($event);
};

$scope.closeMoveTOPopover = function() {
   $scope.moveToPopover.hide();
};

//Cleanup the popover when we're done with it!
$scope.$on('$destroy', function() {
   $scope.popover.remove();
});

// Execute action on hide popover
$scope.$on('popover.hidden', function() {
   // Execute action
});

// Execute action on remove popover
$scope.$on('popover.removed', function() {
   // Execute action
});

$scope.showInitialGPAPopup = function(gradebookID) {

   // An elaborate, custom popup
   var myPopup = $ionicPopup.show({
     template: 'GPA: <input type="tel" ng-model="data.GPA"> Hours: <input type="tel" ng-model="data.hours">',
     title: 'Enter Your Previous GPA and Hours',
     scope: $scope,
     buttons: [
       { text: 'Cancel' },
       {
         text: '<b>Save</b>',
         type: 'button-positive',
         onTap: function() {
           if (!$scope.data.GPA || !$scope.data.hours) {
             //don't allow the user to close unless he enters wifi password
             console.log($scope.data.GPA);
             console.log($scope.data.hours);
             //e.preventDefault();
           } else {
             console.log($scope.data.GPA);
             console.log($scope.data.hours);
             return { id: gradebookID, initialGPA: $scope.data.GPA, initialHours: $scope.data.hours};
           }
         }
       },
     ]
   });
   myPopup.then(function(res) {
     GradebookManager.setInitialData(res.id, res.initialGPA, res.initialHours);
      updatePageList();
      $scope.removeOverlay();
   });
  //  $timeout(function() {
  //     myPopup.close(); //close the popup after 3 seconds for some reason
  //  }, 3000);
};

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
})

.controller('termCtrl', function($scope, $state, $stateParams, HomeReference, SettingsReference, TermManager, CourseManager, GradingScaleManager, AppManager, GradebookManager, $ionicPopover, $ionicPopup) {
  $scope.currentTerm = TermManager.getTerm($stateParams.id);
  $scope.currentGradebook = TermManager.getGradebook($stateParams.id);

  $scope.coursesList = TermManager.getCourses($scope.currentTerm.id);
  $scope.data = {};
  $scope.settingsButtonClicked = false;

  $scope.settingsButtons = [
    {name: "Settings", icon: "ion-android-settings", onClick:"goTo('settings', null)"},
    {name: "Gradebooks List", icon: "ion-ios-bookmarks", onClick:"goTo('gradebooks', null)"},
    {name: "Terms List", icon: "ion-android-document", onClick:"goTo('gradebook', '"+$scope.currentGradebook.id+"')"},
    // {name: "New Gradebook", icon: "ion-ios-arrow-right", onClick:"doMethod('New Gradebook')"},
    // {name: "New Term", icon: "ion-android-more-vertical", onClick:"doMethod('New Term')"},
    // {name: "What If", icon: "ion-plus-round", onClick:"doMethod('What If')"},
    // {name: "Set Initial GPA", icon: "ion-ios-arrow-right", onClick:"doMethod('Set Initial GPA')"},
    // {name: "Set Grading Scale", icon: "ion-android-more-vertical", onClick:"doMethod('GS')"},
    // {name: "Huhh", icon: "ion-plus-round", onClick:"doMethod('Huhh')"}
  ];

  var currentHome = HomeReference.getHome();
  if(currentHome.state != 'term'){
    var goHome = {name: "Home", icon:"ion-android-home", onClick:"goTo('"+currentHome.state+"','"+currentHome.stateParams+"')"};
    var setHome = {name: "Set Home", icon:"ion-pin", onClick:"setHome()"};
    if(currentHome.state == 'gradebooks')
      $scope.settingsButtons.splice(1, 1, goHome, setHome);
    else
      $scope.settingsButtons.splice(1, 0, goHome, setHome);
  }

  $scope.settingsButtons.reverse();

  $scope.onSwipeLeft = function() {
    $scope.currentTerm = TermManager.getTerm($stateParams.id);
    var termsList = AppManager.getParentObject($stateParams.id).terms;
    var termIndex = termsList.indexOf($stateParams.id);
    if(termIndex != termsList.length-1)
      $state.go('term', {id: termsList[termIndex+1]});
  }

  $scope.onSwipeRight = function() {
    $scope.currentTerm = TermManager.getTerm($stateParams.id);
    var termsList = AppManager.getParentObject($stateParams.id).terms;
    var termIndex = termsList.indexOf($stateParams.id);
    if(termIndex != 0)
      $state.go('term', {id: termsList[termIndex-1]});
  }

  $scope.setHome = function() {
    var newHome = { state: "term", stateParams: $stateParams.id};
    HomeReference.setHome(newHome);
    $scope.removeOverlay();
  }

  $scope.goTo = function(state, stateParams) {
    $scope.removeOverlay();
    if(stateParams != null)
      $state.go(state, {id: stateParams});
    else
      $state.go(state);
  }

  $scope.doMethod = function(thingy) {
    $scope.removeOverlay();
    console.log("Trying to do: "+thingy);
  }

  $scope.removeOverlay = function(){
    $scope.settingsButtonClicked = false;
  }

  $scope.selectedGrade = null;
  $scope.inputHours = null;

  $scope.gradingScaleList = GradingScaleManager.getGradingScale();

  $scope.updateGrade = function(courseID, newGrade) {
    console.log("changed Grade for: "+courseID+" to: "+newGrade);
    CourseManager.updateGrade(courseID,newGrade);
  }

  $scope.updateHours = function(courseID, newHours) {
    console.log("changed Hours for: "+courseID+" to: "+newHours);
    CourseManager.updateHours(courseID,newHours);
  }

  var updatePageList = function(){
    $scope.coursesList = TermManager.getCourses($scope.currentTerm.id);
  }

  $scope.createCourse = function() {
    var defaultNameOption = SettingsReference.useDefaultNames();
    if(defaultNameOption) {
      var newCourse = TermManager.createCourse($scope.currentTerm.id, "");
      //CourseManager.updateName(newCourse.id, "Course "+newCourse.id.slice(newCourse.id.indexOf("_")+1));
    } else{
      $scope.showPopup("create", $scope.currentTerm.id);
    }
    updatePageList();
  }

  $scope.renameObject = function(courseID) {
    console.log("renameClicked for: "+courseID);
    $scope.showPopup("update", courseID);
    $scope.closePopover();
  }

  $scope.copyObject = function(courseID) {
    console.log("copyObject for: "+courseID);
    CourseManager.copyCourse(courseID);
    updatePageList();
    $scope.closePopover();
  }

  $scope.moveObject = function(courseID, termID) {
    console.log("move: "+courseID+" to: "+termID);
    CourseManager.moveCourse(courseID, termID);
    updatePageList();
    $scope.closeMoveTOPopover();
    $scope.closePopover();
  }

  $scope.deleteObject = function(courseID) {
    console.log("deleteObject for: "+courseID);
    CourseManager.deleteCourse(courseID);
    updatePageList();
    $scope.closePopover();
  }


  $ionicPopover.fromTemplateUrl('templates/optionsPopoverLayout.html', {
    scope: $scope
 }).then(function(popover) {
    $scope.popover = popover;
 });

 $scope.openPopover = function($event, courseID) {
    $scope.objectID = courseID;
    $scope.popover.show($event);
 };

 $scope.closePopover = function() {
    $scope.popover.hide();
 };

 //Cleanup the popover when we're done with it!
 $scope.$on('$destroy', function() {
    $scope.popover.remove();
 });

 // Execute action on hide popover
 $scope.$on('popover.hidden', function() {
    // Execute action
 });

 // Execute action on remove popover
 $scope.$on('popover.removed', function() {
    // Execute action
 });

 $ionicPopover.fromTemplateUrl('templates/moveToList.html', {
   scope: $scope
}).then(function(popover) {
   $scope.moveToPopover = popover;
});

$scope.openMoveTOPopover = function($event, courseID) {
   $scope.objectID = courseID;
   var termID = AppManager.getParentObject(courseID).id
   var gradebookID = AppManager.getParentObject(termID).id;
   $scope.objectsList = GradebookManager.getTerms(gradebookID);
   $scope.moveToPopover.show($event);
};

$scope.closeMoveTOPopover = function() {
   $scope.moveToPopover.hide();
};

//Cleanup the popover when we're done with it!
$scope.$on('$destroy', function() {
   $scope.popover.remove();
});

// Execute action on hide popover
$scope.$on('popover.hidden', function() {
   // Execute action
});

// Execute action on remove popover
$scope.$on('popover.removed', function() {
   // Execute action
});

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
        TermManager.createCourse(courseID, res.newName);
        updatePageList();
      }
       console.log('Tapped!', res);
     });
  };
});
