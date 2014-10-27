'use strict';

/**
 * @ngdoc overview
 * @name angularApp
 * @description
 * # angularApp
 *
 * Main module of the application.
 */
angular
  .module('angularApp', [
    'ionic',
    'angularApp.services',
    'angularApp.controllers',
    'angularApp.templatesComponent',
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ui.router',
    'ngSanitize',
    'LocalStorageModule'
  ])
  .constant('APPID', '4901c3')
  .constant('APIKEY','3bf5004e723d456e44859ec39cec4ee9f9e8cfba5b05fab5dd14d7bd338a9b13')
  .constant('BASEURL', 'http://4901c3.stamplay.com') // e.g. http://APPID.stamplay.com
  .config(['localStorageServiceProvider', function(localStorageServiceProvider){
  localStorageServiceProvider.setPrefix('lr');
    // localStorageServiceProvider.setStorageCookieDomain('example.com');
    // localStorageServiceProvider.setStorageType('sessionStorage');
  }])
  .config(function ($stateProvider, $urlRouterProvider, $httpProvider) {
    //Enable cross domain calls
    $httpProvider.defaults.useXDomain = true;
    console.log($httpProvider);
    //Remove the header used to identify ajax call  that would prevent CORS from working
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
    $urlRouterProvider.otherwise('/');
    $stateProvider
      .state('jobs', {
        url: "/jobs",
        abstract: true,
        templateUrl: "views/tabs.html",
        resolve: {
          category: function (Category) {
            return Category.getPromise();
          },
          areas : function(Area){
            return Area.getPromise();
          }
        }
      })
      .state('home', {
        url: '/',
        templateUrl: 'views/main.html',
        // controller: 'MainCtrl'
      })
      .state('jobs.new', {
        url: '/postjob',
        views: {
          'tabledata': {
            templateUrl: 'views/jobs-publish.html',
            controller: 'PublishCtrl'
          }
        }
      })
      .state('jobs.list', {
        url: '/:categoryName',
        views: {
          'tabledata': {
            templateUrl: 'views/jobs.html',
            controller: 'FindCtrl'
          }
        }
      })
      .state('jobs.view', {
        url: '/view/:objectId',
        views: {
          'tabledata': {
            templateUrl: 'views/jobs-view.html',
            controller: 'ItemCtrl'
          }
        }
      })
       .state('jobs.list.location', {
        url: '/:location',
        views: {
          'tabledata': {
            template: '<div>Location</div>',
            controller: 'FindCtrl'
          }
        }
      })
      .state('account', {
        url: '/account',
        templateUrl: 'views/account.html',
        controller: 'AccountCtrl'
      })
    .state('settings', {
      url: '/settings',
      templateUrl: 'views/settings.html',
      controller: 'SettingsCtrl'
    })
    .state('login', {
      url: '/login',
      templateUrl: 'views/login.html',
      controller: 'LoginCtrl'
    })

    .state('signup', {
      url: '/signup',
      templateUrl: 'views/signup.html',
      controller: 'LoginCtrl'
    })
    .state('about', {
      url: '/about',
      templateUrl: 'views/about.html',
      // controller: 'AboutCtrl'
    });
  });
