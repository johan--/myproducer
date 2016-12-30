angular.module('myApp')
  .controller('homeController', homeController)

homeController.$inject = ['$rootScope', '$state', '$stateParams']

// HOME CONTROLLER:
function homeController($rootScope, $state, $stateParams) {
  var vm = this

  if($rootScope.isLoggedIn) {
    console.log('ding');
    $state.go('profile')
  }

  if($stateParams.reg) {
    vm.registerIntent = true
  }
}
