angular.module('myApp')
  .controller('otherProfileController', otherProfileController)

otherProfileController.$inject = ['$http', '$stateParams', '$state', 'ProductionFactory', 'AuthService']

// OTHER PROFILE

function otherProfileController($http, $stateParams, $state, ProductionFactory, AuthService){
  var vm = this;

  $http.get('/api/users/' + $stateParams.id)
    .then(function(data){
      vm.user = data.data
    })
}
