var myApp = angular.module('myApp', ['ui.router'])

myApp.config(function ($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/')

  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'templates/home.html'
    })
    .state('login', {
      url: '/login',
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
      url: '/register',
      templateUrl: 'templates/register.html',
      controller: 'registerController as registerCtrl'
    })
    .state('crew-list', {
      url: '/crewlist',
      templateUrl: 'templates/crewList.html',
      controller: 'postController as postCtrl'
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
      controller: 'postController as postCtrl',
    })
    .state('profile', {
      url: '/profile',
      templateUrl: 'templates/profile.html',
      // restricted: true,
      controller: 'postController as postCtrl'
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
