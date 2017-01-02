angular.module('myApp')
  .controller('loginController', loginController)

loginController.$inject = ['$rootScope', '$state', '$stateParams', 'AuthService']

// LOGIN CONTROLLER:
function loginController($rootScope, $state, $stateParams, AuthService) {
  var vm = this

  $rootScope.activeTab = {}
  vm.userRole = $stateParams.ur

  if($rootScope.isLoggedIn) {
    // console.log('go to proile');
    $state.go('profile')
  }

  vm.login = function () {

    // initial values
    vm.error = false
    vm.disabled = true

    // call login from service
    AuthService.login(vm.loginForm.username, vm.loginForm.password)
      // handle success
      .then(function () {
        // console.log("Successful login...")
        $state.go('profile')
        vm.disabled = false
        vm.loginForm = {}
      })
      // handle error
      .catch(function () {
        // console.log("Whoops...")
        vm.error = true
        vm.errorMessage = "Invalid email and/or password"
        vm.disabled = false
        vm.loginForm = {}
      })
  }
}
