angular.module('myApp')
  .controller('postController', postController)

postController.$inject = ['$rootScope', '$http', '$stateParams', '$state', 'AuthService', '$scope']

// PRODUCTIONS

function postController($rootScope, $http, $stateParams, $state, AuthService, $scope){
  var vm = this
  vm.currentUser = {}
  // vm.fileExists = true;
  vm.editingState = false;
  vm.fileInput = document.getElementById('file-input')
  vm.modal = {}
  vm.modal.show = false;
  vm.modal.show2 = false;

  $scope.file_changed = function(element) {
    document.getElementById('profile-pic-preview').src = URL.createObjectURL(element.files[0]);
    vm.fileExists = false;
  };

  $rootScope.activeTab = {}
  $rootScope.activeTab.profile = true

  // vm.currentUser.productions = []
  AuthService.getUserStatus()
    .then(function(data){
      $http.get('/api/users/' + data.data.user._id + '/profile')
        .success(function(data){
          vm.currentUser = data

          // get all productions where I am a crew member
          var otherProductions = []
          data.offersReceived.forEach(function(crew) {
            if(crew.offer.status === 'Accepted') {
              otherProductions.push(crew.production)
            }
          })

          if(vm.currentUser.picture){
            vm.profilePicture = vm.currentUser.picture + "?random=" + Math.random()
          } else {vm.profilePicture = "./img/profile_default.png"}

          // combine my productions and other productions where I am crew member
          vm.currentUser.allProductions = data.productions.concat(otherProductions)

          vm.ready = true
        })
  })

  // EDIT USER
  vm.editUser = function() {
    $http.patch('/api/users/'+ vm.currentUser._id, vm.currentUser)
      .success(function(data) {
        data.productions = vm.currentUser.productions
        data.offersReceived = vm.currentUser.offersReceived
        vm.currentUser = data
        vm.modal.isSuccess = true
        vm.modal.content = 'You have successfully updated your profile.'
      })
      .error(function(data) {
        vm.modal.isFailure = true
        vm.modal.content = 'An error has occurred. Please try again.'
      })
      .finally(function() {
        vm.editingState = false
        vm.openModal()
      })
  }

  vm.openModal = function() {
    vm.modal.show = true
  }

  vm.openModal2 = function() {
    vm.modal.show2 = true
  }

  vm.closeModal = function() {
    vm.modal.show = false
    vm.modal.isSuccess = false
    vm.modal.isFailure = false
    $state.reload()
  }

  vm.closeModal2 = function() {
    vm.modal.show2 = false
  }

  vm.compareDate = function(date){
    date = new Date(date)
    date.setDate(date.getDate() + 1)
    if(!date){
      return false
    }
    return new Date() < date
  }

  /*
   Function called when file input updated. If there is a file selected, then
   start upload procedure by asking for a signed request from the app.
  */
  vm.initUpload = function(){
    var files = document.getElementById('file-input').files;
    // var file = files[0];
    file = files[0];
    file.randomName = vm.currentUser._id + "." + file.name.split('.').pop()
    if(file == null){
      return alert('No file selected.');
    }
    vm.getSignedRequest(file);
  }

  /*
    Function to get the temporary signed request from the app.
    If request successful, continue to upload the file using this signed
    request.
  */
  vm.getSignedRequest = function (file){
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/uploads/sign-s3?file-name='+ file.randomName+ '&file-type=' + file.type);
    // xhr.open('GET', '/uploads/test')
    xhr.onreadystatechange = function(){
      if(xhr.readyState === 4){
        if(xhr.status === 200){
          const response = JSON.parse(xhr.responseText);
          vm.avatarUrl = response.url
          vm.uploadFile(file, response.signedRequest, response.url);
          vm.addAvatarToProfile()
        }
        else{
          alert('Could not get signed URL.');
        }
      }
    };
    xhr.send();
  }

  /*
      Function to carry out the actual PUT request to S3 using the signed request from the app.
    */
    vm.uploadFile = function (file, signedRequest, url){
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', signedRequest);
      xhr.onreadystatechange = function(){
        if(xhr.readyState === 4){
          if(xhr.status === 200){
            document.getElementById('profile-picture').src = url + "?random=" + Math.random()
          }
          else{
            alert('Could not upload file.');
          }
        }
      };
      xhr.send(file);
    }

    vm.addAvatarToProfile = function(){
      $http.patch('/api/users/' + vm.currentUser._id, {picture: vm.avatarUrl})
        .then(function(data){
          vm.profilePicture = data.data.picture + "?random=" + Math.random()
          vm.closeModal2()
        })
    }
}
