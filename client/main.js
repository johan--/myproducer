var myApp = angular.module('myApp', ['ui.router'])

myApp.config(function ($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/')

  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'templates/home.html'
    })
    .state('login', {
      url: '/login?ur',
      templateUrl: 'templates/login.html',
      controller: 'loginController as loginCtrl'
    })
    .state('logout', {
      url: '/logout',
      templateUrl: 'templates/logout.html',
      restricted: true,
      controller: 'logoutController'
    })
    .state('register', {
      url: '/register?p&r&ur',
      templateUrl: 'templates/register.html',
      controller: 'registerController as registerCtrl'
    })
    .state('crew-list', {
      url: '/crewlist',
      templateUrl: 'templates/crewList.html',
      controller: 'crewListController as crewListCtrl'
    })
    .state('production', {
      url: '/production/:id',
      templateUrl: 'templates/production.html',
      controller: 'productionController as productionCtrl',
      // restricted: true /*TODO Comment this back in*/
    })
    .state('production-list', {
      url: '/productions',
      templateUrl: 'templates/productionList.html',
      controller: 'productionListController as productionListCtrl',
    })
    .state('profile', {
      url: '/profile',
      templateUrl: 'templates/profile.html',
      // restricted: true,
      controller: 'postController as postCtrl'
    })
    .state('otherProfile', {
      url: '/profile/:id',
      templateUrl: 'templates/otherProfile.html',
      // restricted: true,
      controller: 'otherProfileController as otherProfileCtrl'
    })
    .state('offer', {
      url: '/offer/:id',
      templateUrl: 'templates/offer.html',
      controller: 'offerController as offerCtrl'
    })

})

myApp.run(function ($rootScope, $location, $state, AuthService) {
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
})
