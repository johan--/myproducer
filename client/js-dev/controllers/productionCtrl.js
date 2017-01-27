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

  vm.notifModal = {}

  vm.editingState = false

  AuthService.getUserStatus()
    .then(function(data){
      vm.currentUser = data.data.user
      // console.log(data.data.user)
      $http.get('/api/users/' + vm.currentUser._id + '/contacts')
        .success(function(data){
          vm.currentUser = data
          // console.log(data);



          $http.get('/api/productions/' + $stateParams.id)
            .success(function(production) {
              vm.production = production
              // console.log("Production from the Factory", vm.production)

              vm.isProducer = vm.production.by_._id === vm.currentUser._id

              vm.ready = true
            })
        })
  })

    vm.editProduction = function(){
      $http.patch('/api/productions/' + $stateParams.id, vm.production)
        .success(function(data) {
          vm.editingState = false
          // console.log(data);
          data.crew = vm.production.crew
          vm.production = data
          vm.notifModal.isSuccess = true
          vm.notifModal.content = 'You have successfully updated your production.'
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

    vm.makeOffer = function(id, $index) {
      var newOffer = vm.offers[$index]

      vm.offer = {
        offer : {
          status : 'Pending',
          position : newOffer.position,
          rate : newOffer.rate,
          hours : newOffer.hours
        }
      }
      // TODO this patches the offer, but somehow that doesn't reflect within the production object? Do we need to save the production as well on this patch?
      // TODO: Please confirm if the issue above has been fixed. -Kevin
      $http.patch('api/crew/' + id, vm.offer)
        .success(function(data) {
          // console.log(data);
          vm.production.crew[$index].offer.hours = data.offer.hours
          vm.production.crew[$index].offer.position = data.offer.position
          vm.production.crew[$index].offer.rate = data.offer.rate
          vm.production.crew[$index].offer.status = data.offer.status

          vm.notifModal.isSuccess = true
          vm.notifModal.content = 'You have successfully sent on offer to ' + vm.production.crew[$index].to.username + '.'

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
        })
    }

    vm.addToCrew = function(id) {
      crewOffer = {
        "to": id,
        "production": $stateParams.id,
      }
      $http.post('/api/crew/', crewOffer)
        .success(function(data) {
          vm.production.crew = data
          vm.notifModal.isSuccess = true
          vm.notifModal.content = 'You have successfully added a new crew member.'
          $mixpanel.track('Add Crew Clicked', {"user" : vm.currentUser.username})
        })
        .error(function(data) {
          vm.notifModal.isFailure = true
          vm.notifModal.content = 'An error has occurred. Please try again.'
        })
        .finally(function() {
          vm.showModal = false
          vm.openNotifModal()
        })
    }

    vm.removeFromCrew = function(id, index) {
      $http.delete('/api/crew/' + id)
        .then(function(data) {
          if(data.data.success){
            vm.production.crew = vm.production.crew.filter(function(c) {
              return c._id.toString() != id
            })

            vm.notifModal.isSuccess = true
            vm.notifModal.content = 'You have successfully removed a crew member.'
            // vm.production.crew.splice(index, 1)
          } else {
            vm.notifModal.isFailure = false
            vm.notifModal.content = 'An error has occurred. Please try again.'
          }
        })
        .catch(function(data) {
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
      $http.get('/api/productions/' + $stateParams.id + '/notify')
        .success(function(data) {
          // console.log(data);
          vm.notifModal.isSuccess = true
          vm.notifModal.content = 'You have successfully sent an email notification to your crew members.'
          vm.openNotifModal()
          $mixpanel.track('Notify Crew Clicked')
        })
    }
}
