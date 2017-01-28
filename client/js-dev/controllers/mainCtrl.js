angular.module('myApp')
  .controller('mainController', mainController)

mainController.$inject = ['$rootScope', '$state', 'AuthService', '$location']

function mainController($rootScope, $state, AuthService, $location) {
  var vm = this
  vm.isNotLogin = true
  vm.isLogin = false
  $rootScope.activeTab = {}
  $rootScope.isLoggedIn = false

  $rootScope.$on('$stateChangeStart', function (event) {
    AuthService.getUserStatus()
      .then(function(data){
        vm.currentUser = data.data.user
        if (vm.currentUser) {
          $rootScope.isLoggedIn = true
        }
      })
  })

  $rootScope.$on('$stateChangeSuccess', function(event){
    console.log($location.path());
    if($location.path() == "/login" || "/forgot-password"){
      vm.isNotLogin = false
      vm.isLogin = true
    }
  })
}
