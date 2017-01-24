angular.module('myApp')
  .controller('forgotPasswordController', forgotPasswordController)

forgotPasswordController.$inject = ['$rootScope', '$state', '$stateParams', '$http', 'AuthService']

// Forgot Password CONTROLLER:
function forgotPasswordController($rootScope, $state, $stateParams, $http, AuthService) {
  console.log("forgotPasswordController instantiated");
  var vm = this
  vm.forgot = function(email){
    AuthService.forgotPassword(email)
  }
}
