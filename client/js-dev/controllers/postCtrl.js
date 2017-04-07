angular.module('myApp')
  .controller('postController', postController)

postController.$inject = ['$rootScope', '$http', '$stateParams', '$state', 'AuthService', '$scope', '$mixpanel']

// PRODUCTIONS

function postController($rootScope, $http, $stateParams, $state, AuthService, $scope, $mixpanel){
  var vm = this
  vm.currentUser = {}
  vm.editingState = false;
  vm.fileInput = document.getElementById('file-input')
  vm.modal = {}
  vm.showSaveButton = true;

  $scope.file_changed = function(element) {
    document.getElementById('profile-pic-preview').src = URL.createObjectURL(element.files[0]);
    // console.log("File selected");
    vm.showSaveButton = false;
  };

/////////////////// ng img crop code //////////////////////

  // image cropping
  // $scope.myImage = '';
  // $scope.myCroppedImage = '';

//   $scope.init = function() {
//     var file = angular.element(document.getElementById("file-input"));
//     file.on('change', handleFileSelect)
// }

  // var handleFileSelect=function(evt) {
  //   console.log("handle file hit");
  //   var file=evt.currentTarget.files[0];
  //   var reader = new FileReader();
  //   reader.onload = function (evt) {
  //     $scope.$apply(function($scope){
  //       $scope.myImage=evt.target.result;
  //     });
  //   };
  //   reader.readAsDataURL(file);
  // };



  ////////////////////////// end of ng img crop code ///////////


  $rootScope.activeTab = {}
  $rootScope.activeTab.profile = true

  // vm.currentUser.productions = []
  AuthService.getUserStatus()
    .then(function(data){
      $http.get('/api/users/' + data.data.user._id + '/profile')
        .success(function(data){
          vm.currentUser = data
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

          vm.ready = true
        })
  })

  // EDIT USER
  vm.editUser = function() {
    $http.patch('/api/users/'+ vm.currentUser._id, vm.currentUser)
      .success(function(data) {
        // // vm.currentUser.productions = data.productions
        // // vm.currentUser.offersReceived = data.offersReceived
        // vm.currentUser = data
        // console.log(vm.currentUser);
        // console.log(vm.currentUser.offersReceived);
        // console.log(vm.currentUser.productions);
        // vm.modal.isSuccess = true
        // // vm.modal.content = 'You have successfully updated your profile.'
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

  vm.openModal = function() {
    vm.modal.show = true
  }

  vm.openModal2 = function() {
    vm.modal.show2 = true
    vm.showSaveButton = true;
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

  //////////////// code to change base64 to BLOB //////////////


  //   var dataURItoBlob = function(dataURI) {
  //   var binary = atob(dataURI.split(',')[1]);
  //   var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  //   var array = [];
  //   for(var i = 0; i < binary.length; i++) {
  //     array.push(binary.charCodeAt(i));
  //   }
  //   return new Blob([new Uint8Array(array)], {type: mimeString});
  // };
  //
  //   var blob = dataURItoBlob($scope.myCroppedImage)


  ////////////// end of blob code //////////////////////////////



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
