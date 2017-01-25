angular.module('myApp')
  .controller('forgotPasswordController', forgotPasswordController)

forgotPasswordController.$inject = ['$rootScope', '$state', '$stateParams', '$http', 'AuthService']

// Forgot Password CONTROLLER:
function forgotPasswordController($rootScope, $state, $stateParams, $http, AuthService) {
  console.log("forgotPasswordController instantiated");
  var vm = this

  vm.modalOpen = false
  vm.modal2Open = false
  vm.forgot = function(email){
    vm.disabled = true
    AuthService.forgotPassword(email)
      .then(function(data){
        if(data.message == "resolved"){
          vm.modalOpen = true
        } else {vm.modal2Open = true}
      })
  }
}
