angular.module('myApp')
  .controller('postController', postController)

postController.$inject = ['$http', '$stateParams', '$state', 'ProductionFactory', 'AuthService']

// POST CONTROLLER:

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
      })
  }
}
