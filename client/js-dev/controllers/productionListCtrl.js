angular.module('myApp')
  .controller('productionListController', productionListController)
  .directive('myRepeatDirective', myRepeatDirective)

  productionListController.$inject = ['$rootScope', '$http', '$stateParams', '$state', 'AuthService', '$mixpanel']

  myRepeatDirective.$inject = ['$http', 'AuthService', '$rootScope', '$state', '$timeout']

  function myRepeatDirective($http, AuthService, $rootScope, $state, $timeout){
    return function(scope, element, attr){
      var timeoutID = [];
        $timeout.cancel(timeoutID[attr.myRepeatDirectiveIndex]);
        timeoutID[attr.myRepeatDirectiveIndex] = $timeout(function () {
          scope.$eval(attr.myRepeatDirective);
        }, attr.myRepeatDirectiveLength * 1.5);

        var draggables = []
        var droppables = []
        var tagModel = {
          label: '',
          productions: []
        }

        var controllerElement = document.querySelector('body');
        var controllerScope = angular.element(controllerElement).scope();

        draggables.push($('.draggable'))
        draggables[0].each(function(){
          $(this).draggable({
            axis: 'y',
            containment: 'parent',
            snap: true,
            snapMode: 'inner'
          })
        })

        droppables.push($('.droppable'))
        droppables[0].each(function(){
          $(this).droppable({
            drop: function(event,ui){
              if($(this).parent().is('div') && $(this).parent()[0].classList.contains('accordion')){
                var location = $(this)
              }

              // multiple productions dropped into group
              if(ui.draggable[0].classList.contains('chosen')){
                const chosenProductionData = {
                  chosenIds: [],
                  tagId: ''
                }

                $('.chosen').each(function(index){
                  chosenProductionData.chosenIds.push($(this).children()[0].id)
                  $(this).addClass('accordion-panel')
                  $(this).draggable('disable')
                  $(this).css('display', 'block')
                  $(this).css('left', 0)
                  $(this).removeClass('chosen')
                  $(location).parent().append($(this))
                  chosenProductionData.tagId = $(this).parent().children('p')[0].id

                  var tagData = {
                    productionId: chosenProductionData.chosenIds[index],
                    tagId: chosenProductionData.tagId
                  }

                  $http.patch('/api/tag/addproduction', tagData)
                  .success(function(data){
                    console.log(data);
                  })
                })

              } else {
                  const tagData = {
                    productionId: '',
                    tagId: ''
                  }
                  tagData.productionId = ui.draggable.children()[0].id
                  // single production dropped into group
                  if($(this).parent().is('div') && $(this).parent()[0].classList.contains('accordion')){
                    tagData.tagId = $(this).parent().children('p')[0].id
                    ui.draggable.addClass('accordion-panel')
                    ui.draggable.draggable('disable')
                    ui.draggable.css('display', 'block')
                    ui.draggable.css('left', 0)
                    $(this).parent().append(ui.draggable)

                    $http.patch('/api/tag/addproduction', tagData)
                      .success(function(data){
                        console.log(data);
                      })
                  } else {
                      var productionGroupModal = $('#directive-modal')
                      productionGroupModal.css('display', 'table')
                      var productionGroupInput = $('#directive-modal-input')
                      var productionGroupButton = $('#directive-modal-button')

                      tagModel.productions.push($(this).children()[0].id)
                      tagModel.productions.push(ui.draggable.children()[0].id)

                      productionGroupButton.on('click', function(){
                        // create Tag object in backend
                        var productionName = productionGroupInput.val()
                        productionGroupModal.css('display', 'none')

                        tagModel.label = productionName

                        $http.post('/api/tag/newtag', tagModel)
                          .success(function(data){
                            // update current user tag array to render new Tag
                            controllerScope.userTaggables = data.taggables
                            // update rootscope usertaggables here
                            $state.go($state.current, {}, {reload: true})
                  })
                })
              }
            }
          }
        })
      })
    }
  }

// PRODUCTIONS

