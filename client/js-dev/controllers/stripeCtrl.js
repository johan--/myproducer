angular.module('myApp')
  .controller('stripeController', stripeController)

stripeController.$inject = ['$rootScope', '$state', '$http', '$stateParams', 'AuthService']

function stripeController($rootScope, $state, $http, $stateParams, AuthService) {
  var vm = this

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
  var successElement = document.querySelector('.success');
  var errorElement = document.querySelector('.error');
  successElement.classList.remove('visible');
  errorElement.classList.remove('visible');

  if (result.token) {
    // Use the token to create a charge or a customer
    // https://stripe.com/docs/charges
    successElement.querySelector('.token').textContent = result.token.id;
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

    const stripeData = {
      email: vm.currentUser.username,
      plan: $stateParams.plan,
      user: vm.currentUser,
      source: token
    }

    $http.patch('/stripe/register/' + vm.currentUser._id + '/' + $stateParams.plan, {stripeData: stripeData})
      .success(function(data) {
        console.log("stripe api successful");
        console.log(data);
        $state.go('home')
      })

  //   const xhr = new XMLHttpRequest()
  //   vm.disabled = true
  //   vm.error = false
  //
  //   xhr.open('PATCH', '/stripe/register/:id/:plan', {email: vm.currentUser.username, plan: $stateParams.plan, user: vm.currentUser})
  //   xhr.onreadystatechange = function() {
  //     if(xhr.readyState === 4){
  //       if(xhr.status === 200){
  //         $state.go('home')
  //       }
  //     }
  //   }
  }

  // vm.resolve = function(email,id) {
  //   return new Promise(function(resolve,reject) {
  //     // promise that user will complete credit card info
  //     // when they do, sign them up
  //     AuthService.makeStripeSubscription(email,id)
  //     .then(function(data) {
  //
  //     })
  //   })
  // }

  $rootScope.activeTab = {}

}