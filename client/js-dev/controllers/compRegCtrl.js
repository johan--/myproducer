angular.module('myApp')
  .controller('completeRegistrationController', completeRegistrationController)

completeRegistrationController.$inject = ['$rootScope', '$state', '$stateParams', 'AuthService']

// Complete Registration CONTROLLER
function completeRegistrationController($rootScope, $state, $stateParams, AuthService){
  console.log("completeRegistrationController instantiated");
  console.log("state params in compRegCtrl");
  console.log($stateParams);
  var vm = this
  vm.modalOpen = false

  AuthService.checkCompRegToken($stateParams.token)
    .then(function(data){
      console.log("data in compRegCtrl")
      console.log(data)
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
}
