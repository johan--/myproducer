angular.module('myApp')
  .controller('logoutController', logoutController)

logoutController.$inject = ['$state', 'AuthService']

// LOGOUT CONTROLLER:
function logoutController($state, AuthService) {
  var vm = this
  vm.logout = function () {

    // call logout from service
    AuthService.logout()
      .then(function () {
        $state.go('login')
      })
  }
}
