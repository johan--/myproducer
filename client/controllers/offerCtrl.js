angular.module('myApp')
  .controller('offerController', offerController)

offerController.$inject = ['$http', '$stateParams', '$state']

function offerController($http, $stateParams, $state, ProductionFactory) {
  var vm = this

  $http.get('/api/crew/' + $stateParams.id)
    .success(function(crew) {
      vm.crew = crew
      console.log("Crew from get", vm.crew)
    })

  vm.addMessage = function() {
    vm.message = {
        content : vm.newMessage
    }
    $http.post('/api/crew/' + vm.crew._id + '/message', vm.message)
      .success(function(data) {
        $state.reload()
      })
  }
}
