angular.module('myApp')
  .controller('premiumController', premiumController)

premiumController.$inject = ['$rootScope', '$state', '$stateParams', 'AuthService']

// REGISTER CONTROLLER:
function premiumController($rootScope, $state, $stateParams, AuthService) {
  var vm = this

  console.log($stateParams);

  $rootScope.activeTab = {}

  if($rootScope.isLoggedIn) {
    // console.log('go to proile');
    $state.go('profile')
  } else if ($stateParams.ur === undefined) {
    $state.go('home', {reg: true})
  }

  vm.register = function () {

    // initial values
    vm.error = false
    vm.disabled = true

    // call register from service
    AuthService.registerPremium(vm.registerForm, $stateParams.ur, $stateParams)
      // handle success
      .then(function() {
        $state.go('stripe')
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
