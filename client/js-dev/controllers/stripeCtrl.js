angular.module('myApp')
  .controller('stripeController', stripeController)

stripeController.$inject = ['$rootScope', '$state', '$http', '$stateParams', 'AuthService']

function stripeController($rootScope, $state, $http, $stateParams, AuthService) {
  var vm = this
  vm.premiumForm = $state.params.form


  // when there is a post request, go to stripe ctrl in backend

  AuthService.getUserStatus()
    .then(function(data){
      $http.get('/api/users/' + data.data.user._id + '/profile')
        .success(function(data) {
          vm.currentUser = data
        })
    })

  var stripe = Stripe('pk_test_mHR67JgxkZZ0hWKaTQfWCmwS');
  var elements = stripe.elements();

  var card = elements.create('card', {
  style: {
    base: {
      iconColor: '#666EE8',
      color: '#31325F',
      lineHeight: '40px',
      fontWeight: 300,
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSize: '15px',

      '::placeholder': {
        color: '#CFD7E0',
      },
    },
  }
});
card.mount('#card-element');

function setOutcome(result) {
  var successElement = document.querySelector('.stripe-success');
  var errorElement = document.querySelector('.stripe-error');
  successElement.classList.remove('visible');
  errorElement.classList.remove('visible');

  if (result.token) {
    successElement.classList.add('visible');
    vm.makeStripeSubscription(result.token.id)
  } else if (result.error) {
    errorElement.textContent = result.error.message;
    errorElement.classList.add('visible');
  }
}

card.on('change', function(event) {
  setOutcome(event);
});

document.querySelector('form').addEventListener('submit', function(e) {
  e.preventDefault();
  var form = document.querySelector('form');
  var extraDetails = {
    name: form.querySelector('input[name=cardholder-name]').value,
  };
  stripe.createToken(card, extraDetails).then(setOutcome);
});

  // make stripe API request
  vm.makeStripeSubscription = function(token) {

    // handles when a free account wants to upgrade
    if(vm.currentUser){
      const stripeData = {
        email: vm.currentUser.username,
        plan: $state.params.plan,
        source: token,
        user: vm.currentUser
      }

      $http.patch('/stripe/register/' + stripeData.plan, {stripeData: stripeData})
        .success(function(data) {
          $state.go('profile')
        })
        .error(function(){
          $state.go('stripe', {plan: $state.params.plan})
        })
    } else {
      AuthService.registerPremium(vm.premiumForm, $stateParams.ur, $state.params.plan)
        // handle success
        .then(function(data) {
          vm.disabled = false
          vm.premiumForm = {}

          const stripeData = {
            email: vm.premiumForm.username,
            plan: $state.params.plan,
            source: token,
            user: data.user
          }

          $http.patch('/stripe/register/' + stripeData.plan, {stripeData: stripeData})
            .success(function(data) {
              $state.go('profile')
            })
            .error(function(){
              $state.go('premium-register', {plan: $state.params.plan, ur: 'producer', error: true })
            })
        })
        // handle error
        .catch(function () {
          $state.go('premium-register', {plan: $state.params.plan, ur: 'producer', error: true })
        })
        $rootScope.activeTab = {}
    }
  }

}
