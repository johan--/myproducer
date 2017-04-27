angular.module('myApp')
  .controller('stripeCouponController', stripeCouponController)

stripeCouponController.$inject = ['$rootScope', '$state', '$http', '$stateParams', 'AuthService']

function stripeCouponController($rootScope,$state, $http, $stateParams, AuthService) {
  var vm = this

  AuthService.getUserStatus()
    .then(function(data){
      vm.currentUser = data.data.user
    })

  vm.addCouponToUser = function(token){
    $http.patch('/stripe/coupon', {user: vm.currentUser})
      .success(function(data){
        console.log(data);
        $state.go('profile')
      })
      .error(function(){
        $state.go('stripe-coupon')
      })
  }
}
