angular.module('myApp')
  .controller('resetPasswordController', resetPasswordController)

resetPasswordController.$inject = ['$rootScope', '$state', '$stateParams']

// Reset Password CONTROLLER:
function resetPasswordController($rootScope, $state, $stateParams) {
  console.log("resetPasswordController instantiated");
  var vm = this
}
