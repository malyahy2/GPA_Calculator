angular.module('gpaCalc.controllers', [])

.controller('loadingCtrl', function($scope, $state, AppInitializer, AppColors, $ionicPlatform, $ionicHistory, HomeReference) {
  $scope.colorPalette = AppColors.getColorPalette();

  $scope.loadingComplete = false;
  var loadHome = function() {
    var currentHome = HomeReference.getHome();
       console.log("loading history back: ", $ionicHistory.viewHistory());
    if(currentHome.stateParams != null) {
      $state.go(currentHome.state, {id: currentHome.stateParams});
    } else {
      $state.go(currentHome.state);
    }
  }

  $scope.$on("$ionicView.beforeEnter", function(event, data){
     console.log("Opening Page: ", data.stateParams);
     if($scope.loadingComplete == true)
      loadHome();
  });

  $ionicPlatform.ready(function() {
    $scope.loadingComplete = true;
    AppInitializer.launchApp();
    loadHome();
  });

})

.controller('settingsCtrl', function($scope, $state, AppColors, HomeReference, SettingsReference, GradingScaleManager, $ionicPopup, $ionicHistory, $window) {
  $scope.colorPalette = AppColors.getColorPalette();

  $scope.goHome = function() {
    var currentHome = HomeReference.getHome();
    if(currentHome.stateParams != null)
      $state.go(currentHome.state, {id: currentHome.stateParams});
    else
      $state.go(currentHome.state);
  }
            
            $scope.$on("$ionicView.beforeEnter", function(event, data){
                       AdMob.showBanner(AdMob.AD_POSITION.BOTTOM_CENTER);
                       });

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
      GradingScaleManager.setDefaultGradingScale_5();
    } else if(clickedIndex == 3){
      GradingScaleManager.setDefaultGradingScale_Traditional();
    } else if(clickedIndex == 4){
      $state.go('gpaScale');
    }
  };

  $scope.changeColorScheme = function() {
    console.log("colorChanged");
    AppColors.setColorPaletteToNextScheme();
      $ionicHistory.clearHistory();
      setTimeout(function (){
             $window.location.reload(true);
//                 AdMob.hideBanner();
//                 setTimeout(function (){
//                            AdMob.showBanner(AdMob.AD_POSITION.BOTTOM_CENTER);
//                            }, 100);
      }, 100);
            
  };

  $scope.showColorSchemesPopup = function() {

      $scope.colorSchemes = AppColors.getColorSchemes();

     // An elaborate, custom popup
     var myPopup = $ionicPopup.show({
       templateUrl: 'templates/colorSchemesList.html',
       title: '<b>Chose Color Scheme<b>',
       cssClass: 'my-popup',
       scope: $scope,
       buttons: [
         { text: '<b>Cancel<b>' },
       ]
     });
     myPopup.then(function(res) {
     });

     $scope.changeColorSchemeTo = function(chosenIndex) {
       AppColors.setColorPaletteTo(chosenIndex);
       myPopup.close();
         $ionicHistory.clearHistory();
         setTimeout(function (){
                $window.location.reload(true);
         }, 100);
     }
  };

})

.controller('gpaScaleCtrl', function($scope, $state, GradingScaleManager, AppColors) {
  $scope.colorPalette = AppColors.getColorPalette();
            
            $scope.$on("$ionicView.beforeEnter", function(event, data){
                       AdMob.showBanner(AdMob.AD_POSITION.BOTTOM_CENTER);
                       });

  $scope.gradesList = GradingScaleManager.getGradingScale();
  $scope.updateName = function(gradeID, newName) {
    GradingScaleManager.updateGradeName(gradeID, newName);
    // $scope.gradesList = GradingScaleManager.getGradingScale();
  }
  $scope.updatePoints = function(gradeID, newPoints) {
    GradingScaleManager.updateGradePoints(gradeID, newPoints);
    // $scope.gradesList = GradingScaleManager.getGradingScale();
  }
  $scope.createGrade = function() {
    GradingScaleManager.createGrade();
    // $scope.gradesList = GradingScaleManager.getGradingScale();
  }
  $scope.deleteGrade = function(gradeID) {
    GradingScaleManager.deleteGrade(gradeID);
    // $scope.gradesList = GradingScaleManager.getGradingScale();
  }
  $scope.goBack = function() {
    $state.go('settings');
  }
})


