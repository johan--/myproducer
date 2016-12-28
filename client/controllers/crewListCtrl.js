angular.module('myApp')
  .controller('crewListController', crewListController)

crewListController.$inject = ['$rootScope', '$http', '$stateParams', '$state', 'ProductionFactory', 'AuthService']

// PRODUCTIONS

function crewListController($rootScope, $http, $stateParams, $state, ProductionFactory, AuthService){
  var vm = this
  vm.showModal = false;
  vm.notifModal = {}

  $rootScope.activeTab = {}
  $rootScope.activeTab.crewList = true

  AuthService.getUserStatus()
    .then(function(data){
      // vm.currentUser = data.data.user
      // console.log(data.data.user)
      $http.get('/api/users/' + data.data.user._id + '/contacts')
        .success(function(data){
          vm.currentUser = data

          if (vm.currentUser.role === 'crew') {
            $state.go('profile')
          }

          vm.inviteUrl = 'http://myproducer.io/#/register?r=' + data._id
          vm.ready = true
          console.log(data);
        })
  })

  // ADD USER TO CONTACTS

  vm.addContact = function() {
    // search for existing user here
    $http.post('/api/users/addcontact', vm.newContact)
      .success(function (data) {
        vm.newContact.email = ''

        vm.notifModal.isSuccess = true

        if(data.data) {
          var username = data.data.username
          vm.notifModal.content = 'You have successfully added ' + username + ' to your crew list.'
        } else {
          vm.notifModal.content = 'We have sent an invitation to ' + vm.newContact.email + ' to  be part of your crew list.'
        }
      })
      .error(function(data) {
        vm.notifModal.isFailure = true
        vm.notifModal.content = 'An error has occurred. Please try again.'
      })
      .finally(function() {
        vm.openNotifModal()
      })
  }

  vm.closeModal = function(evt) {
    if(evt.target.getAttribute('id') === 'modal-container'){
      vm.selectedUserId = undefined;
      vm.showModal = false;
    }
  }

  vm.openModal = function() {
    vm.showModal = true;
  }

  vm.handleAddToButton = function(id, username) {
    vm.selectedUserId = id;
    vm.selectedUsername = username;
    console.log(vm.selectedUserId);
    vm.openModal()
  }

  vm.addCrewToProduction = function(productionId, productionName) {
    var offer = {
      to: vm.selectedUserId,
      production: productionId
    }
    console.log(offer);
    $http.post('/api/crew/', offer)
     .success(function(data) {
       console.log(data);

       vm.notifModal.isSuccess = true
       vm.notifModal.content = 'You have successfully added ' + vm.selectedUsername + ' to ' + productionName + '.'
     })
     .error(function(data) {
       console.log(data);

       vm.notifModal.isFailure = true
       vm.notifModal.content = 'An error has occurred. Please try again.'
     })
     .finally(function() {
       vm.openNotifModal()
     })
  }

  vm.openNotifModal = function() {
    vm.notifModal.show = true
  }

  vm.closeNotifModal = function() {
    vm.notifModal.show = false
  }
}
