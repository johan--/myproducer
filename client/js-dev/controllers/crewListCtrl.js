angular.module('myApp')
  .controller('crewListController', crewListController)

crewListController.$inject = ['$rootScope', '$http', '$stateParams', '$state', 'AuthService', '$mixpanel']

// PRODUCTIONS

function crewListController($rootScope, $http, $stateParams, $state, AuthService, $mixpanel){
  var vm = this
  vm.showModal = false;
  vm.notifModal = {}
  vm.hoverApprovedCrew = false
  vm.hoverPendingCrew = false

  $rootScope.activeTab = {}
  $rootScope.activeTab.crewList = true

  AuthService.getUserStatus()
    .then(function(data){
      $http.get('/api/users/' + data.data.user._id + '/contacts')
        .success(function(data){
          vm.currentUser = data
          if (vm.currentUser.role === 'crew') {
            $state.go('profile')
          }
          vm.inviteUrl = 'http://myproducer.io/#/register?r=' + data._id + '&ur=crew'
          vm.ready = true
        })
  })

  // ADD USER TO CONTACTS

  vm.addContact = function() {
    // search for existing user here
    $http.post('/api/users/addcontact', vm.newContact)
      .success(function (data) {
        vm.newContact.email = ''
        vm.newContact.first_name = ''
        vm.newContact.last_name = ''
        $mixpanel.track('Add Contact Clicked', {"user" : vm.currentUser.username})

        if(data) {
          if(data.success) {
            vm.notifModal.isSuccess = true
            var username = data.data.username
            vm.notifModal.content = 'You have successfully added ' + username + ' to your crew list.'
            vm.currentUser.contacts.push(data.data)
          } else if(data.newSuccess){
            vm.notifModal.isSuccess = true
            vm.notifModal.content = 'We have sent an invitation to ' + data.newEmail + '. They will appear in your crew list once they accept.'
          } else {
            vm.notifModal.isFailure = true
            vm.notifModal.content = data.message
          }
        // unsure we if we need this anymore -ak
        } else {
          vm.notifModal.isSuccess = true
          vm.notifModal.content = 'We have sent an invitation to ' + vm.newContact.email + '. They will appear in your crew list when they accept.'
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

  vm.deleteContact = function(contact){
    $http.patch('/api/users/delete-contact', {contact: contact, currentUser: vm.currentUser})
    .success(function(data){
      vm.currentUser.contacts = data.user.contacts
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

  vm.openDeleteContactModal = function(contact){
    vm.contact = contact
    vm.showDeleteContactModal = true;
  }

  vm.handleAddToButton = function(id, username) {
    vm.selectedUserId = id;
    vm.selectedUsername = username;
    // console.log(vm.selectedUserId);
    vm.openModal()
  }

  vm.addCrewToProduction = function(productionId, productionName) {
    var offer = {
      to: vm.selectedUserId,
      production: productionId
    }
    // console.log(offer);
    $http.post('/api/crew/', offer)
     .success(function(data) {
      //  console.log(data);

       vm.notifModal.isSuccess = true
       vm.notifModal.content = 'You have successfully added ' + vm.selectedUsername + ' to ' + productionName + '.'
     })
     .error(function(data) {
      //  console.log(data);

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
    vm.notifModal.isSuccess = false
    vm.notifModal.isFaiure = false
  }

  vm.closeDeleteContactModal = function(){
    vm.showDeleteContactModal = false;
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
