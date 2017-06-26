angular.module('myApp')
  .controller('productionController', productionController)
  .directive('autocomplete', autocomplete)

productionController.$inject = ['$rootScope', '$http', '$stateParams', '$state', 'AuthService', '$mixpanel', '$timeout', '$q', '$log', '$scope']

autocomplete.$inject = ['$rootScope', '$timeout', 'AuthService', '$http']

function autocomplete($rootScope, $timeout, AuthService, $http){
  var vm = this
  $rootScope.contactsChosenIds = []

  $timeout(function(){
    vm.currentUser = $rootScope.user
    $http.get('/api/users/' + vm.currentUser._id + '/contacts')
    .success(function(data){
      vm.contacts = data.contacts.map(function(c){
        return {
          label: c.first_name + ' ' + c.last_name,
          value: c._id
        }
      })
    })
  }, 0)

  return {
    restrict: 'AEC',
    require: 'ngModel',
    link: function(scope, iElement, iAttrs){
      $(iElement).autocomplete({
        source: vm.contacts,
        select: function(evt, ui) {
          // after choosing a contact
          $rootScope.contactsChosenIds.push(ui.item.value)
          var target = $(evt.target)
          target.parent().css('display', 'none')
          target.css('display', 'none')
          var newP = $('<p></p>')
          var pencil = $('<i></i>')
          pencil.addClass('fa')
          pencil.addClass('fa-pencil')
          newP.text(ui.item.label)
          newP.append(pencil)

          pencil.on('click', function(){
            $(this).parent().css('display', 'none')
            target.css('display', 'inline-block')
            target.parent().css('display', 'block')
            target.val($(this).parent().text())
            var index = Number(target.attr('id'))
            $rootScope.contactsChosenIds.splice(index, 1)
          })

          $('#role-list').append(newP)
          $timeout(function(){
            $(iElement).trigger('input')
          }, 0)
        }
      })
    }
  }
}

// PRODUCTION CONTROLLER

function productionController($rootScope, $http, $stateParams, $state, AuthService, $mixpanel, $timeout, $q, $log, $scope){
  var vm = this
  $rootScope.user = $scope.$resolve.user.data.user
  vm.offers = []
  vm.currentUser = {}
  $rootScope.activeTab = {}
  $rootScope.activeTab.production = true
  vm.hoverHire = false
  vm.notifModal = {}
  vm.notifyCrewModal = {}
  vm.departmentModal = {}
  vm.roleModal = {
    error: false,
    errorContent: ''
  }
  vm.editingState = false
  vm.googleLocation1 = ''
  vm.googleLocation2 = ''
  vm.editingRole = false
  vm.number = 1

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
      $http.get('/api/users/' + vm.currentUser._id + '/contacts')
        .success(function(data){
          vm.currentUser = data

          $http.get('/api/productions/' + $stateParams.id)
            .success(function(production) {
              vm.production = production
              vm.departments = production.departments
              var roles = vm.departments.map(function(d){
                return d.roles
              })
              vm.roles = roles
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
      // offer validation
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

        // setup offer object to send to back end
        vm.offer = {
          offer : {
            status : 'Pending',
            position : newOffer.position,
            rate : newOffer.rate,
            hours : newOffer.hours
          },
          department: departmentId
        }

        $http.patch('api/crew/' + id, vm.offer)
          .success(function(data) {
            for(var i=0; i<vm.departments.length; i++){
              if(vm.departments[i]._id === data._id){
                vm.departments[i] = data
                vm.notifModal.isSuccess = true
                vm.notifModal.content = 'You have successfully sent on offer to ' + vm.departments[i].crew[$index].to.username + '.'
              }
            }
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

    // After clicking 'Add' on offer modal
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

    // to render 'Assign To' input fields based on the select tag option that is chosen
    vm.getNumber = function(num){
      return new Array(num)
    }

    vm.assignRoleUsers = function(){
      vm.number = Number(vm.roleNumber)
    }

    // after hitting 'Yes' in modal to remove offer
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
          console.log(data);
          vm.departmentModal.show = false
          vm.departments = data.departments
        })
    }

    vm.createRole = function(){
      var
        position = $('#task-title').val(),
        count = parseInt($('#task-select').val()),
        basis = $('#role-basis').val(),
        rate = $('#role-rate').val(),
        hours = $('#role-hours').val()

        // input validation
        if(position == ''){
          return vm.roleModal.errorContent = 'Please enter a role title to proceed'
        }

        for(var i=0; i<count; i++){
          if($rootScope.contactsChosenIds.length != count){
            return vm.roleModal.errorContent = 'Please assign a contact from your contact list'
          } else if($('#' + i).val() == ''){
            return vm.roleModal.errorContent = 'Please assign a contact to this role'
          }

          var roleData = {
            position: position,
            basis: basis,
            rate: rate,
            hours: hours,
            department: vm.departmentId,
            contactId: $rootScope.contactsChosenIds[i]
          }

          $http.post('/api/productions/newrole', roleData)
            .success(function(data){
              for(var i=0; i<vm.departments.length; i++){
                if(vm.departments[i]._id === vm.departmentId){
                  vm.departments[i].roles = data.roles
                }
              }
              $rootScope.contactsChosenIds = []
              $state.go($state.current, {}, {reload: true})
              vm.closeRoleModal()
            })
        }
    }

    vm.removeRole = function(index, role, department){
      const roleData = {
        department: department,
        role: role
      }

      $http.post('/api/productions/removeRole', roleData)
        .success(function(data){
          for(var i=0; i<vm.departments.length; i++){
            if(vm.departments[i]._id === data._id){
              vm.departments[i].roles = data.roles
            }
          }
        })
    }

    // TODO next step with roles
    vm.assignToRole = function(role, department){
      role.editing = true
    }

    vm.openRoleModal = function(id){
      setTimeout(function(){
        $('#task-select')[0].options[1].defaultSelected = true
      }, 100)
      vm.departmentId = id
      vm.roleModal.show = true
    }

    vm.closeRoleModal = function(){
      vm.roleModal.show = false
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
