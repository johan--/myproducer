angular.module('myApp')
  .controller('productionController', productionController)

productionController.$inject = ['$http', '$stateParams', '$state', 'ProductionFactory', 'AuthService']

// PRODUCTION CONTROLLER

function productionController($http, $stateParams, $state, ProductionFactory, AuthService){
  var vm = this
  vm.offers = []
  vm.currentUser = {}

  vm.notifModal = {}

  vm.editingState = false

  AuthService.getUserStatus()
    .then(function(data){
      vm.currentUser = data.data.user
      // console.log(data.data.user)
      $http.get('/api/users/' + vm.currentUser._id + '/contacts')
        .success(function(data){
          vm.currentUser = data
          console.log(data);
        })
  })

  ProductionFactory.show($stateParams.id)
    .success(function(production) {
      vm.production = production
      console.log("Production from the Factory", vm.production)
    })

    vm.editProduction = function(){
      $http.patch('/api/productions/' + $stateParams.id, vm.production)
        .success(function(data) {
          vm.editingState = false
          console.log(data);
          data.crew = vm.production.crew
          vm.production = data
          vm.notifModal.isSuccess = true
          vm.notifModal.content = 'You have successfully updated your profile.'
        })
        .error(function(data) {
          console.log(data);
          vm.notifModal.isFailure = false
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
          console.log("data after patch", data)
          $state.reload()
        })
    }

    vm.addToCrew = function(id) {
      crewOffer = {
        "to": id,
        "production": $stateParams.id,
      }
      $http.post('/api/crew/', crewOffer)
        .success(function(data) {
          console.log(data);
          vm.production.crew = data
          vm.notifModal.isSuccess = true
          vm.notifModal.content = 'You have successfully added a new crew member.'
        })
        .error(function(data) {
          console.log(data);
          vm.notifModal.isFailure = false
          vm.notifModal.content = 'An error has occurred. Please try again.'
        })
        .finally(function() {
          vm.showModal = false
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
    }
}
