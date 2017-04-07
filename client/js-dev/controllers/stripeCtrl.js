angular.module('myApp')
  .controller('stripeController', stripeController)

stripeController.$inject = ['$rootScope', '$state', '$stateParams', 'AuthService']

function stripeController($rootScope, $state, $stateParams, AuthService) {
  var vm = this

  AuthService.getUserStatus()
    .then(function(data){
      $http.get('/api/users/' + data.data.user._id + '/profile')
        .success(function(data) {
          vm.currentUser = data
        })
    })

  vm.makeStripeSubscription = function() {

    const xhr = new XMLHttpRequest()
    vm.disabled = true
    vm.error = false

    xhr.open('GET', '/stripe/register', {email: vm.currentUser.username })
    xhr.onreadystatechange = function() {
      if(xhr.readyState === 4){
        if(xhr.status === 200){

        }
      }
    }
  }

  $rootScope.activeTab = {}

}
