angular.module('myApp')
  .controller('otherProfileController', otherProfileController)

otherProfileController.$inject = ['$http', '$stateParams', '$state', 'ProductionFactory', 'AuthService']

// OTHER PROFILE

function otherProfileController($http, $stateParams, $state, ProductionFactory, AuthService){
  var vm = this;
  vm.modal = {}
  vm.modal.show = false;

  vm.currentUser = {}
  AuthService.getUserStatus()
    .then(function(data){
      vm.currentUser = data.data.user
      // console.log(data.data.user)
      $http.get('/api/users/' + vm.currentUser._id)
        .success(function(data){
          vm.currentUser = data
          console.log(data);


          $http.get('/api/users/' + $stateParams.id + '/profile')
            .then(function(data){
              vm.user = data.data

              vm.isPending = vm.currentUser.pendingContacts.find(function(pc) {
                return pc === vm.user._id
              })
            })
        })
  })

  vm.updateContactStatus = function(status) {
    console.log(status);
    console.log($stateParams.id);

    $http.patch('/api/users/updateContact?of=' + $stateParams.id + '&status=' + status)
      .then(function success(data){
        vm.modal.content = 'You have ' + status + 'd offer to join your crew list.'
        vm.showModal()
      }, function failure() {
        vm.modal.content = 'An error has occurred. Please try again.'
        vm.showModal()
      })
  }

  vm.compareDate = function(date){
    date = new Date(date)
    date.setDate(date.getDate() + 1)
    if(!date){
      return false
    }
    return new Date() < date
  }

  vm.showModal = function(){
    vm.modal.show = true
  }

  vm.closeModal = function(){
    vm.modal.show = false
  }
}
