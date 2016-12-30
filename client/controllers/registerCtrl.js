angular.module('myApp')
  .controller('registerController', registerController)

registerController.$inject = ['$rootScope', '$state', '$stateParams', 'AuthService']

// REGISTER CONTROLLER:
function registerController($rootScope, $state, $stateParams, AuthService) {
  var vm = this

  $rootScope.activeTab = {}

  if($rootScope.isLoggedIn) {
    console.log('go to proile');
    $state.go('profile')
  } else if ($stateParams.ur === undefined) {
    $state.go('home')
  }

  vm.register = function () {

    // initial values
    vm.error = false
    vm.disabled = true

    // call register from service
    AuthService.register(vm.registerForm, $stateParams.ur, $stateParams)
      // handle success
      .then(function () {
        $state.go('profile')
        vm.disabled = false
        vm.registerForm = {}
      })
      // handle error
      .catch(function () {
        vm.error = true
        vm.errorMessage = "Something went wrong!"
        vm.disabled = false
        vm.registerForm.username = ''
        vm.registerForm.password = ''
      })
  }
  // vm.login = function() {
  //   $state.go('login')
  // }
}
