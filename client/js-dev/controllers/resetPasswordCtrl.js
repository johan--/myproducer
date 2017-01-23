angular.module('myApp')
  .controller('resetPasswordController', resetPasswordController)

resetPasswordController.$inject = ['$rootScope', '$state', '$stateParams', 'AuthService']

// Reset Password CONTROLLER:
function resetPasswordController($rootScope, $state, $stateParams, AuthService) {
  console.log("resetPasswordController instantiated");
  var vm = this
  AuthService.checkToken($stateParams.token)
    .then(function(data){
      if(!data.user){$state.go('home')}
    })

  vm.resetPassword = function(password){
    AuthService.resetPassword($stateParams.token, password)
  }


}
