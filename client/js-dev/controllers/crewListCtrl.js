angular.module('myApp')
  .controller('crewListController', crewListController)

crewListController.$inject = ['$rootScope', '$http', '$stateParams', '$state', 'AuthService', '$mixpanel', '$scope']

// PRODUCTIONS

function crewListController($rootScope, $http, $stateParams, $state, AuthService, $mixpanel, $scope){
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
          vm.inviteUrl = 'https://app.myproducer.io/#/register?r=' + data._id + '&ur=crew'
          vm.ready = true
        })
  })

  $scope.csv_chosen = function(csv){
    const csvFile = csv.files[0]
    const csvReader = new FileReader()

    csvReader.readAsText(csvFile)
    csvReader.onload = vm.loadHandler;
    csvReader.onerror = vm.errorHandler;
}

vm.loadHandler = function(event){
  var csv = event.target.result
  vm.processData(csv)
}

vm.processData = function(csv){
  var allTextLines = csv.split(/\r\n|\n/);
  var lines = [];
  for (var i=0; i<allTextLines.length; i++) {
    var data = allTextLines[i].split(';');
      for (var j=0; j<data.length; j++) {
        if(data[j][0] != ','){
          lines.push(data[j]);
        }
      }
  }
  vm.csvContacts = []
  for(var i = 0; i<lines.length; i++){
    var csvContent = lines[i].split(',')
    for(var c = 0; c<csvContent.length; c++){
      if(csvContent[c] != ''){
        var newContact = {
          first_name: csvContent[0],
          last_name: csvContent[1],
          email: csvContent[2]
        }
      }
    }
    vm.csvContacts.push(newContact)
  }
  // TODO: separate into new functions being called
  // next step: take the array of objects and create new contacts with that info
  console.log(vm.csvContacts);
}


vm.errorHandler = function(evt){
  if(evt.target.error.name == "NotReadableError") {
      alert("Canno't read file !");
  }
}

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
            vm.notifModal.isFailure = false
            var firstName = data.data.first_name
            var lastName = data.data.last_name
            vm.notifModal.content = 'You have successfully added ' + firstName + ' ' + lastName + ' to your approved contact list.'
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
