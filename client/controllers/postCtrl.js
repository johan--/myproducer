angular.module('myApp')
  .controller('postController', postController)

postController.$inject = ['$http', '$stateParams', '$state', 'ProductionFactory', 'AuthService']

// PRODUCTIONS

function postController($http, $stateParams, $state, ProductionFactory, AuthService){
  var vm = this
  vm.currentUser = {}

  vm.editingState = false;

  vm.modal = {}
  vm.modal.show = false;

  // vm.currentUser.productions = []
  AuthService.getUserStatus()
    .then(function(data){
      // vm.currentUser = data.data.user
      // console.log(data.data.user)
      $http.get('/api/users/' + data.data.user._id + '/profile')
        .success(function(data){
          vm.currentUser = data
          console.log(data);
        })
  })

  // EDIT USER
  vm.editUser = function() {
    $http.patch('/api/users/'+ vm.currentUser._id, vm.currentUser)
      .success(function(data) {
        data.productions = vm.currentUser.productions
        data.offersReceived = vm.currentUser.offersReceived
        vm.currentUser = data
        vm.modal.isSuccess = true
        vm.modal.content = 'You have successfully updated your profile.'
      })
      .error(function(data) {
        vm.modal.isFailure = true
        vm.modal.content = 'An error has occurred. Please try again.'
      })
      .finally(function() {
        vm.editingState = false
        vm.openModal()
      })
  }

  vm.openModal = function() {
    vm.modal.show = true
  }

  vm.closeModal = function() {
    vm.modal.show = false
  }
}
