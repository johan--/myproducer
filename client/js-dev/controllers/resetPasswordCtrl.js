angular.module('myApp')
  .controller('resetPasswordController', resetPasswordController)

resetPasswordController.$inject = ['$rootScope', '$state', '$stateParams', 'AuthService']

// Reset Password CONTROLLER:
function resetPasswordController($rootScope, $state, $stateParams, AuthService) {
  console.log("resetPasswordController instantiated");
  var vm = this
  AuthService.resetPassword($stateParams.token)
    .then(function(data){
      console.log('Data: resetPasswordController line 13');
      console.log(data.user);
      if(!data.user){$state.go('home')}
    })


}
