var myApp = angular.module('myApp', ['ui.router'])

myApp.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/')

  $stateProvider
    .state('home', {
      url: '/?reg',
      templateUrl: 'templates/home.html',
      controller: 'homeController as homeCtrl'
    })
    .state('login', {
      url: '/login?ur',
      templateUrl: 'templates/login.html',
      controller: 'loginController as loginCtrl'
    })
    .state('logout', {
      url: '/logout',
      templateUrl: 'templates/logout.html',
      controller: 'logoutController',
      restricted: true
    })
    .state('register', {
      url: '/register?p&r&ur',
      templateUrl: 'templates/register.html',
      controller: 'registerController as registerCtrl'
    })
    .state('crew-list', {
      url: '/crewlist',
      templateUrl: 'templates/crewList.html',
      controller: 'crewListController as crewListCtrl',
      restricted: true
    })
    .state('production', {
      url: '/production/:id',
      templateUrl: 'templates/production.html',
      controller: 'productionController as productionCtrl',
      restricted: true
    })
    .state('production-list', {
      url: '/productions',
      templateUrl: 'templates/productionList.html',
      controller: 'productionListController as productionListCtrl',
      restricted: true
    })
    .state('profile', {
      url: '/profile',
      templateUrl: 'templates/profile.html',
      controller: 'postController as postCtrl',
      restricted: true
    })
    .state('otherProfile', {
      url: '/profile/:id',
      templateUrl: 'templates/otherProfile.html',
      controller: 'otherProfileController as otherProfileCtrl',
      restricted: true
    })
    .state('offer', {
      url: '/offer/:id',
      templateUrl: 'templates/offer.html',
      controller: 'offerController as offerCtrl',
      restricted: true
    })

}])

myApp.run(['$rootScope', '$location', '$state', 'AuthService', function ($rootScope, $location, $state, AuthService) {
  $rootScope.$on("$stateChangeError", console.log.bind(console));
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
    AuthService.getUserStatus()
    .then(function(){
      // console.log(toState)
      if (toState.restricted && !AuthService.isLoggedIn()){
        // $location.path('/login')
        $state.go('login');
      }
    })
  })
}])
