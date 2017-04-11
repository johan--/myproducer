angular.module('myApp')
.factory('AuthService', ['$q', '$timeout', '$http', '$state', function ($q, $timeout, $http, $state) {

    // create user variable
    var user = null

    // return available functions for use in the controllers
    return ({
      isLoggedIn: isLoggedIn,
      getUserStatus: getUserStatus,
      login: login,
      logout: logout,
      register: register,
      registerPremium: registerPremium,
      forgotPassword: forgotPassword,
      checkToken: checkToken,
      resetPassword: resetPassword,
      completeRegistration: completeRegistration,
      checkCompRegToken: checkCompRegToken,
      getCrewStatus: getCrewStatus,
      makeStripeSubscription: makeStripeSubscription
    })

    function isLoggedIn() {
      if(user) {
        return true
      } else {
        return false
      }
    }

    function getUserStatus() {
      return $http.get('/user/status')
      // handle success
      .success(function (data) {
        if(data.status){
          user = true
        } else {
          user = false
        }
      })
      // handle error
      .error(function (data) {
        user = false
      })
    }

    function login(username, password) {

      // create a new instance of deferred
      var deferred = $q.defer()

      // send a post request to the server
      $http.post('/user/login',
        {username: username, password: password})
        // handle success
        .success(function (data, status) {
          if(status === 200 && data.status){
            user = true
            deferred.resolve()
          } else {
            user = false
            deferred.reject()
          }
        })
        // handle error
        .error(function (data) {
          user = false
          deferred.reject()
        })

      // return promise object
      return deferred.promise

    }

    function logout() {

      // create a new instance of deferred
      var deferred = $q.defer()

      // send a get request to the server
      $http.get('/user/logout')
        // handle success
        .success(function (data) {
          user = false
          deferred.resolve()
        })
        // handle error
        .error(function (data) {
          user = false
          deferred.reject()
        })

      // return promise object
      return deferred.promise

    }

    function register(user, role, params) {

      // create a new instance of deferred
      var deferred = $q.defer()

      // if producerId is provided, append it to register api path
      if(params.p) {
        var path = '/user/register?addTo=' + params.p
      } else if(params.r) {
        var path = '/user/register?requestTo=' + params.r
      } else {
        var path = '/user/register'
      }

      console.log(path);

      // send a post request to the server
      $http.post(path,
        {username: user.username, first_name: user.first_name, last_name: user.last_name, password: user.password, role: role})
        // handle success
        .success(function (data, status) {
          if(status === 200 && data.status){
            deferred.resolve()
          } else {
            deferred.reject()
          }
        })
        // handle error
        .error(function (data) {
          deferred.reject()
        })

      // return promise object
      return deferred.promise

    }

    function registerPremium(user, role, params, plan) {

      // create a new instance of deferred
      var deferred = $q.defer()
      const path = '/user/register'
      const planChosen = plan

      console.log(plan);

      $http.post(path, {
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        password: user.password,
        role: 'producer',
        plan: planChosen
      })
      .success(function (data, status) {
        if(status === 200 && data.status){
          deferred.resolve(data)
        } else {
          deferred.reject()
        }
      })
      // handle error
      .error(function (data) {
        deferred.reject()
      })

      return deferred.promise

    }

    function forgotPassword(email){
      var deferred = $q.defer()
      $http.post('/user/forgot-password', {email: email})
        .success(function(data, status){
          if(data.user === false){
            // $state.go('forgot-password')
            deferred.resolve({message: "rejected"})
          } else {
            deferred.resolve({message: "resolved"})
          }
        })
        // handle error
        .error(function(data){
          deferred.reject({message: "rejected"})
        })
        // return promise object
        return deferred.promise
    }

    function checkToken(token){
      var deferred = $q.defer()
      $http.post('/user/check-token', {token: token})
        .success(function (data, status) {
          if(status === 200){
            deferred.resolve(data)
          } else {
            var user = false
            deferred.reject()
          }
        })
        // handle error
        .error(function (data) {
          user = false
          deferred.reject()
        })

      // return promise object
      return deferred.promise
    }

    function resetPassword(token, password){
      var deferred = $q.defer()
      $http.post('/user/reset/' + token, {password: password})
      .success(function (data, status) {
        if(status === 200){
          deferred.resolve(data)
        } else {
          var user = false
          deferred.reject()
        }
      })
      // handle error
      .error(function (data) {
        user = false
        deferred.reject()
      })

    // return promise object
    return deferred.promise
    }

    function checkCompRegToken(token){
      var deferred = $q.defer()
      $http.post('/user/check-reg-token', {token: token})
        .success(function (data, status) {
          if(status === 200){
            deferred.resolve(data)
          } else {
            var user = false
            deferred.reject()
          }
        })
        // handle error
        .error(function (data) {
          user = false
          deferred.reject()
        })

      // return promise object
      return deferred.promise
    }

    function completeRegistration(token, registerForm){
      var deferred = $q.defer()
      console.log("registerForm from services line 218");
      console.log(registerForm);
      $http.patch('/user/compReg/' + token, {registerForm: registerForm})
      .success(function (data, status) {
        if(status === 200){
          deferred.resolve(data)
        } else {
          var user = false
          deferred.reject()
        }
      })
      // handle error
      .error(function (data) {
        user = false
        deferred.reject()
      })

    // return promise object
    return deferred.promise
    }

    function getCrewStatus(id) {
      console.log("getting crew status line 241");
      var deferred = $q.defer()

      $http.get('/user/check-token', {id: id})
      .success(function(data) {
        console.log(data);
        deferred.resolve(data)
      })
      .error(function(data) {
        deferred.reject()
      })

      return deferred.promise
    }


    // get request to stripe backend
    function makeStripeSubscription(email, id) {
      // $http.get('/stripe/new', {email: email, id: id})
      // .success(function(data) {
      //
      // })
      // .error(function(data){
      //
      // })

    }




}])
