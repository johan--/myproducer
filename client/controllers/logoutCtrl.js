angular.module('myApp')
  .controller('logoutController', logoutController)

logoutController.$inject = ['$rootScope', '$state', 'AuthService']

// LOGOUT CONTROLLER:
function logoutController($rootScope, $state, AuthService) {
  var vm = this

  $rootScope.activeTab = {}

  vm.logout = function () {

    // call logout from service
    AuthService.logout()
      .then(function () {
        $state.go('login')
      })
  }
}
