angular.module('myApp')
  .controller('postController', postController)

postController.$inject = ['$rootScope', '$http', '$stateParams', '$state', 'AuthService', '$scope', '$mixpanel']

// PRODUCTIONS

function postController($rootScope, $http, $stateParams, $state, AuthService, $scope, $mixpanel){
  var vm = this
  vm.hoverPending = false
  vm.hoverCurrent = false
  vm.hoverPast = false
  vm.currentUser = {}
  vm.editingState = false;
  vm.fileInput = document.getElementById('file-input')
  vm.modal = {}
  vm.showSaveButton = true;
  vm.googleLocation = ''
  vm.upgradeModal = {}

  $rootScope.activeTab = {}
  $rootScope.activeTab.profile = true

  if($state.params.upgradeModal === true) {
    vm.upgradeModal.show = true
  }

  AuthService.getUserStatus()
    .then(function(data){
      $http.get('/api/users/' + data.data.user._id + '/profile')
        .success(function(data){
          vm.currentUser = data
          vm.first_name = vm.currentUser.first_name.charAt(0).toUpperCase() + vm.currentUser.first_name.slice(1)
          vm.resume = vm.currentUser.resume || ''
          initialRows(vm.currentUser.bio)
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
          // console.log(vm.currentUser.allProductions);
          console.log(vm.currentUser);
          vm.ready = true
        })
  })

  ///////////////// GOOGLE PLACES API //////////////////

  vm.loadGooglePlaces = function(){
    vm.locationInput = document.getElementById('userLocation');
    var options = {
      types: ['geocode']
    };

    var autocomplete = new google.maps.places.Autocomplete(vm.locationInput, options);

    autocomplete.addListener('place_changed', function(){
      const placeChosen = autocomplete.getPlace()
      vm.googleLocation = vm.locationInput.value
    })
  }

// when a user chooses a picture to upload
$scope.file_changed = function(element) {
  vm.imageFile = element.files[0]
  document.getElementById('profile-pic-preview').src = URL.createObjectURL(element.files[0]);
  vm.showSaveButton = false;
};

$scope.resume_chosen = function(resume) {
  const resumeFile = resume.files[0]
  resumeFile.randomName = vm.currentUser._id + '.' + Date.now() + '.pdf'
  vm.resumeSignedRequest(resumeFile)
}

vm.resumeSignedRequest = function (file){
  const xhr = new XMLHttpRequest();
  xhr.open('GET', '/uploads/sign-s3?file-name='+ file.randomName+ '&file-type=' + file.type);
  // xhr.open('GET', '/uploads/test')
  xhr.onreadystatechange = function(){
    if(xhr.readyState === 4){
      if(xhr.status === 200){
        const response = JSON.parse(xhr.responseText);
        vm.avatarUrl = response.url
        vm.uploadResume(file, response.signedRequest, response.url);
        $mixpanel.track('Resume Uploaded', {"user" : vm.currentUser.username})
      }
      else{
        alert('Could not get signed URL.');
      }
    }
  };
  xhr.send();
}

vm.uploadResume = function (file, signedRequest, url){
  const xhr = new XMLHttpRequest();
  xhr.open('PUT', signedRequest);
  xhr.onreadystatechange = function(){
    if(xhr.readyState === 4){
      if(xhr.status === 200){
        vm.resumeUrl = url
        vm.addResumeToProfile()
      }
      else{
        // console.log(xhr.status);
        alert('Could not upload file.');
      }
    }
  };
  xhr.send(file);
}

vm.addResumeToProfile = function(){
  $http.patch('/api/users/' + vm.currentUser._id, {resume: vm.resumeUrl})
    .then(function(data){
      vm.resume = data.data.resume
    })
}

vm.deleteResume = function() {
  const resume = ''

  $http.patch('/api/users/' + vm.currentUser._id, {resume: resume})
    .then(function(data){
      vm.resume = ''
    })
}

  // EDIT USER
  vm.editUser = function() {
    if(vm.locationInput){
      vm.googleLocation = vm.locationInput.value
      vm.currentUser.location = vm.locationInput.value
    }

    $http.patch('/api/users/'+ vm.currentUser._id, vm.currentUser)
      .success(function(data) {
        console.log(data);
        vm.currentUser.location = data.location
      })
      .error(function(data) {
        vm.modal.isFailure = true
        vm.modal.content = 'An error has occurred. Please try again.'
      })
      .finally(function() {
        if(vm.editingState1 == true){
          vm.editingState1 = false
        } else if (vm.editingState2 == true) {
          vm.editingState2 = false
        } else if (vm.editingState3 == true) {
          vm.editingState3 = false
        } else if (vm.editingState4 == true) {
          vm.editingState4 = false
        }
        // vm.openModal()
      })
  }

  vm.setIframeSrc = function(){
    document.getElementById('resumeElement').src = vm.resume
  }

  vm.openModal = function() {
    vm.modal.show = true
  }

  vm.openModal2 = function() {
    vm.modal.show2 = true
    vm.showSaveButton = true;
  }

  vm.openModal3 = function() {
    vm.modal.show3 = true
  }

  vm.closeModal = function() {
    vm.modal.show = false
    vm.modal.isSuccess = false
    vm.modal.isFailure = false
    // $state.reload()
  }

  vm.closeModal2 = function() {
    vm.modal.show2 = false
  }

  vm.closeModal3 = function() {
    vm.modal.show3 = false
  }

  vm.openUpgradeModal = function() {
    vm.upgradeModal.show = true
  }

  vm.closeUpgradeModal = function() {
    vm.upgradeModal.show = false
    vm.upgradeModal.isSuccess = false
    vm.upgradeModal.isFailure = false
  }

  vm.compareDate = function(date){
    date = new Date(date)
    date.setDate(date.getDate() + 1)
    if(!date){
      return false
    }
    return new Date() < date
  }

  // function to print out view offer buttons
  // user is not stored into the production model so have to loop through 2 models
  vm.getOfferId = function(production){
    var id = ''
    for(var i=0; i<vm.currentUser.offersReceived.length; i++){
      if(vm.checkIdMatching(vm.currentUser.offersReceived[i]._id, production)){
        // id that was matched
        id = vm.checkIdMatching(vm.currentUser.offersReceived[i]._id, production)
      }
    }

    return id
  }

  vm.checkIdMatching = function(id, production){
    for(var i=0; i<production.crew.length; i++){
      if(id == production.crew[i]){
        return id
      }
    }
  }

  /*
   Function called when file input updated. If there is a file selected, then
   start upload procedure by asking for a signed request from the app.
  */
  vm.initUpload = function(){
    // console.log('init upload');
    var file = vm.imageFile
    // console.log(file);
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
    console.log('getting signed request');
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
          $mixpanel.track('Profile Picture Uploaded', {"user" : vm.currentUser.username})
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
            // console.log(xhr.status);
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

    function initialRows(bio){

      if(bio){
        var len = bio.length
        if (len == 0){
          vm.rows = 4
        } else if(len<75){
          vm.rows = 1
        } else if (len > 74 && len < 150) {
          vm.rows = 2
        } else if (len > 149 && len < 225) {
          vm.rows = 3
        } else if (len > 224 && len < 300) {
          vm.rows = 4
        } else if (len > 299 && len < 375) {
          vm.rows = 5
        } else if (len > 374 && len < 425) {
          vm.rows = 6
        } else if (len > 424 && len < 500) {
          vm.rows = 7
        } else if (len > 499 && len < 575) {
          vm.rows = 8
        } else if (len > 574 && len < 650) {
          vm.rows = 9
        } else if (len > 649 && len < 725) {
          vm.rows = 10
        } else if (len > 724 && len < 800) {
          vm.rows = 11
        } else if (len > 799 && len < 875) {
          vm.rows = 12
        } else if (len > 874 && len < 950) {
          vm.rows = 13
        } else if (len > 949) {
          vm.rows = 14
        }
      } else {vm.rows = 4}
    }
}
