angular.module('myApp')
  .controller('mainController', mainController)

mainController.$inject = ['$rootScope', '$state', 'AuthService']

function mainController($rootScope, $state, AuthService) {
  var vm = this

  $rootScope.activeTab = {}
  $rootScope.isLoggedIn = false

  $rootScope.$on('$stateChangeStart', function (event) {
    AuthService.getUserStatus()
      .then(function(data){
        vm.currentUser = data.data.user
        if (vm.currentUser) {
          $rootScope.isLoggedIn = true
        }
      })
  })
}
