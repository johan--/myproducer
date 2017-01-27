angular.module('myApp')
  .controller('productionListController', productionListController)

productionListController.$inject = ['$rootScope', '$http', '$stateParams', '$state', 'AuthService', '$mixpanel']

// PRODUCTIONS

function productionListController($rootScope, $http, $stateParams, $state, AuthService, $mixpanel){
  var vm = this
  vm.notifModal = {}
  $rootScope.activeTab = {}
  $rootScope.activeTab.production = true

  AuthService.getUserStatus()
    .then(function(data){
      // vm.currentUser = data.data.user
      // console.log(data.data.user)
      $http.get('/api/users/' + data.data.user._id + '/productions')
        .success(function(data){
          vm.currentUser = data

          // get all productions where I am a crew member
          var otherProductions = []
          data.offersReceived.forEach(function(crew) {
            if(crew.offer.status === 'Accepted') {
              otherProductions.push(crew.production)
            }
          })

          // combine my productions and other productions where I am crew member
          vm.currentUser.allProductions = data.productions.concat(otherProductions)

          vm.ready = true

          if (vm.currentUser.role === 'producer') {
            vm.updateMinDateTo()
          }
        })
  })

  var dateToday = new Date(Date.now())
  vm.dateFrom = dateToday
  vm.dateFrom.setHours(0)
  vm.dateFrom.setMinutes(0)
  vm.dateFrom.setSeconds(0)
  vm.dateFrom.setMilliseconds(0)
  vm.minDateFrom = dateToday.getFullYear() + '-' + (dateToday.getMonth() + 1) + '-' + dateToday.getDate()


  vm.updateMinDateTo = function() {
    var dateFrom = new Date(vm.dateFrom)
    vm.minDateTo = dateFrom.getFullYear() + '-' + (dateFrom.getMonth() + 1) + '-' + dateFrom.getDate()

    document.getElementById('prod-date-to').setAttribute('min', vm.minDateTo)

    if((new Date(vm.dateFrom)) > (new Date(vm.dateTo))){
      vm.dateTo = undefined
      vm.notifModal.isFailure = true
      vm.notifModal.content = 'Please check the production dates!'
      vm.notifModal.show = true
    }
  }

  vm.addProduction = function(){
    if((new Date(vm.dateFrom)) > (new Date(vm.dateTo)) )
    {
      vm.dateTo = undefined
      vm.notifModal.isFailure = true
      vm.notifModal.content = 'Please check the production dates! Your production end date is before its start date'
      vm.notifModal.show = true
    } else {
      var newProduction = {
        from: new Date(vm.dateFrom),
        to: new Date(vm.dateTo),
        by_ : vm.currentUser,
        name: vm.newProduction.name
      }

      // console.log(newProduction);
      $http.post('/api/productions', newProduction)
        .success(function(data){
          vm.currentUser.allProductions = vm.currentUser.productions.concat(data)
          // console.log(vm.currentUser)
          // vm.currentUser.productions.push(data)
          // vm.newProduction = {}
          // // redirect them to production view
          // // $state.go('production')
          $mixpanel.track('New Production Added', {"user" : vm.currentUser.username})
        })
    }
  }

  vm.deleteProduction = function(name, id) {
    if(confirm('Are you sure you want to delete this production?')){
      $http.patch('/api/productions/' + id, {active: false})
        .success(function(data) {
          // console.log(data);
          vm.currentUser.allProductions = vm.currentUser.allProductions.filter(function(p, i) {
            return p._id.toString() != id
          })
          vm.notifModal.isSuccess = true
          vm.notifModal.content = 'You have successfully deleted ' + name
          $mixpanel.track('Production Deleted', {"user" : vm.currentUser.username})
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
}
