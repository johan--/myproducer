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

  vm.editUser = function() {
    var newUser = {
      location: vm.newUser.location,
      title: vm.newUser.title,
      email: vm.newUser.email,
      phone: vm.newUser.phone,
      website: vm.newUser.website,
      bio: vm.newUser.bio,
      skills: vm.newUser.skills,
      equipment: vm.newUser.equipment
    }
    $http.patch('/api/users/'+ vm.currentUser._id, newUser)
      .success(function(data) {
        $state.go('profile')
      })
  }
}

// ADD USER TO CONTACTS
