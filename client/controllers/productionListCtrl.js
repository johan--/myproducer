angular.module('myApp')
  .controller('productionListController', productionListController)

productionListController.$inject = ['$http', '$stateParams', '$state', 'ProductionFactory', 'AuthService']

// PRODUCTIONS

function productionListController($http, $stateParams, $state, ProductionFactory, AuthService){
  var vm = this

  AuthService.getUserStatus()
    .then(function(data){
      // vm.currentUser = data.data.user
      // console.log(data.data.user)
      $http.get('/api/users/' + data.data.user._id + '/productions')
        .success(function(data){
          vm.currentUser = data
          console.log(data);
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
      // TODO: Fix warning message - Kevin
      alert('Invalid date')
    }
  }

  vm.updateMinDateTo()

  vm.addProduction = function(){
    var newProduction = {
      from: new Date(vm.dateFrom),
      to: new Date(vm.dateTo),
      by_ : vm.currentUser,
      name: vm.newProduction.name
    }

    // console.log(newProduction);
    $http.post('/api/productions', newProduction)
      .success(function(data){
        // console.log(vm.currentUser)
        // vm.currentUser.productions.push(data)
        // vm.newProduction = {}
        // // redirect them to production view
        // // $state.go('production')
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