.controller('gradebooksCtrl', function($scope, $state, AppColors, AppManager, HomeReference, SettingsReference, $ionicPopover, GradebookManager, $ionicPopup) {
  $scope.colorPalette = AppColors.getColorPalette();

  $scope.gradebooksList = AppManager.getGradebooks();
  $scope.data = {};
  $scope.settingsButtonClicked = false;

  $scope.settingsButtons = [];

  var updateSettingsButtons = function () {
    $scope.settingsButtons = [
      {name: "Settings", icon: "ion-android-settings", onClick:"goTo('settings')"},
      {name: "New Gradebook", icon: "ion-plus-round", onClick:"createGradebook()"}
      // {name: "New Gradebook", icon: "ion-ios-arrow-right", onClick:"doMethod('New Gradebook')"}
    ];

    var currentHome = HomeReference.getHome();
    if(currentHome.state != 'gradebooks'){
      var goHome = {name: "Home", icon:"ion-android-home", onClick:"goTo('"+currentHome.state+"','"+currentHome.stateParams+"')"};
      var setHome = {name: "Set Home", icon:"ion-pin", onClick:"setHome()"};
      $scope.settingsButtons.splice(1, 0, goHome, setHome);
    }

    $scope.settingsButtons.reverse();
  }

  $scope.$on("$ionicView.beforeEnter", function(event, data){
     console.log("Opening Page: ", data.stateParams);
     updateSettingsButtons();
             AdMob.showBanner(AdMob.AD_POSITION.BOTTOM_CENTER);
  });

  $scope.setHome = function() {
    var newHome = { state: "gradebooks", stateParams: null};
    HomeReference.setHome(newHome);
    $scope.removeOverlay();
    updateSettingsButtons();
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
    $scope.removeOverlay();
    if(defaultNameOption) {
      var newGradebook = AppManager.createGradebook("Testing Gradebook");
      GradebookManager.updateName(newGradebook.id, "Gradebook "+($scope.gradebooksList.length));
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
       templateUrl: 'templates/newName.html',
       title: 'Rename Gradebook',
       cssClass: 'my-popup',
       scope: $scope,
       buttons: [
         { text: 'Cancel' },
         {
           text: '<b>Save</b>',
           type: 'save',
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
       $scope.data.value = null;
       if(action == "update" && res != undefined)
        GradebookManager.updateName(res.id, res.newName);
      else if(action == "create" && res != undefined)
        AppManager.createGradebook(res.newName);
       console.log('Tapped!', res);
     });
    //  $timeout(function() {
    //     myPopup.close(); //close the popup after 3 seconds for some reason
    //  }, 3000);
  };

})

.controller('gradebookCtrl', function($scope, $state, $stateParams, $ionicLoading, AppColors, HomeReference, GradingScaleManager, $ionicModal, SettingsReference, AppManager, GradebookManager, TermManager, $ionicPopover, $ionicPopup) {
  $scope.colorPalette = AppColors.getColorPalette();

  $scope.currentGradebook = GradebookManager.getGradebook($stateParams.id);
  //console.log("gradebookCtrl ID: "+$scope.currentGradebook.id);
  $scope.termsList = GradebookManager.getTerms($scope.currentGradebook.id);
  $scope.data = {};
  $scope.settingsButtonClicked = false;

  $scope.$watchCollection(function () {
      return $scope.currentGradebook.terms;
    }, function() {
      $scope.termsList = GradebookManager.getTerms($scope.currentGradebook.id);
  });

  $scope.settingsButtons = [];

  var updateSettingsButtons = function () {
    $scope.settingsButtons = [
      {name: "Settings", icon: "ion-android-settings", onClick:"goTo('settings')"},
      {name: "Gradebooks List", icon: "ion-ios-bookmarks", onClick:"goTo('gradebooks', null)"},
      {name: "Set Initial Data", icon: "ion-information", onClick:"showInitialGPAPopup('"+$scope.currentGradebook.id+"')"},
      {name: "Improve Your GPA", icon: "ion-medkit", onClick:"openModal()"},
      {name: "New Term", icon: "ion-plus-round", onClick:"createTerm()"},
      // {name: "New Term", icon: "ion-android-more-vertical", onClick:"doMethod('New Term')"},
      // {name: "What If", icon: "ion-plus-round", onClick:"doMethod('What If')"}
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
  }

  $scope.$on("$ionicView.beforeEnter", function(event, data){
     console.log("Opening Page: ", data.stateParams);
     updateSettingsButtons();
             AdMob.showBanner(AdMob.AD_POSITION.BOTTOM_CENTER);
  });

  $scope.setHome = function() {
    var newHome = { state: "gradebook", stateParams: $stateParams.id};
    HomeReference.setHome(newHome);
    $scope.removeOverlay();
    updateSettingsButtons();
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

  // var updatePageList = function(){
  //   $scope.termsList = GradebookManager.getTerms($scope.currentGradebook.id);
  // }

  $scope.createTerm = function() {
    var defaultNameOption = SettingsReference.useDefaultNames();
    $scope.removeOverlay();
    if(defaultNameOption) {
      var newTerm = GradebookManager.createTerm($scope.currentGradebook.id, "Testing Term");
      TermManager.updateName(newTerm.id, "Term "+($scope.termsList.length+1));
    } else{
      $scope.showPopup("create", $scope.currentGradebook.id);
    }
    // updatePageList();
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
    //updatePageList();
    $scope.closePopover();
  }

  $scope.moveObject = function(termID, gradebookID) {
    console.log("move: "+termID+" to: "+gradebookID);
    TermManager.moveTerm(termID, gradebookID);
    //updatePageList();
    $scope.closeMoveTOPopover();
    $scope.closePopover();
  }

  $scope.deleteObject = function(termID) {
    console.log("deleteObject for: "+termID);
    TermManager.deleteTerm(termID);
    //updatePageList();
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
            
            $scope.removeOverlay();

    // $scope.data.iGPA = null;
    // $scope.data.iHours = null;
    //
    //
    //   console.log("old initialGPA: ", $scope.data.iGPA);
    //   console.log("old initialHours: ", $scope.data.iHours);

    if($scope.currentGradebook.initialHours != 0) {
        $scope.data.GPA = $scope.currentGradebook.initialGPA;
        $scope.data.hours = $scope.currentGradebook.initialHours;
    }

   // An elaborate, custom popup
   var myPopup = $ionicPopup.show({
     templateUrl: 'templates/editInitialData.html',
     title: 'Enter Your Previous GPA and Hours',
     cssClass: 'my-popup',
     scope: $scope,
     buttons: [
       { text: 'Cancel' },
       {
         text: '<b>Save</b>',
         type: 'save',
         onTap: function(e) {
           if ($scope.data.GPA == null) {
             //don't allow the user to close unless he enters wifi password
             console.log($scope.data.GPA);
             console.log($scope.data.hours);
             $ionicLoading.show({ template: 'No GPA Provided', noBackdrop: true, duration: 2000 });
             e.preventDefault();
           } else if($scope.data.hours == null) {
             console.log($scope.data.GPA);
             console.log($scope.data.hours);
             $ionicLoading.show({ template: 'No Hours Provided', noBackdrop: true, duration: 2000 });
             e.preventDefault();
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
    $scope.data.GPA = null;
    $scope.data.hours = null;
    if(res != undefined)
      // console.log("old initialGPA: ", $scope.data.iGPA);
      // console.log("old initialGPA: ", $scope.data.iHours);
      console.log("new initialGPA: ", res.initialGPA);
      console.log("new initialHours: ", res.initialHours);
      GradebookManager.setInitialData(res.id, res.initialGPA, res.initialHours);
    //updatePageList();
    $scope.removeOverlay();
   });
  //  $timeout(function() {
  //     myPopup.close(); //close the popup after 3 seconds for some reason
  //  }, 3000);
};

  $scope.showPopup = function(action, termID) {

     // An elaborate, custom popup
     var myPopup = $ionicPopup.show({
       templateUrl: 'templates/newName.html',
       title: 'Rename Term',
       cssClass: 'my-popup',
       scope: $scope,
       buttons: [
         { text: 'Cancel' },
         {
           text: '<b>Save</b>',
           type: 'save',
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
       $scope.data.value = null;
       if(action == "update" && res != undefined)
        TermManager.updateName(res.id, res.newName);
      else if(action == "create" && res != undefined) {
        GradebookManager.createTerm(termID, res.newName);
        //updatePageList();
      }
       console.log('Tapped!', res);
     });
    //  $timeout(function() {
    //     myPopup.close(); //close the popup after 3 seconds for some reason
    //  }, 3000);
  };

  $scope.calculateCreditHoursNeeded = function() {
    if($scope.data.desiredGPA != null && $scope.data.targetedGrade!= null) {
      var currentHours = parseFloat($scope.currentGradebook.hours);
      var currentGPA = parseFloat($scope.currentGradebook.GPA);
      var wantedGPA = $scope.data.desiredGPA;
      var expectedGrade = $scope.data.targetedGrade;
      if(wantedGPA == expectedGrade)
        expectedGrade += 0.001;

      $scope.data.neededHours = Math.ceil((((wantedGPA - currentGPA) * currentHours)/(expectedGrade - wantedGPA)));
    }
  };

  $scope.updateGradeOptions = function() {
    $scope.gradingScaleList = [];
    if($scope.data.desiredGPA != null) {
      var gradesList = GradingScaleManager.getGradingScale();
      for(var i=0; i< gradesList.length; i++ ) {
        if(gradesList[i].points >= $scope.data.desiredGPA)
          $scope.gradingScaleList.push(gradesList[i]);
      }
      $scope.calculateCreditHoursNeeded();
    }
  };

  $ionicModal.fromTemplateUrl('templates/fixGPA.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.openModal = function() {
    $scope.data.desiredGPA = null;
    $scope.data.neededHours = 0;
    $scope.updateGradeOptions();
    $scope.modal.show();
    $scope.removeOverlay();
  };
  $scope.closeModal = function() {
    $scope.data.desiredGPA = null;
    $scope.modal.hide();
  };
  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // Execute action
  });
})

.controller('termCtrl', function($scope, $state, $stateParams, AppColors, HomeReference, SettingsReference, TermManager, CourseManager, GradingScaleManager, AppManager, GradebookManager, $ionicPopover, $ionicPopup) {
  $scope.colorPalette = AppColors.getColorPalette();

  $scope.currentTerm = TermManager.getTerm($stateParams.id);
  $scope.currentGradebook = TermManager.getGradebook($stateParams.id);

  $scope.coursesList = TermManager.getCourses($scope.currentTerm.id);
  $scope.data = {};
  $scope.settingsButtonClicked = false;

  $scope.$watchCollection(function () {
      return $scope.currentTerm.courses;
    }, function() {
      $scope.coursesList = TermManager.getCourses($scope.currentTerm.id);
  });

  $scope.settingsButtons = [];

  var updateSettingsButtons = function () {
    $scope.settingsButtons = [
      {name: "Settings", icon: "ion-android-settings", onClick:"goTo('settings', null)"},
      {name: "Gradebooks List", icon: "ion-ios-bookmarks", onClick:"goTo('gradebooks', null)"},
      {name: "Terms List", icon: "ion-android-document", onClick:"goTo('gradebook', '"+$scope.currentGradebook.id+"')"},
      {name: "New Course", icon: "ion-plus-round", onClick:"createCourse()"}
      // {name: "What If", icon: "ion-plus-round", onClick:"doMethod('What If')"}
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
  }

  $scope.$on("$ionicView.beforeEnter", function(event, data){
     console.log("Opening Page: ", data.stateParams);
     updateSettingsButtons();
            AdMob.showBanner(AdMob.AD_POSITION.BOTTOM_CENTER);
  });

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
    updateSettingsButtons();
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

  $scope.selectedGrade = "Grade";
  $scope.inputHours = null;

  $scope.gradingScaleList = GradingScaleManager.getGradingScale();

  $scope.updateGrade = function(courseID, newGrade) {
    console.log("changed Grade for: "+courseID+" to: "+newGrade);
    CourseManager.updateGrade(courseID,newGrade);
  }

  $scope.updateHours = function(courseID, newHours) {
    console.log("changed Hours for: "+courseID+" to: "+newHours);
    if(newHours >= 0)
      CourseManager.updateHours(courseID,newHours);
  }

  // var updatePageList = function(){
  //   $scope.coursesList = TermManager.getCourses($scope.currentTerm.id);
  // }

  $scope.createCourse = function() {
    var defaultNameOption = SettingsReference.useDefaultNames();
    $scope.removeOverlay();
    if(defaultNameOption) {
      var newCourse = TermManager.createCourse($scope.currentTerm.id, "");
      //CourseManager.updateName(newCourse.id, "Course "+newCourse.id.slice(newCourse.id.indexOf("_")+1));
    } else{
      $scope.showPopup("create", $scope.currentTerm.id);
    }
    //updatePageList();
  }

  $scope.renameObject = function(courseID) {
    console.log("renameClicked for: "+courseID);
    $scope.showPopup("update", courseID);
    $scope.closePopover();
  }

  $scope.copyObject = function(courseID) {
    console.log("copyObject for: "+courseID);
    CourseManager.copyCourse(courseID);
    //updatePageList();
    $scope.closePopover();
  }

  $scope.moveObject = function(courseID, termID) {
    console.log("move: "+courseID+" to: "+termID);
    CourseManager.moveCourse(courseID, termID);
    //updatePageList();
    $scope.closeMoveTOPopover();
    $scope.closePopover();
  }

  $scope.deleteObject = function(courseID) {
    console.log("deleteObject for: "+courseID);
    CourseManager.deleteCourse(courseID);
    //updatePageList();
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
       templateUrl: 'templates/newName.html',
       title: 'Rename Course',
       cssClass: 'my-popup',
       scope: $scope,
       buttons: [
         { text: 'Cancel' },
         {
           text: '<b>Save</b>',
           type: 'save',
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
       $scope.data.value = null;
       if(action == "update" && res != undefined)
        TermManager.updateName(res.id, res.newName);
      else if(action == "create" && res != undefined) {
        TermManager.createCourse(courseID, res.newName);
        //updatePageList();
      }
       console.log('Tapped!', res);
     });
  };
});
