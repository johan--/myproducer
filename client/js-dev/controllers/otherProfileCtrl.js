angular.module('myApp')
  .controller('otherProfileController', otherProfileController)

otherProfileController.$inject = ['$rootScope', '$http', '$stateParams', '$state', 'AuthService']

// OTHER PROFILE

function otherProfileController($rootScope, $http, $stateParams, $state, AuthService){
  var vm = this;
  vm.modal = {}
  vm.modal.show = false;

  vm.currentUser = {}

  $rootScope.activeTab = {}
  $rootScope.activeTab.crewList = true

  AuthService.getUserStatus()
    .then(function(data){
      vm.currentUser = data.data.user
      // console.log(data.data.user)
      $http.get('/api/users/' + vm.currentUser._id)
        .success(function(data){
          vm.currentUser = data
          // console.log(data);


          $http.get('/api/users/' + $stateParams.id + '/profile')
            .then(function(data){
              vm.user = data.data
              if(vm.user.picture){
                vm.profilePicture = vm.user.picture
              }else {vm.profilePicture = "./img/profile_default.png"}

              vm.isPending = vm.currentUser.pendingContacts.find(function(pc) {
                return pc === vm.user._id
              })

              vm.ready = true
            })
        })
  })

  vm.updateContactStatus = function(status) {
    // console.log(status);
    // console.log($stateParams.id);

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
