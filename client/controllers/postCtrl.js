angular.module('myApp')
  .controller('postController', postController)

postController.$inject = ['$http', '$stateParams', '$state', 'ProductionFactory', 'AuthService']

// PRODUCTIONS

function postController($http, $stateParams, $state, ProductionFactory, AuthService){
  var vm = this
  vm.title = "Post Controller is here"
  vm.currentUser = {}
  vm.currentUser.productions = []
  AuthService.getUserStatus()
    .then(function(data){
      vm.currentUser = data.data.user
      console.log(data.data.user)
      $http.get('/api/productions')
        .success(function(data){
          vm.currentUser.productions = data
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
  vm.newUser = {}
  vm.newUser.skills = []
  vm.newUser.equipment = []

  vm.editUser = function() {
    $http.patch('/api/users/'+ vm.currentUser._id, vm.newUser)
      .success(function(data) {
        $state.reload();
      })
  }

// ADD USER TO CONTACTS

  vm.newContact = function() {
    $http.post('/api/users/', vm.newUser)
      .success(function(data) {
        $http.patch('/api/users/addcontact', vm.newContact.id)
          .success(function (data) {
            $state.reload();
          })
      })
  }

  vm.addContact = function() {
    $http.patch('/api/users/addcontact', vm.newContact.id)
      .success(function(data) {
        $state.reload();
      })
  }
}
