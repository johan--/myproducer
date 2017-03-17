angular.module('myApp')
  .controller('resetPasswordController', resetPasswordController)

resetPasswordController.$inject = ['$rootScope', '$state', '$stateParams', 'AuthService']

// Reset Password CONTROLLER:
function resetPasswordController($rootScope, $state, $stateParams, AuthService) {
  console.log("resetPasswordController instantiated");
  console.log($stateParams.token)
  var vm = this

  vm.modalOpen = false
  AuthService.checkToken($stateParams.token)
    .then(function(data){
      if(!data.user){$state.go('home')}
    })

  vm.resetPassword = function(password){
    vm.disabled = true
    AuthService.resetPassword($stateParams.token, password)
     .then(function(data){
      //  $state.go('login')
      vm.modalOpen = true
     })
  }


}
