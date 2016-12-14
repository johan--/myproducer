angular.module('myApp')
  .controller('postController', postController)

postController.$inject = ['$http', '$stateParams', '$state', 'ProductionFactory', 'AuthService']

// PRODUCTIONS

function postController($http, $stateParams, $state, ProductionFactory, AuthService){
  var vm = this
  vm.title = "Post Controller is here"
  vm.currentUser = {}
  vm.showModal = false;
  // vm.currentUser.productions = []
  AuthService.getUserStatus()
    .then(function(data){
      vm.currentUser = data.data.user
      // console.log(data.data.user)
      $http.get('/api/users/' + vm.currentUser._id)
        .success(function(data){
          vm.currentUser = data
          console.log(data);
        })
  })
  vm.addProduction = function(){
    var newProduction = {
      by_ : vm.currentUser,
      name: vm.newProduction.name
    }
    $http.post('/api/productions', newProduction)
      .success(function(data){
        console.log(vm.currentUser)
        vm.currentUser.productions.push(data)
        vm.newProduction = {}
        // redirect them to production view
        // $state.go('production')
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
