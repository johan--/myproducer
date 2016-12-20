angular.module('myApp')
  .controller('postController', postController)

postController.$inject = ['$http', '$stateParams', '$state', 'ProductionFactory', 'AuthService']

// PRODUCTIONS

function postController($http, $stateParams, $state, ProductionFactory, AuthService){
  var vm = this
  vm.currentUser = {}

  // vm.currentUser.productions = []
  AuthService.getUserStatus()
    .then(function(data){
      // vm.currentUser = data.data.user
      // console.log(data.data.user)
      $http.get('/api/users/' + data.data.user._id)
        .success(function(data){
          vm.currentUser = data
          console.log(data);
        })
  })

  // EDIT USER
  vm.editUser = function() {
    $http.patch('/api/users/'+ vm.currentUser._id, vm.currentUser)
      .success(function(data) {
        $state.reload();
      })
  }
}
