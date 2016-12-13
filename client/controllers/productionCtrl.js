angular.module('myApp')
  .controller('productionController', productionController)

productionController.$inject = ['$http', '$stateParams', '$state', 'ProductionFactory', 'AuthService']

// PRODUCTION CONTROLLER

function productionController($http, $stateParams, $state, ProductionFactory, AuthService){
  var vm = this

  ProductionFactory.show($stateParams.id)
    .success(function(production) {
      vm.production = production
      console.log("Production from the Factory", vm.production)
    })

    vm.editProduction = function(){
      $http.patch('/api/productions/' + $stateParams.id, vm.production)
        .success(function(data) {
          vm.editing = false
          $state.reload()
        })
    }

    vm.deleteProduction = function(){
      $http.delete('/api/productions/' + $stateParams.id)
        .success(function(data) {
          $state.go('production-list')
        })
    }

    vm.makeOffer = function(id) {
      vm.offer = {
        offer : {
          status : 'Pending',
          position : vm.production.offer.position,
          rate : vm.production.offer.rate,
          hours : vm.production.offer.hours
        }
      }
      // TODO this patches the offer, but somehow that doesn't reflect within the production object? Do we need to save the production as well on this patch?
      $http.patch('api/crew/' + id, vm.offer)
        .success(function(data) {
          // $state.go('offer')
          $state.reload()
          console.log("data after patch", data)
        })
    }
}
