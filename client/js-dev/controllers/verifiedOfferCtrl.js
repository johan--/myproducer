angular.module('MyApp')
  .controller('verifiedOfferController', verifiedOfferController)

verifiedOfferConroller.$inject = ['$rootScope', 'AuthService', '$http', '$stateParams', '$state', '$mixpanel']

function verifiedOfferController($rootScope, AuthService, $http, $stateParams, $state, $mixpanel)
