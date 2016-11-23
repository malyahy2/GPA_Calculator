// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('gpaCalc', ['ionic', 'gpaCalc.controllers', 'gpaCalc.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    // if( ionic.Platform.isAndroid() )  {
    //    admobid = { // for Android
    //       banner: 'ca-app-pub-6889063447180231/8847517304' // Change this to your Ad Unit Id for banner...
    //    };
    //
    //    if(AdMob)
    //       AdMob.createBanner( {
    //          adId:admobid.banner,
    //          position:AdMob.AD_POSITION.BOTTOM_CENTER,
    //          autoShow:true
    //       } );
    // }

    var admobid = {};
        // select the right Ad Id according to platform
        if( /(android)/i.test(navigator.userAgent) ) {
            admobid = { // for Android
                banner: 'ca-app-pub-6889063447180231/8847517304'
            };
        } else if(/(ipod|iphone|ipad)/i.test(navigator.userAgent)) {
            admobid = { // for iOS
                banner: 'ca-app-pub-6889063447180231/2382181307'
            };
        }

    if(window.AdMob) AdMob.createBanner( {
        adId:admobid.banner,
        position:AdMob.AD_POSITION.BOTTOM_CENTER,
        overlap: false,
        autoShow:true} );

    document.addEventListener('onAdLoaded', function(e){
      console.log('onAdLoaded');
    });
    document.addEventListener('onAdFailLoad', function(e){
      console.log('onAdFailLoad');
    });
    document.addEventListener('onAdPresent', function(e){
      console.log('onAdPresent');
    });
    document.addEventListener('onAdDismiss', function(e){
      console.log('onAdDismiss');
    });
    document.addEventListener('onAdLeaveApp', function(e){
      console.log('onAdLeaveApp');
    });

  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('loading', {
    url: '/loading',
    templateUrl: 'templates/loading.html',
    controller: 'loadingCtrl'
  })

    .state('gradebooks', {
    url: '/gradebooks',
    templateUrl: 'templates/gradebooks.html',
    controller: 'gradebooksCtrl'
  })

    .state('gradebook', {
    url: '/gradebook/:id',
    templateUrl: 'templates/gradebook.html',
    controller: 'gradebookCtrl'
  })

    .state('term', {
    url: '/term/:id',
    templateUrl: 'templates/term.html',
    controller: 'termCtrl'
  })

    .state('settings', {
    url: '/settings',
    templateUrl: 'templates/settings.html',
    controller: 'settingsCtrl'
  })

    .state('gpaScale', {
    url: '/gpaScale',
    templateUrl: 'templates/gpaScale.html',
    controller: 'gpaScaleCtrl'
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/loading');
});
