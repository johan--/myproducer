angular.module('myApp')
  .controller('premiumController', premiumController)

premiumController.$inject = ['$rootScope', '$state', '$stateParams', 'AuthService']

// REGISTER CONTROLLER:
function premiumController($rootScope, $state, $stateParams, AuthService) {
  var vm = this

  $rootScope.activeTab = {}

  if($rootScope.isLoggedIn) {
    // console.log('go to proile');
    $state.go('profile')
  } else if ($stateParams.ur === undefined) {
    $state.go('home', {reg: true})
  }

  vm.register = function () {

    // initial values
    vm.error = false
    vm.disabled = true

    // call register from service
    AuthService.registerPremium(vm.registerForm, $stateParams.ur, $stateParams, $stateParams.plan)
      // handle success
      .then(function(data) {
        // return new Promise(function(resolve,reject){
          // $stateProvider.state('stripe', {
          //   url: '/premium-payment',
          //   templateUrl: 'templates/stripe.html',
          //   controller: 'stripeController as stripeCtrl',
          //   resolve: stripeController.resolve
          // })
          $state.go('stripe', {id: data.user._id, plan: data.plan})
          vm.disabled = false
          vm.registerForm = {}
        //   .resolve(function(data){
        //     return console.log(data);
        //   })
        //   .reject(function(data){
        //     return console.log(data);
        //   })
        // })
      })
      // handle error
      .catch(function () {
        vm.error = true
        vm.errorMessage = "Something went wrong!"
        vm.disabled = false
        vm.registerForm.username = ''
        vm.registerForm.password = ''
      })
  }
  // vm.login = function() {
  //   $state.go('login')
  // }
}
