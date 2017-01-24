angular.module('myApp')
  .controller('forgotPasswordController', forgotPasswordController)

forgotPasswordController.$inject = ['$rootScope', '$state', '$stateParams', '$http', 'AuthService']

// Forgot Password CONTROLLER:
function forgotPasswordController($rootScope, $state, $stateParams, $http, AuthService) {
  console.log("forgotPasswordController instantiated");
  var vm = this

  vm.modalOpen = false
  vm.forgot = function(email){
    AuthService.forgotPassword(email)
      .then(function(data){
        vm.modalOpen = true
      })
  }
}
