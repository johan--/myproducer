angular.module('myApp')
  .controller('pendingCrewController', pendingCrewController)

pendingCrewController.$inject = ['$rootScope', '$http', '$stateParams', '$state', 'AuthService']

function pendingCrewController($rootScope, $http, $stateParams, $state, AuthService) {
  var vm = this

  vm.currentUser = {}
  vm.pendingList = []
  vm.leftButton = true
  vm.rightButton = true

  AuthService.getUserStatus()
    .then(function(data) {
      $http.get('/api/users/' + data.data.user._id + '/contacts')
        .success(function(data) {
          vm.currentUser = data

          // push each contact id to a new array
          vm.currentUser.pendingContacts.forEach(function(c) {
            vm.pendingList.push(c._id)
          })

          // get index of pending contacts array
          vm.currentIndex = vm.pendingList.indexOf($stateParams.id)

          // conditionals to show buttons
          if(vm.currentIndex === 0){
            vm.leftButton = false
          } else if(vm.currentIndex === vm.pendingList.length - 1){
            vm.rightButton = false
          }

          // get user that current user is viewing
          $http.get('/api/users/' + $stateParams.id + '/profile')
            .then(function(data){
              vm.user = data.data
              if(vm.user.picture){
                vm.profilePicture = vm.user.picture
              }else {
                vm.profilePicture = "./img/profile_default.png"
              }
              vm.isPending = vm.currentUser.pendingContacts.find(function(pc) {
                return pc._id === vm.user._id
              })
              vm.ready = true
            })
        })
    })

    vm.updateContactStatus = function(status, user) {
      $http.patch('/api/users/updateContact?of=' + $stateParams.id + '&status=' + status)
        .then(function success(data){
          if(status == 'approve'){
            vm.modal.content = 'You have added ' + user.first_name.capitalize() + ' ' + user.last_name.capitalize() + ' as an approved contact.'
          } else {vm.modal.content = 'You have declined to add ' + user.first_name.capitalize() + ' ' + user.last_name.capitalize() + ' as an approved contact.'}
          vm.isPending = false
          vm.showModal()
        }, function failure() {
          vm.modal.content = 'An error has occurred. Please try again.'
          vm.showModal()
        })
    }

    // switch profiles depending on which button was clicked
    vm.changeProfile = function(button) {
      if(button == 'left'){
        vm.currentIndex -= 1
      } else if(button == 'right') {
        vm.currentIndex += 1
      }
      $state.go('pending-crew', {id: vm.currentIndex})
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

    String.prototype.capitalize = function() {
      return this.charAt(0).toUpperCase() + this.slice(1);
  }
}
