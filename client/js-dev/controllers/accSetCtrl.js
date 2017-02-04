angular.module('myApp')
  .controller('accountSettingController', accountSettingController)

accountSettingController.$inject = ['$rootScope', '$state', '$stateParams', 'AuthService', '$http']

// Account Settings CONTROLLER
function accountSettingController($rootScope, $state, $stateParams, AuthService, $http){
  console.log("accountSettingController instantiated");
  var vm = this
  vm.disabled = false
  vm.modalChangePassword = false

  AuthService.getUserStatus()
    .then(function(data){
      vm.user = data.data.user
    })

  vm.changePassword = function(){
    vm.disabled = true
    $http.post('/user/changePassword', {password: vm.password, user:vm.user})
      .success(function(data){
        if(data.success){
          vm.modalChangePassword = true
        }
      })
  }

  vm.refresh = function(){
    $state.reload();
  }
}
