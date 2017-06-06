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
      $http.get('/api/users/' + vm.currentUser._id)
        .success(function(data){
          vm.currentUser = data

          $http.get('/api/users/' + $stateParams.id + '/profile')
            .then(function(data){
              vm.user = data.data
              vm.first_name = vm.user.first_name.charAt(0).toUpperCase() + vm.user.first_name.slice(1)
              vm.resume = vm.user.resume || ''
              if(vm.user.website){
                var http = 'http://'
                if(vm.user.website[0] && vm.user.website[1] &&  vm.user.website[2] === 'w') {
                  vm.user.website = http + vm.user.website
                } else if(vm.user.website[4] === 's'){
                  vm.user.website = http + vm.user.website.slice(8)
                }
              }

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

  vm.removeHover = function($event){
    var target = $($event.target)
    target.css('text-decoration', 'none')
    target.css('color', '#FFFFFF')
  }

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

  vm.compareDate = function(date){
    date = new Date(date)
    date.setDate(date.getDate() + 1)
    if(!date){
      return false
    }
    return new Date() < date
  }

  vm.setIframeSrc = function(){
    document.getElementById('resumeElement').src = vm.resume
  }

  vm.showModal = function(){
    vm.modal.show = true
  }

  vm.openModal3 = function() {
    vm.modal.show3 = true
  }

  vm.closeModal3 = function() {
    vm.modal.show3 = false
  }

  vm.closeModal = function(){
    vm.modal.show = false
  }

  String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
}
