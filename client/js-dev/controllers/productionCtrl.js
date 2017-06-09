angular.module('myApp')
  .controller('productionController', productionController)

productionController.$inject = ['$rootScope', '$http', '$stateParams', '$state', 'AuthService', '$mixpanel']

// PRODUCTION CONTROLLER

function productionController($rootScope, $http, $stateParams, $state, AuthService, $mixpanel){
  var vm = this
  vm.offers = []
  vm.currentUser = {}
  $rootScope.activeTab = {}
  $rootScope.activeTab.production = true
  vm.hoverHire = false
  vm.notifModal = {}
  vm.notifyCrewModal = {}
  vm.departmentModal = {}
  vm.taskModal = {}
  vm.editingState = false
  vm.googleLocation1 = ''
  vm.googleLocation2 = ''

  ////////////////// GOOGLE PLACES API ///////////////

  vm.loadGooglePlaces = function(){
    // get initial values of the location input fields
    vm.location1 = document.getElementById('location1').innerHTML
    vm.location2 = document.getElementById('location2').innerHTML
    vm.googleLocations = [vm.location1, vm.location2]

    vm.locationInput1 = document.getElementById('production1Location');

    vm.locationInput2 = document.getElementById('production2Location');

    var autocomplete1 = new google.maps.places.Autocomplete(vm.locationInput1);

    var autocomplete2 = new google.maps.places.Autocomplete(vm.locationInput2);

    autocomplete1.addListener('place_changed', function(){
      const placeChosen1 = autocomplete1.getPlace()
      vm.googleLocation1 = placeChosen1.formatted_address
      vm.googleLocations[0] = vm.googleLocation1
    })

    autocomplete2.addListener('place_changed', function(){
      const placeChosen2 = autocomplete2.getPlace()
      vm.googleLocation2 = placeChosen2.formatted_address
      vm.googleLocations[1] = vm.googleLocation2
    })

  }

  AuthService.getUserStatus()
    .then(function(data){
      vm.currentUser = data.data.user
      // console.log(data.data.user)
      $http.get('/api/users/' + vm.currentUser._id + '/contacts')
        .success(function(data){
          vm.currentUser = data

          $http.get('/api/productions/' + $stateParams.id)
            .success(function(production) {
              // console.log(production);
              vm.production = production
              vm.departments = production.departments
              // console.log(vm.departments);
              // console.log(vm.production);
              // console.log("Production from the Factory", vm.production)
              // splitNotes(production.notes)

              vm.isProducer = vm.production.by_._id === vm.currentUser._id

              vm.ready = true
            })
        })
  })

    vm.editProduction = function(){
      // if a location is deleted
      if(vm.locationInput1 || vm.locationInput2){
      vm.production.location[0] = vm.locationInput1.value
      vm.production.location[1] = vm.locationInput2.value
    }

      $http.patch('/api/productions/' + $stateParams.id, vm.production)
        .success(function(data) {
          vm.editingState = false
          // console.log(data);
          data.crew = vm.production.crew
          vm.production = data
          vm.notifModal.isSuccess = true
          vm.notifModal.content = 'You have successfully updated your production.'
          // splitNotes(vm.production.notes)
        })
        .error(function(data) {
          // console.log(data);
          vm.notifModal.isFailure = true
          vm.notifModal.content = 'An error has occurred. Please try again.'
        })
        .finally(function() {
          vm.openNotifModal()
        })
    }

    vm.deleteProduction = function(){
      $http.delete('/api/productions/' + $stateParams.id)
        .success(function(data) {
          $state.go('production-list')
        })
    }

    vm.makeOffer = function(id, $index, departmentId) {
      if(!vm.offers[$index]){
        vm.error = true
        vm.errorMessage = "Please Fill Out Entire Offer"
      }else if(!vm.offers[$index].position){
        vm.error = true
        vm.errorMessage = "Please Select a Position"
      }else if (!vm.offers[$index].rate) {
        vm.error = true
        vm.errorMessage = "Please Provide Rate"
      } else if (!vm.offers[$index].hours) {
        vm.error = true
        vm.errorMessage = "Please Provide Hours"
      } else {
        var newOffer = vm.offers[$index]

        vm.offer = {
          offer : {
            status : 'Pending',
            position : newOffer.position,
            rate : newOffer.rate,
            hours : newOffer.hours
          },
          department: departmentId
        }
        // TODO this patches the offer, but somehow that doesn't reflect within the production object? Do we need to save the production as well on this patch?
        // TODO: Please confirm if the issue above has been fixed. -Kevin
        $http.patch('api/crew/' + id, vm.offer)
          .success(function(data) {
            // console.log(data);
            // need to update the departments crew instead of productions

            for(var i=0; i<vm.departments.length; i++){
              if(vm.departments[i]._id === data._id){
                vm.departments[i] = data
                vm.notifModal.isSuccess = true
                vm.notifModal.content = 'You have successfully sent on offer to ' + vm.departments[i].crew[$index].to.username + '.'
              }
            }

            // vm.production.crew[$index].offer.hours = data.offer.hours
            // vm.production.crew[$index].offer.position = data.offer.position
            // vm.production.crew[$index].offer.rate = data.offer.rate
            // vm.production.crew[$index].offer.status = data.offer.status

            vm.message = {
                content : 'I would like to invite you to be part of my production team.'
            }

            if(vm.message.content){
              $http.post('/api/crew/' + id + '/message', vm.message)
                .success(function(data) {
                  // console.log(data);
                })
            }

            $mixpanel.track('Hire Clicked', {"user" : vm.currentUser.username})

          })
          .error(function(data) {
            vm.notifModal.isFailure = true
            vm.notifModal.content = 'An error has occurred. Please try again.'
          })
          .finally(function() {
            vm.openNotifModal()
            vm.error = false
          })
      }
    }

    vm.addToCrew = function(id) {
      const departmentData = {
        crewId: id,
        departmentId: vm.departmentId,
        productionId: $stateParams.id
      }

      $http.post('/api/crew', departmentData)
        .success(function(data){
          for(var i=0; i<vm.departments.length; i++){
            if(vm.departments[i]._id === data._id){
              vm.departments[i] = data
              vm.departments[i].crew = data.crew
            }
          }
          vm.showModal = false
        })
        .error(function(data) {
          vm.notifModal.isFailure = true
          vm.notifModal.content = 'An error has occurred. Please try again.'
        })
        .finally(function() {
          vm.showModal = false
          vm.departmentId = ''
          // vm.openNotifModal()
        })
    }

    vm.removeFromCrew = function(crew, departmentId) {
      const deleteData = {
        department: departmentId
      }

      $http.patch('/api/crew/delete/' + crew._id, deleteData)
        .success(function(data){
          for(var i=0; i<vm.departments.length; i++){
            if(vm.departments[i]._id == data._id){
              vm.departments[i] = data
            }
          }
          vm.notifModal.isSuccess = true
          vm.notifModal.content = 'You have successfully removed this offer.'
        })
        .error(function(err){
          vm.notifModal.isFailure = true
          vm.notifModal.content = 'An error has occurred. Please try again.'
        })
        .finally(function() {
          vm.contact = {}
          vm.department = {}
          vm.openNotifModal()
        })
    }

    vm.closeModal = function(evt) {
      if(evt.target.getAttribute('id') === 'modal-container'){
        vm.selectedUserId = undefined;
        vm.showModal = false;
      }
    }

    vm.openModal = function(id) {
      vm.departmentId = id
      vm.showModal = true;
    }

    vm.openNotifModal = function() {
      vm.notifModal.show = true
    }

    vm.closeNotifModal = function() {
      vm.notifModal.show = false
      vm.notifModal.isSuccess = false
      vm.notifModal.isFailure = false
    }

    vm.compareDate = function(date){
      date = new Date(date)
      date.setDate(date.getDate() + 1)
      if(!date){
        return false
      }
      return new Date() < date
    }

    vm.notifyCrew = function() {
      vm.notifyCrewModal.show = false
      var content = $('#custom-message').val()
      var emailData = {
        content: content
      }
      $http.post('/api/productions/' + $stateParams.id + '/notify', emailData)
        .success(function(data) {
          // console.log(data);
          vm.notifModal.isSuccess = true
          vm.notifModal.content = 'You have successfully sent an email notification to your crew members.'
          vm.openNotifModal()
          $mixpanel.track('Notify Crew Clicked')
        })
    }

    // ADD USER TO CONTACTS

    vm.addContact = function() {
      // search for existing user here
      $http.post('/api/users/addcontact', vm.newContact)
        .success(function (data) {
          vm.newContact.email = ''
          vm.newContact.first_name = ''
          vm.newContact.last_name = ''
          // console.log(data);
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

    vm.createDepartment = function(){
      const title = $('#department-title').val()
      const departmentData = {
        title: title,
        production: $stateParams.id
      }

      $http.post('/api/productions/newdepartment', departmentData)
        .success(function(data){
          vm.departmentModal.show = false
          vm.departments = data.departments
        })
    }

    vm.createTask = function(){
      const
        position = $('#task-title').val()
        count = parseInt($('#task-select').val()),
        taskData = {
          position: position,
          production: $stateParams.id
        }

        for(var i=0; i<count; i++){
          $http.post('/api/productions/newtask', taskData)
            .success(function(data){
              console.log(data);
            })
        }

    }

    vm.openTaskModal = function(){
      vm.taskModal.show = true
    }

    vm.closeTaskModal = function(){
      vm.taskModal.show = false
    }

    vm.openDepartmentModal = function(){
      vm.departmentModal.show = true
    }

    vm.closeDepartmentModal = function(){
      vm.departmentModal.show = false
    }

    vm.openNotifyCrewModal = function(){
      vm.notifyCrewModal.show = true
    }

    vm.closeNotifyCrewModal = function(){
      vm.notifyCrewModal.show = false
    }

    vm.openDeleteContactModal = function(contact, department){
      vm.department = department
      vm.contact = contact
      vm.showDeleteContactModal = true;
    }

    vm.closeDeleteContactModal = function(){
      vm.showDeleteContactModal = false;
    }

    vm.deleteContact = function(contact){
      $http.patch('/api/users/delete-contact', {contact: contact, currentUser: vm.currentUser, department: vm.department})
      .success(function(data){
        console.log(data);
        // vm.currentUser.contacts = data.user.contacts
      })
    }

    splitNotes = function(notes){
      var notesArray = notes.split('\n\n')
      vm.production.notes = notesArray
      // console.log(vm.production.notes);

    }
}
