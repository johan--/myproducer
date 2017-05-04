angular.module('myApp')
  .controller('mainController', mainController)

mainController.$inject = ['$rootScope', '$state', 'AuthService', '$location']

function mainController($rootScope, $state, AuthService, $location) {
  var vm = this
  // these variables are for rendering either the home or login link on the main logo
  vm.isNotLogin = true
  vm.isLogin = false
  vm.dropDown = false
  vm.upgradeable = true

  vm.showDropdown = function(){
    if(vm.dropDown == false){vm.dropDown = true
    } else {vm.dropDown = false}

  }

  vm.upgradeAccount = function() {
    $state.go('profile', {upgradeModal: true})
  }

  $rootScope.activeTab = {}
  $rootScope.isLoggedIn = false

  $rootScope.$on('$stateChangeStart', function (event) {
    AuthService.getUserStatus()
      .then(function(data){
        vm.currentUser = data.data.user
        if(vm.currentUser != undefined){
          if(vm.currentUser.stripeAccount || vm.currentUser.stripePlan){
          vm.upgradeable = false
        }
      }
        if (vm.currentUser) {
          $rootScope.isLoggedIn = true
        }
      })
  })

  $rootScope.$on('$stateChangeSuccess', function(event){
    // checks current route and if in login or forgot-password state, renders home link as link to login
    if($location.path() == "/login" || "/forgot-password"){
      vm.isNotLogin = false
      vm.isLogin = true
    }
  })
}
