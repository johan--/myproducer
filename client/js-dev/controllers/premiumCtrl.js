angular.module('myApp')
  .controller('premiumController', premiumController)

premiumController.$inject = ['$rootScope', '$state', '$stateParams', 'AuthService']

// REGISTER CONTROLLER:
function premiumController($rootScope, $state, $stateParams, AuthService) {
  var vm = this

  $rootScope.activeTab = {}

  if($state.params.error){
    vm.error = true
    vm.errorMessage = "Something went wrong!"
    vm.disabled = false
  }

  if($rootScope.isLoggedIn) {
    // console.log('go to proile');
    $state.go('profile')
  } else if ($stateParams.ur === undefined) {
    $state.go('home', {reg: true})
  }

  vm.register = function () {
    // service route to return just the plan and the signup form values.
    $state.go('stripe', {plan: $stateParams.plan, form: vm.registerForm})
  }
}
