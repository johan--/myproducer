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
      forgotPassword: forgotPassword
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

    function forgotPassword(email){
      console.log("Email line 132");
      console.log(email);
      $http.post('/user/forgot-password', {email: email})
        .success(function(data){
          $state.go('home')
        })
    }

}])
