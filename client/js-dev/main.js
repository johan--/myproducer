var myApp = angular.module('myApp', ['ui.router', 'ui.bootstrap', 'analytics.mixpanel', 'ngImgCrop'])

myApp.config(['$stateProvider', '$urlRouterProvider', '$mixpanelProvider', function ($stateProvider, $urlRouterProvider, $mixpanelProvider) {

  $mixpanelProvider.apiKey('15cd4875d9c8b7a226829c8fcf5ce560')

  $urlRouterProvider.otherwise('/profile')

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
    .state('complete-registration',{
      url: '/complete-registration/:token',
      templateUrl: 'templates/complete-registration.html',
      controller: 'completeRegistrationController as compRegCtrl'
    })
    .state('forgot-password', {
      url: '/forgot-password',
      templateUrl: 'templates/forgot-password.html',
      controller: 'forgotPasswordController as forgotPWCtrl'
    })
    .state('reset-password', {
      url: '/reset-password/:token',
      templateUrl: 'templates/reset-password.html',
      controller: 'resetPasswordController as resetPWCtrl'
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
    .state('account-settings', {
      url: '/account-settings',
      templateUrl: 'templates/account-settings.html',
      controller: 'accountSettingController as accSetCtrl',
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
      controller: 'offerController as offerCtrl'
    })

}])

myApp.run(['$rootScope', '$location', '$state', 'AuthService', function ($rootScope, $location, $state, AuthService) {
  $rootScope.$on("$stateChangeError", console.log.bind(console));
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
    AuthService.getUserStatus()
    .then(function(data){
      // if they attempted to reach a protected page state before they logged in ...
      if (toState.restricted && !AuthService.isLoggedIn()){
        // find out what state they were trying to access, capture it
        $rootScope.returnToState = toState.url;
        // find out the param id of that state they were trying to access, capture it
        // we use these in the loginCtrl during AuthService.login to send them back
        // after they log in
        $rootScope.returnToStateParams = toParams.id;
        $state.go('login');
      }
    })
  })
}])
