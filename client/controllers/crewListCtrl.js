angular.module('myApp')
  .controller('crewListController', crewListController)

crewListController.$inject = ['$http', '$stateParams', '$state', 'ProductionFactory', 'AuthService']

// PRODUCTIONS

function crewListController($http, $stateParams, $state, ProductionFactory, AuthService){
  var vm = this
  vm.showModal = false;

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

  // ADD USER TO CONTACTS

  vm.addContact = function() {
    // search for existing user here
    $http.post('/api/users/addcontact', vm.newContact)
      .success(function (data) {
        console.log("contact added", data);
        $state.reload();
      })
  }

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
