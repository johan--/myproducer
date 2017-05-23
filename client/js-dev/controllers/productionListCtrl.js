angular.module('myApp')
  .controller('productionListController', productionListController)
  .directive('myRepeatDirective', myRepeatDirective)

  productionListController.$inject = ['$rootScope', '$http', '$stateParams', '$state', 'AuthService', '$mixpanel']

  myRepeatDirective.$inject = ['$http']

  function myRepeatDirective($http){
    return function(scope, element, attrs){
      if(scope.$last){
        var draggables = []
        var droppables = []
        var tagModel = {
          label: '',
          productions: []
        }

        droppables.push($('.droppable'))
        droppables[0].each(function(){
          $(this).droppable({
            drop: function(event,ui){
              // if user is dropping production day into a group
              if($(this).parent().is('button')){
                ui.draggable.addClass('accordion-panel')
                ui.draggable.draggable('disable')
                ui.draggable.css('display', 'block')
                $(this).parent().append(ui.draggable)
              } else{
              // make a new group with the 2 production days
              var accordionLocation = $('#accordionLocation')
              var newAccordion = $('<button class="accordion"><p id="p-tag"></p></button>')
              var productionGroupModal = $('#directive-modal')
              productionGroupModal.css('display', 'table')
              var productionGroupInput = $('#directive-modal-input')
              var productionGroupButton = $('#directive-modal-button')

              tagModel.productions.push($(this).children()[0].id)
              tagModel.productions.push(ui.draggable.children()[0].id)

              productionGroupButton.on('click', function(){
                // create Tag object in backend
                var productionName = productionGroupInput.val()
                $('#p-tag').innerText = productionName
                productionGroupModal.css('display', 'none')

                tagModel.label = productionName

                $http.post('/api/tag/newtag', tagModel)
                  .success(function(data){
                    console.log(data);
                  })
              })


              $(this).addClass('accordion-panel')
              $(this).draggable('disable')
              newAccordion.append($(this))

              ui.draggable.addClass('accordion-panel')
              ui.draggable.draggable('disable')
              newAccordion.append(ui.draggable)

              newAccordion.droppable()
              accordionLocation.append(newAccordion)

              // show production days on click of the button
              newAccordion.on('click', function(){
                this.classList.toggle('active')

                if(this.classList.contains('active')){
                  $('.accordion-panel').show()
                } else {
                  $('.accordion-panel').hide()
                }
              })
            }
            }
          })
        })

        // grab all production days and make them draggable
        draggables.push($('.draggable'))
        draggables[0].each(function(){
          $(this).draggable({
            axis: 'y',
            containment: 'parent'
          })
        })
      }
    }
  }

// PRODUCTIONS

function productionListController($rootScope, $http, $stateParams, $state, AuthService, $mixpanel){
  var vm = this
  vm.hoverCreate = false
  vm.upgradeModal = {}
  vm.notifModal = {}
  $rootScope.activeTab = {}
  $rootScope.activeTab.production = true
  vm.productionsDraggable = []
  vm.productionsDroppable = []

  if($state.params.upgradeModal === true) {
    vm.upgradeModal.show = true
  }

  AuthService.getUserStatus()
    .then(function(data){
      // vm.currentUser = data.data.user
      // console.log(data.data.user)
      $http.get('/api/users/' + data.data.user._id + '/productions')
        .success(function(data){
          vm.currentUser = data
          vm.userTaggables = vm.currentUser.taggables
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

          // if (vm.currentUser.role === 'producer') {
          //   vm.updateMinDateTo()
          // }
        })
  })

// multi day productions
  vm.accordionClick = function($event){
    const button = $event.target
    button.classList.toggle('active')
    if(button.classList.contains('active')){
      $(button).children().show()
    } else {
      $(button).children().not('p').hide()
    }
  }

  vm.checkIfTagged = function(production){
    for(var i=0; i<vm.userTaggables.length; i++){
      if(vm.compareDate(production.date)){
        var tagged = vm.checkTagArray(production, vm.userTaggables[i])
      }
    }
    return tagged
  }

  vm.checkTagArray = function(obj, tag){
    var tagged = false
    for(var i=0; i<tag.taggables.length; i++){
      if(tag.taggables[i]._id == obj._id){
        console.log('matched');
        tagged = true
      }
    }
    return tagged
  }

  vm.deleteTags = function(){
    $http.delete('/api/tag/deletetags')
    .success(function(data){
      console.log(data);
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
    // code to restrict free accounts
    // if current user did not subscribe, restrict from making a production

    if(!vm.currentUser.stripePlan && !vm.currentUser.stripeAccount) {
      vm.showCreateProdModal = false
      vm.upgradeModal.isFailure = true
      vm.upgradeModal.content = 'Oops! You must upgrade your account to do that'
      vm.upgradeModal.show = true
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

      // console.log(newProduction);
      $http.post('/api/productions', newProduction)
        .success(function(data){
          vm.currentUser.allProductions = vm.currentUser.productions.concat(data)
          // console.log(vm.currentUser)
          // vm.currentUser.productions.push(data)
          // vm.newProduction = {}
          // // redirect them to production view
          // // $state.go('production')
          $mixpanel.track('New Production Added', {"user" : vm.currentUser.username, "length" : data.length})
          vm.closeCreateProdModal()
        })
    }
  }

  vm.deleteProduction = function(name, id) {
      $http.patch('/api/productions/' + id, {active: false})
        .success(function(data) {
          // console.log(data);
          vm.currentUser.allProductions = vm.currentUser.allProductions.filter(function(p, i) {
            return p._id.toString() != id
          })
          vm.notifModal.isSuccess = true
          vm.notifModal.content = 'You have successfully deleted ' + name
          $mixpanel.track('Production Deleted', {"user" : vm.currentUser.username})
        })
        .error(function(data) {
          // console.log(data);
          vm.notifModal.isFailure = true
          vm.notifModal.content = 'An error has occurred. Please try again.'
        })
        // .finally(function() {
        //   vm.openNotifModal()
        // })
  }

  vm.openCreateProdModal = function(){
    vm.showCreateProdModal = true
  }

  vm.closeCreateProdModal = function(){
    vm.showCreateProdModal = false
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
}
