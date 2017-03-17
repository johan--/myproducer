angular.module('myApp')
  .controller('completeRegistrationController', completeRegistrationController)

completeRegistrationController.$inject = ['$rootScope', '$state', '$stateParams', 'AuthService']

// Complete Registration CONTROLLER
function completeRegistrationController($rootScope, $state, $stateParams, AuthService){
  console.log("completeRegistrationController instantiated");
  var vm = this
  vm.modalOpen = false

  AuthService.getUserStatus()
    .then(function(data) {
      if (!data.data.user || !data.data.user.resetPasswordToken) {
        $state.go('home')
      }

      vm.currentUser = data.data.user

      $stateParams.token = vm.currentUser.resetPasswordToken

      AuthService.checkCompRegToken($stateParams.token)
        .then(function(data){
          if(!data.user){$state.go('home')}
        })

      vm.completeRegistration = function(user){
        vm.disabled = true
        AuthService.completeRegistration($stateParams.token, vm.registerForm)
       .then(function(data){
        //  $state.go('login')
        vm.modalOpen = true
       })
      }
    })
}
