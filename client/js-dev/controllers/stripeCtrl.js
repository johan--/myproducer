angular.module('myApp')
  .controller('stripeController', stripeController)

stripeController.$inject = ['$rootScope', '$state', '$http', '$stateParams', 'AuthService']

function stripeController($rootScope, $state, $http, $stateParams, AuthService) {
  var vm = this

  AuthService.getUserStatus()
    .then(function(data){
      $http.get('/api/users/' + data.data.user._id + '/profile')
        .success(function(data) {
          vm.currentUser = data
          console.log(vm.currentUser);
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
  var successElement = document.querySelector('.success');
  var errorElement = document.querySelector('.error');
  successElement.classList.remove('visible');
  errorElement.classList.remove('visible');

  if (result.token) {
    // Use the token to create a charge or a customer
    // https://stripe.com/docs/charges
    successElement.querySelector('.token').textContent = result.token.id;
    successElement.classList.add('visible');
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


  vm.makeStripeSubscription = function() {

    const xhr = new XMLHttpRequest()
    vm.disabled = true
    vm.error = false

    xhr.open('GET', '/stripe/register', {user: vm.currentUser })
    xhr.onreadystatechange = function() {
      if(xhr.readyState === 4){
        if(xhr.status === 200){

        }
      }
    }
  }

  $rootScope.activeTab = {}

}
