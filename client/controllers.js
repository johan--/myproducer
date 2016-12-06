angular.module('myApp')
  .controller('mainController', mainController)
  .controller('loginController', loginController)
  .controller('logoutController', logoutController)
  .controller('registerController', registerController)
  .controller('postController', postController)
  .controller('productionController', productionController)


  mainController.$inject = ['$rootScope', '$state', 'AuthService']
  loginController.$inject = ['$state', 'AuthService']
  logoutController.$inject = ['$state', 'AuthService']
  registerController.$inject = ['$state', 'AuthService']
  postController.$inject = ['$http', '$stateParams', '$state', 'ProductionFactory', 'AuthService']
  productionController.$inject = ['$http', '$stateParams', '$state', 'ProductionFactory', 'AuthService']


function mainController($rootScope, $state, AuthService) {
  var vm = this
  $rootScope.$on('$stateChangeStart', function (event) {
    // console.log("Changing states")
    AuthService.getUserStatus()
      .then(function(data){
        vm.currentUser = data.data.user
      })
  })
}

// LOGIN CONTROLLER:
function loginController($state, AuthService) {
  var vm = this
  vm.login = function () {

    // initial values
    vm.error = false
    vm.disabled = true

    // call login from service
    AuthService.login(vm.loginForm.username, vm.loginForm.password)
      // handle success
      .then(function () {
        console.log("Successful login...")
        $state.go('profile')
        vm.disabled = false
        vm.loginForm = {}
      })
      // handle error
      .catch(function () {
        console.log("Whoops...")
        vm.error = true
        vm.errorMessage = "Invalid email and/or password"
        vm.disabled = false
        vm.loginForm = {}
      })
  }
  vm.register = function() {
    $state.go('register')
  }
}


// LOGOUT CONTROLLER:
function logoutController($state, AuthService) {
  var vm = this
  vm.logout = function () {

    // call logout from service
    AuthService.logout()
      .then(function () {
        $state.go('login')
      })
  }
}

// REGISTER CONTROLLER:
function registerController($state, AuthService) {
  var vm = this
  vm.register = function () {

    // initial values
    vm.error = false
    vm.disabled = true

    // call register from service
    AuthService.register(vm.registerForm.username, vm.registerForm.password)
      // handle success
      .then(function () {
        $state.go('profile')
        vm.disabled = false
        vm.registerForm = {}
      })
      // handle error
      .catch(function () {
        vm.error = true
        vm.errorMessage = "Something went wrong!"
        vm.disabled = false
        vm.registerForm = {}
      })
  }
  // vm.login = function() {
  //   $state.go('login')
  // }
}

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

function productionController($http, $stateParams, $state, ProductionFactory, AuthService){
  var vm = this
  vm.title = "Production Controller Here"

  ProductionFactory.show($stateParams.id)
    .success(function(production) {
      vm.production = production
      console.log("Production from the Factory", vm.production)
    })
}
