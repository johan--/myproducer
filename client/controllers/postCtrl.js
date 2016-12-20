angular.module('myApp')
  .controller('postController', postController)

postController.$inject = ['$http', '$stateParams', '$state', 'ProductionFactory', 'AuthService']

// PRODUCTIONS

function postController($http, $stateParams, $state, ProductionFactory, AuthService){
  var vm = this
  vm.today = new Date();
  vm.currentUser = {}
  vm.showModal = false;


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

  // vm.currentUser.productions = []
  AuthService.getUserStatus()
    .then(function(data){
      // vm.currentUser = data.data.user
      // console.log(data.data.user)
      $http.get('/api/users/' + data.data.user._id)
        .success(function(data){
          vm.currentUser = data
          console.log(data);
        })
  })
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

// EDIT USER
  vm.editUser = function() {
    $http.patch('/api/users/'+ vm.currentUser._id, vm.currentUser)
      .success(function(data) {
        $state.reload();
      })
  }

// ADD USER TO CONTACTS

  vm.addContact = function() {
    // search for existing user here
    $http.post('/api/users/addcontact', vm.newContact)
      .success(function (data) {
        console.log("contact added", data);
        $state.reload();
      })
    }

  // vm.addContact = function() {
  //   $http.patch('/api/users/addcontact', vm.newContact.id)
  //     .success(function(data) {
  //       $state.reload();
  //     })
  // }

  vm.closeModal = function() {
    vm.selectedUserId = undefined;
    vm.showModal = false;
  }

  vm.handleAddToButton = function(id) {
    vm.selectedUserId = id;
    console.log(vm.selectedUserId);
    vm.showModal = true;
  }

  vm.addCrewToProduction = function(productionId) {
    var offer = {
      to: vm.selectedUserId,
      production: productionId
    }
    console.log(offer);
    $http.post('/api/crew/', offer)
     .success(function(data) {
       $state.reload()
     })
  }
}
