angular.module('myApp')
  .controller('offerController', offerController)

offerController.$inject = ['$http', '$stateParams', '$state']

function offerController($http, $stateParams, $state, ProductionFactory) {
  var vm = this

  $http.get('/api/crew/' + $stateParams.id)
    .success(function(crew) {
      vm.crew = crew
    })

  vm.addMessage = function() {
    $http.post('/api/crew/' + crew._id + '/message', vm.message)
      .success(function(data) {
        console.log(data)
      })
  }
}
