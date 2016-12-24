angular.module('myApp')
  .controller('postController', postController)

postController.$inject = ['$rootScope', '$http', '$stateParams', '$state', 'ProductionFactory', 'AuthService']

// PRODUCTIONS

function postController($rootScope, $http, $stateParams, $state, ProductionFactory, AuthService){
  var vm = this
  vm.currentUser = {}

  vm.editingState = false;

  vm.modal = {}
  vm.modal.show = false;

  $rootScope.activeTab = {}
  $rootScope.activeTab.profile = true

  // vm.currentUser.productions = []
  AuthService.getUserStatus()
    .then(function(data){
      // vm.currentUser = data.data.user
      // console.log(data.data.user)
      $http.get('/api/users/' + data.data.user._id + '/profile')
        .success(function(data){
          vm.currentUser = data
          vm.ready = true
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

  vm.compareDate = function(date){
    date = new Date(date)
    date.setDate(date.getDate() + 1)
    if(!date){
      return false
    }
    return new Date() < date
  }
}
