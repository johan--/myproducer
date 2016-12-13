angular.module('myApp')
  .controller('registerController', registerController)

registerController.$inject = ['$state', '$stateParams', 'AuthService']

// REGISTER CONTROLLER:
function registerController($state, $stateParams, AuthService) {
  var vm = this

  console.log($stateParams.p)

  vm.register = function () {

    // initial values
    vm.error = false
    vm.disabled = true

    // call register from service
    AuthService.register(vm.registerForm.username, vm.registerForm.password, $stateParams.p)
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
        vm.registerForm = {}
      })
  }
  // vm.login = function() {
  //   $state.go('login')
  // }
}
