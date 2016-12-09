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
      var newProduction = {
          location: vm.newProduction.location,
          weather: vm.newProduction.weather,
          hospital: vm.newProduction.hospital,
          parking: vm.newProduction.parking,
          notes: vm.newProduction.notes
        }
        $http.patch('/api/productions/'+$stateParams.id, newProduction)
        .success(function(data) {
          vm.editing = false
          $state.go('production')
        })
    }
}