function productionListController($rootScope, $http, $stateParams, $state, AuthService, $mixpanel){
  var vm = this
  vm.hoverCreate = false
  vm.upgradeModal = {}
  vm.upgradeModalMessage = {}
  vm.notifModal = {}
  $rootScope.activeTab = {}
  $rootScope.activeTab.production = true
  vm.selectedProductions = []
  vm.productionsDraggable = []
  vm.productionsDroppable = []
  vm.editingTag = false

  if($state.params.upgradeModal === true) {
    vm.upgradeModal.show = true
  }

  AuthService.getUserStatus()
    .then(function(data){
      $http.get('/api/users/' + data.data.user._id + '/productions')
        .success(function(data){
          vm.currentUser = data
          vm.userTaggables = vm.currentUser.taggables
          $rootScope.userTaggables = vm.userTaggables
          // get all productions where I am a crew member
          var otherProductions = []
          data.offersReceived.forEach(function(crew) {
            if(crew.offer.status === 'Accepted') {
              otherProductions.push(crew.production)
            }
          })

          // combine my productions and other productions where I am crew member
          vm.currentUser.allProductions = data.productions.concat(otherProductions)
          vm.ready = true
        })
  })

// multi day productions
  vm.wholeAccordionClick = function($event){
    if($event.target.type == undefined){
      const button = $event.target
      const arrow = $($event.target).children('p').children('img')[0]

      arrow.classList.toggle('active')
      button.classList.toggle('active')

      if(button.classList.contains('active')){
        $(button).children().show()
      } else {
        $(button).children().not('p').not('button').hide()
      }
    }
  }

  vm.arrowAccordionClick = function($event){
    const arrow = $event.target
    const accordion = $(arrow).parent().parent()[0]

    arrow.classList.toggle('active')
    accordion.classList.toggle('active')

    if(accordion.classList.contains('active')){
      $(accordion).children().show()
    } else {
      $(accordion).children().not('p').not('button').hide()
    }
  }

  vm.checkIfTagged = function(production){
    var tagged = false
    if(production.tag.length > 0){
      tagged = true
    }
    return tagged
  }

  vm.editTag = function($event, id){
    vm.editingTag = true
    vm.editingTagId = id
    vm.editingTagName = $($event.target).parent().children('p')[0].innerText
  }

  vm.renameTag = function(){
    const newTagName = $('#editTag-modal-input').val()
    const editTagData = {
      id: vm.editingTagId,
      name: newTagName
    }

    $http.patch('/api/tag/edit/:id', editTagData)
      .success(function(data){
        vm.editingTag = false
        $rootScope.userTaggables = data.taggables
      })
  }

  var dateToday = new Date(Date.now())
  vm.dateFrom = dateToday
  vm.dateFrom.setHours(0)
  vm.dateFrom.setMinutes(0)
  vm.dateFrom.setSeconds(0)
  vm.dateFrom.setMilliseconds(0)
  vm.minDateFrom = dateToday.getFullYear() + '-' + (dateToday.getMonth() + 1) + '-' + dateToday.getDate()


  vm.updateMinDateTo = function() {
    var dateFrom = new Date(vm.dateFrom)
    vm.minDateTo = dateFrom.getFullYear() + '-' + (dateFrom.getMonth() + 1) + '-' + dateFrom.getDate()

    document.getElementById('prod-date-to').setAttribute('min', vm.minDateTo)

    if((new Date(vm.dateFrom)) > (new Date(vm.dateTo))){
      vm.dateTo = undefined
      vm.notifModal.isFailure = true
      vm.notifModal.content = 'Please check the production dates!'
      vm.notifModal.show = true
    }
  }

  vm.addProduction = function(){
    // check user account type
    if(!vm.currentUser.stripePlan && !vm.currentUser.stripeAccount) {
      // user that passes will be a free account
      var newProduction = {
        from: new Date(vm.dateFrom),
        to: new Date(vm.dateTo),
        by_ : vm.currentUser,
        name: vm.newProduction.name
      }
      // create production if the start and end date equal each other
      // TODO: check if that user has a production that is active
      if(Number(newProduction.to) == Number(newProduction.from)){
        $http.post('/api/productions', newProduction)
        .success(function(data){
          vm.currentUser.allProductions = vm.currentUser.productions.concat(data)
          $mixpanel.track('New Production Added', {"user" : vm.currentUser.username, "length" : data.length})
          vm.closeCreateProdModal()
        })
      }
      return
    }

    if((new Date(vm.dateFrom)) > (new Date(vm.dateTo)) )
    {
      vm.dateTo = undefined
      vm.notifModal.isFailure = true
      vm.notifModal.content = 'Please check the production dates! Your production end date is before its start date'
      vm.notifModal.show = true
    } else {
      var newProduction = {
        from: new Date(vm.dateFrom),
        to: new Date(vm.dateTo),
        by_ : vm.currentUser,
        name: vm.newProduction.name
      }

      $http.post('/api/productions', newProduction)
        .success(function(data){
          vm.currentUser.allProductions = vm.currentUser.productions.concat(data)
          $mixpanel.track('New Production Added', {"user" : vm.currentUser.username, "length" : data.length})
          vm.closeCreateProdModal()
        })
    }
  }

  vm.filterTag = function(tag, production){
    tag = tag.taggables.filter(function(t,i){
      return t._id != production._id
    })
    return tag
  }

  vm.deleteProduction = function(name, id) {
      $http.patch('/api/productions/' + id, {active: false})
        .success(function(data) {
          // if deleting a production within a Tag
          if(data.tag){
            for(var i=0; i<$rootScope.userTaggables.length; i++){
              $rootScope.userTaggables[i].taggables = vm.filterTag($rootScope.userTaggables[i], data)
            }
          }

          vm.currentUser.allProductions = vm.currentUser.allProductions.filter(function(p, i) {
            return p._id.toString() != id
          })
          vm.notifModal.isSuccess = true
          vm.notifModal.content = 'You have successfully deleted ' + name
          $mixpanel.track('Production Deleted', {"user" : vm.currentUser.username})
        })
        .error(function(data) {
          vm.notifModal.isFailure = true
          vm.notifModal.content = 'An error has occurred. Please try again.'
        })
  }

  vm.deleteTag = function(name, id){
    const tagData = {
      name: name,
      id: id
    }
    $http.patch('/api/tag/' + id, tagData)
      .success(function(data){

        $state.go($state.current, {}, {reload: true})

        // code below should re render single day productions. small bug on it that needs to be fixed

        // vm.currentUser.taggables = data.taggables
        // $rootScope.userTaggables = data.taggables
        //
        // var otherProductions = []
        // data.offersReceived.forEach(function(crew) {
        //   if(crew.offer.status === 'Accepted') {
        //     otherProductions.push(crew.production)
        //   }
        // })
        // // // combine my productions and other productions where I am crew member
        // vm.currentUser.allProductions = data.productions.concat(otherProductions)
      })
  }

  vm.addToGroup = function($event){
    var target = $event.target
    var id = $(target).parent().parent()[0].id || $(target).children()[0].id
    var targetedProduction
    var chosenProductions = []

    if($(target)[0].classList.contains('line-item')){
      targetedProduction = $(target)[0]
      chosenProductions.push(targetedProduction)
    } else if($(target).parent().parent().parent()[0].classList.contains('line-item')){
      targetedProduction = $(target).parent().parent().parent()[0]
      chosenProductions.push(targetedProduction)
    }

    if(vm.selectedProductions.indexOf(id) != -1){
      var index = vm.selectedProductions.indexOf(id)
      vm.selectedProductions.splice(index,1)
    } else {
      vm.selectedProductions.push(id)
    }

    var selectedClass = 'chosen',
        clickDelay = 500,
        lastClick,
        diffClick;

    $('.line-item')
      .bind('mousedown mouseup', function(e){
        if (e.type=="mousedown") {
          lastClick = e.timeStamp; // get mousedown time
        } else {
          diffClick = e.timeStamp - lastClick;
          if ( diffClick < clickDelay ) {
              // add selected class to group draggable objects
              $(this).toggleClass(selectedClass);
          }
        }
      })
      .draggable({
        revertDuration: 10,
        containment: '.demo',

        drag: function(e, ui) {
          $('.' + selectedClass).css({
            top : ui.position.top,
            left: ui.position.left
          })
        }
      })

  }

  vm.checkIfFreeHasProduction = function(production){
    if(vm.compareDate(production.date)){
      return true
    } else {
      return false
    }
  }

  vm.openCreateProdModal = function(){
    if(!vm.currentUser.stripePlan && !vm.currentUser.stripeAccount){
      // check if they have an active production day
      console.log(vm.currentUser.allProductions);
      for(var i=0; i<vm.currentUser.allProductions.length; i++){
        if(vm.checkIfFreeHasProduction(vm.currentUser.allProductions[i]) === true){
          vm.upgradeModalMessage.show = true
          vm.showCreateProdModal = false
          vm.upgradeModalMessage.isFailure = true
          vm.upgradeModalMessage.content = "You are using a free account which only includes 1 Active Production Day. Please upgrade to add more Production days"
        } else if(vm.checkIfFreeHasProduction(vm.currentUser.allProductions[i]) === false){
          vm.showCreateProdModal = true
        }
      }
    } else {
      vm.showCreateProdModal = true
    }

  }

  vm.closeCreateProdModal = function(){
    vm.showCreateProdModal = false
  }

  vm.closeUpgradeModalMessage = function(){
    vm.upgradeModalMessage.show = false
  }

  vm.openNotifModal = function() {
    vm.notifModal.show = true
  }

  vm.closeNotifModal = function() {
    vm.notifModal.show = false
    vm.notifModal.isSuccess = false
    vm.notifModal.isFailure = false
  }

  vm.openUpgradeModal = function() {
    vm.upgradeModalMessage.show = false
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

  vm.openDeleteProductionModal = function(name, id, index){
    vm.productionName = name
    vm.productionID = id
    vm.$index = index
    vm.showDeleteProductionModal = true;
  }

  vm.closeDeleteProductionModal = function(){
    vm.showDeleteProductionModal = false;
  }

  vm.openDeleteTagModal = function(name, id){
    vm.tagName = name
    vm.tagID = id
    vm.showDeleteTagModal = true
  }

  vm.closeDeleteTagModal = function(){
    vm.showDeleteTagModal = false
  }
}
