angular.module('myApp')
  .controller('offerController', offerController)

offerController.$inject = ['$rootScope', 'AuthService', '$http', '$stateParams', '$state', '$mixpanel']

function offerController($rootScope, AuthService, $http, $stateParams, $state, $mixpanel) {
  var vm = this

  vm.currentUser = {}

  $rootScope.activeTab = {}

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
              vm.ready = true
              // console.log("Crew from get", vm.crew)
            })
        })
    })

  vm.addMessage = function(message) {
    vm.message = {
        content : message || vm.newMessage
    }

    if(vm.message.content){
      $http.post('/api/crew/' + vm.crew._id + '/message?crew=' + vm.crew.to.username + '&producer=' + vm.crew.production.by_.username, vm.message)
        .success(function(data) {
          vm.crew.message = data
          vm.newMessage = ''
          $mixpanel.track('Chat Message Sent')
        })
    }
  }

  vm.updateOfferStatus = function(status) {
    vm.offerUpdate = Object.assign({}, vm.crew)
    vm.offerUpdate.offer.status = status

    $http.patch('/api/crew/' + $stateParams.id +'/status', vm.offerUpdate)
      .then(function(data){

        var message = ''

        if (status == 'Accepted') {
          message = 'I accept your offer to work with you on ' + vm.crew.production.name + '.'
          vm.addMessage(message)
        } else if (status  == 'Declined') {
          message = 'I respectfully decline your offer to work with you on ' + vm.crew.production.name + '.'
          vm.addMessage(message)
        }
      })
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
