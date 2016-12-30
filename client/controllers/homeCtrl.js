angular.module('myApp')
  .controller('homeController', homeController)

homeController.$inject = ['$rootScope', '$state']

// HOME CONTROLLER:
function homeController($rootScope, $state) {
  var vm = this

  if($rootScope.isLoggedIn) {
    console.log('ding');
    $state.go('profile')
  }
}
