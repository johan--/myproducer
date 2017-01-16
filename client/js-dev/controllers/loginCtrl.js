angular.module('myApp')
  .controller('loginController', loginController)

loginController.$inject = ['$rootScope', '$state', '$stateParams', 'AuthService']

// LOGIN CONTROLLER:
function loginController($rootScope, $state, $stateParams, AuthService) {
  var vm = this

  $rootScope.activeTab = {}
  vm.userRole = $stateParams.ur

  if($rootScope.isLoggedIn) {
    // console.log('go to proile');
    $state.go('profile')
  }

  vm.login = function () {

    // initial values
    vm.error = false
    vm.disabled = true

    // call login from service
    AuthService.login(vm.loginForm.username, vm.loginForm.password)
      // handle successful login
      // console.log("successful login")
      .then(function () {
        // if they had been trying to view a particular page but weren't logged in yet
        // if its a particular offer...
        if( $rootScope.returnToState === "/offer/:id" ) {
          // send them to that offer after sucessful login
          $state.go('offer', {"id":$rootScope.returnToStateParams})
        }
        // if it's a particular production ...
        else if ( $rootScope.returnToState === "/production/:id" ) {
          // send them to that production after sucessful login
          $state.go('production', {"id":$rootScope.returnToStateParams})
        }
        else {
          //redirect all others to profile after login
          $state.go('profile');
        }
        vm.disabled = false
        vm.loginForm = {}
      })
      // handle error
      .catch(function () {
        // console.log("Whoops...")
        vm.error = true
        vm.errorMessage = "Invalid email and/or password"
        vm.disabled = false
        vm.loginForm = {}
      })
  }
}
