angular.module('myApp')
  .controller('otherProfileController', otherProfileController)

otherProfileController.$inject = ['$http', '$stateParams', '$state', 'ProductionFactory', 'AuthService']

// OTHER PROFILE

function otherProfileController($http, $stateParams, $state, ProductionFactory, AuthService){
  var vm = this;

  vm.currentUser = {}
  AuthService.getUserStatus()
    .then(function(data){
      vm.currentUser = data.data.user
      // console.log(data.data.user)
      $http.get('/api/users/' + vm.currentUser._id)
        .success(function(data){
          vm.currentUser = data
          console.log(data);


          $http.get('/api/users/' + $stateParams.id)
            .then(function(data){
              vm.user = data.data

              vm.isPending = vm.currentUser.pendingContacts.find(function(pc) {
                return pc._id === vm.user._id
              })
            })
        })
  })
}
