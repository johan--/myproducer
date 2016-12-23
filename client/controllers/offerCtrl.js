angular.module('myApp')
  .controller('offerController', offerController)

offerController.$inject = ['AuthService', '$http', '$stateParams', '$state']

function offerController(AuthService, $http, $stateParams, $state, ProductionFactory) {
  var vm = this

  vm.currentUser = {}
  AuthService.getUserStatus()
    .then(function(data){
      vm.currentUser = data.data.user
      $http.get('/api/users/' + vm.currentUser._id)
        .success(function(data){
          vm.currentUser = data

          $http.get('/api/crew/' + $stateParams.id)
            .success(function(crew) {
              vm.crew = crew
              vm.isProducer = vm.crew.production.by_._id === vm.currentUser._id
              vm.isCrew = vm.crew.production.by_._id !== vm.currentUser._id
              console.log("Crew from get", vm.crew)
            })
        })
    })

  vm.addMessage = function() {
    vm.message = {
        content : vm.newMessage
    }
    $http.post('/api/crew/' + vm.crew._id + '/message', vm.message)
      .success(function(data) {
        vm.crew.message = data
        vm.newMessage = ''
      })
  }

  vm.updateOfferStatus = function(status) {
    vm.offerUpdate = Object.assign({}, vm.crew)
    vm.offerUpdate.offer.status = status

    // console.log($stateParams.id)

    $http.patch('/api/crew/' + $stateParams.id, vm.offerUpdate)
      .then(function(data){
        $state.reload()
      })
  }
}
