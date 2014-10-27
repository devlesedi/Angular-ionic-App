angular.module('angularApp.controllers', [])
.controller('FindCtrl', function($scope, Utils, IonicComponent, $location, ItemConfig, Promise, localStorageService) {
	
	$scope.item = {};
	$scope.items = ItemConfig.Item.all();

	$scope.categories = ItemConfig.Category.all();
	$scope.areas = ItemConfig.Area.all();

	$scope.filerSearch = function() {
		localStorageService.get("myFilters")==null&&($scope.myNewFilter="javascript");
		$scope.myFilters = localStorageService.get("myFilters")||[];
		if (Utils.params.categoryName) {
			//$scope.category = ItemConfig.Category.get($stateParams.categoryName);
			if($scope.category)
				where.tags = $scope.category._id;
		};
	}

	$scope.addFilter = function() {
		var t = encodeURIComponent($scope.myNewFilter);
		$scope.myFilters.indexOf(t)==-1&&($scope.myFilters.push(t),localStorageService.set("myFilters", $scope.myFilters), window.location="#!/jobs/")
	}
	$scope.removeFilter = function(t){
		console.log("remove filter: %s",t);
		$scope.myFilters.splice(t,1);
		localStorageService.set("myFilters",$scope.myFilters);
		window.location="#!/jobs/";
	};

	var where  = {"name": { $options: "i"  }};
		
	
	
	$scope.where = JSON.stringify(where);
	$scope.getJobsList = function() {
		//Promise.resolve({method: 'GET', url: '/data/jobs.json?where='+ $scope.where})
		Promise.resolve({method: 'GET', url: '/api/cobject/v0/item?where='+ $scope.where})
		.then(function(response){
			$scope.load = false;
			$scope.items = response.data.data;
			IonicComponent.ScrollDelegate.scrollTo(0,245, true)
			ItemConfig.Item.set(response.data.data);

			if($scope.items.length > 0)
				$scope.visible = true;
		},function(error){
			$scope.load = false;
		 	console.log(data);
		})
	}

	$scope.goTo=function(n){$location.path(n)};

	$scope.submit = function(){

		$scope.visible = true;
		$scope.items = {};
		$scope.load = true;
	
		if($scope.item.name == undefined)
			$scope.item.name = '';

		var where  = {"name": { "$regex" : ".*"+$scope.item.name+".*", $options: "i"  }}
		
		if($scope.item.selectedCategory)
			where.tags = ItemConfig.Category.get($scope.item.selectedCategory)._id
		
		if($scope.item.selectedArea)
			where.area = ItemConfig.Area.get($scope.item.selectedArea)._id	
		
		$scope.where = JSON.stringify(where);
			
		$scope.getJobsList();
	}

	$scope.getJobsList();
})
.controller('ItemCtrl', function($scope, Utils, IonicComponent, ItemConfig, Promise) {

	//angular.module("jobDetails",["ngSanitize"]).controller("jobDetailsCtrl",["$scope","$http","$routeParams",function(n,t,i){n.details={};n.applicant={};n.getJobDetails=function(i){t.get("/api/Jobs/GetJobDetails",{params:{id:i}}).success(function(t){n.details=t})};n.getJobDetails(i.jobId);n.salary=function(){var i="£",t=n.details.salaryMin,r=n.details.salaryMax;return i+=r&&t?t+" - £"+r:t?t:r,n.details.salaryType&&(i+=" per "+n.details.salaryType),i};n.applyForJob=function(){item={email:n.applicant.email,skills:n.applicant.skills,experience:n.applicant.experience,message:n.applicant.message,jobPostId:n.details.id};n.applicant.email!=""&&t.post("/api/Jobs/ApplyForJob",item).success(function(){n.applicant.message="";n.applied=!0;n.apply=!1})}}]);
	$scope.details = ItemConfig.Item.get(Utils.Params.objectId);

	var area = $scope.details.area[0]
	var category = $scope.details.tags[0]
	$scope.category = ItemConfig.Category.getFromId(category).name;
	$scope.area = ItemConfig.Area.getFromId(area).name;
	
	IonicComponent.Modal.fromTemplateUrl('my-modal.html', {
	    scope: $scope,
	    animation: 'slide-in-up'
	}).then(function(modal) {
	    $scope.modal = modal;
	});

	$scope.openModal = function() {
		$scope.modal.show();
	};
	$scope.closeModal = function() {
		$scope.modal.hide();
	};
		$scope.$on('$destroy', function() {
		$scope.modal.remove();
	});

	$scope.contact = function(item){
		if($scope.contact.email && $scope.contact.text){
			
			var data = EmailTemplate.contactSeller($scope, item)
			IonicComponent.Loading.show({template: 'Sending Email...'});
			//SEND EMAIL
			Promise.resolve({ url: '/api/email/v0/send',method:'POST',data: data})
			.then(function(response){
				IonicComponent.Loading.hide();
				$scope.closeModal();

			}, function(error){
				//TO-DO
				console.log(err)
			})

		}else{
			IonicComponent.Loading.show({template: 'Complete all fields'});
	  	setTimeout(function() {
	     IonicComponent.Loading.hide();
	  	}, 1500);
		}
	}
})
.controller('PublishCtrl', function($scope, $timeout, Utils, IonicComponent, EmailTemplate, PopupTemplate, ItemConfig, Promise) {
	
	$scope.user = {};
	$scope.publish = {};
	$scope.categories = ItemConfig.Category.all();
	$scope.areas = ItemConfig.Area.all();
	$scope.onlyNumbers = /^\d+$/;
	$scope.user = Utils.LocalStorage.getObject('user')

  $scope.getPhoto = function() {
		//navigator.camera.getPicture(onSuccess, onFail, { quality: 75, targetWidth: 320,
    //targetHeight: 320, destinationType: 0 });
	var $fileControl = $('#img-upload');
	$fileControl.on('change', onSuccess);
	$fileControl.click();
	

		function onSuccess(evt) {
			console.log('onchange');
			var files = evt.target.files;
			for (var i = 0,f; f = files[i];i++) {
				if (!f.type.match("image*")) {continue;};
				var reader = new FileReader();
				reader.onload = (function(theFile, $) {
					return function(e) {
						$('#image-preview').attr('src', e.target.result);
 			 			$scope.lastPhoto = Utils.dataURItoBlob(e.target.result);
					};
				})(f, jQuery);

				reader.readAsDataURL(f);
			};		
		    // var image = document.getElementById('image-preview');
		    // image.src = "data:image/jpeg;base64," + imageData;
		}

		function onFail(message) {
				//TO-DO
		    console.log('Failed because: ' + message);
		}
  }

	$scope.publishItem = function(){
		//validate all field before
		var validate = Utils.validateAll($scope.publish, $scope.lastPhoto)
		if(validate){
			
			//rewrite
			var formDataResult = new FormData();
			formDataResult.append('jobTitle', $scope.publish.name)
			formDataResult.append('jobDescription', $scope.publish.description)
			formDataResult.append('jobLocation', ItemConfig.Area.get($scope.publish.area)._id)
			formDataResult.append('jobType', ItemConfig.Category.get($scope.publish.category)._id)
			formDataResult.append('companyName', $scope.publish.companyName)
			formDataResult.append('companySite', $scope.publish.companySite)
			formDataResult.append('minSalaray', $scope.publish.minSalaray)
			formDataResult.append('maxSalary', $scope.publish.maxSalary)
			formDataResult.append('salaryRate', $scope.publish.salaryRate)
			formDataResult.append('jobEmail', $scope.publish.email)
			formDataResult.append('telephone', $scope.publish.telephone)
			formDataResult.append('address', $scope.publish.address)
			formDataResult.append('hiringCompanyLogo', $scope.lastPhoto, $scope.publish.name+'.jpg')
			formDataResult.append('publish', false)

			if($scope.user._id)
				formDataResult.append('user', $scope.user._id)

		 	IonicComponent.Loading.show({template: 'Sending Data...'});

		 	Promise.resolve({url:'/api/cobject/v0/item', method:'POST', data:formDataResult, transformRequest: angular.identity, headers: {'Content-Type': undefined}})
		 	.then(function(response){
		 		IonicComponent.Loading.hide();
  	  			var data = EmailTemplate.confirmPublish($scope,response.data)
				//SEND EMAIL
				Promise.resolve({ url: '/api/email/v0/send',method:'POST', data: data})
				.then(function(response){
					var popup = PopupTemplate.popupEmailPublish()
					var alertPopup = IonicComponent.Popup.alert(popup);
			   	alertPopup.then(function(res) {
			     	Utils.State.go('tab.item', {})
			   	});
				},function(err){
					console.log(err)
				})
		 	},function(err){
		 		IonicComponent.Loading.hide();
	    	console.log(err)
		 	})
		//NOT VALID FORMDATA
		}else{
			IonicComponent.Loading.show({
		    template: 'Complete all field and insert correctly'
		  });
		  $timeout(function(){IonicComponent.Loading.hide();},1200)
		}
	}
})
.controller('AccountCtrl', function($scope, Utils, IonicComponent, YourItems, PopupTemplate, Promise, User) {
	
	$scope.user = Utils.LocalStorage.getObject('user')
	$scope.load = false;
	$scope.items = YourItems.all();

	var settingWhere = function(){
		var where  = {"user": $scope.user._id, "publish": true}
	  where = JSON.stringify(where)
	  return where
	}

	if($scope.user._id && !YourItems.isLoad()){
		$scope.load = true;
		var where = settingWhere()
		Promise.resolve({method: 'GET',url:  '/api/cobject/v0/item?where='+where})
		.then(function(response){
			$scope.load = false;
			$scope.items = response.data.data
			YourItems.set(response.data.data)
		}, function(err){
			$scope.load = false;
		})
	}

	$scope.doRefresh = function(){
		var where = settingWhere()
		
		Promise.resolve({method: 'GET',url:  '/api/cobject/v0/item?where='+where})
		.then(function(response){
			$scope.items = response.data.data
			YourItems.set(response.data.data)
		},function(err){
			console.log(err)
			//TO-DO
		}).finally(function(){
			$scope.$broadcast('scroll.refreshComplete');
		})

	}

	$scope.delete = function(obj){
		var popup = PopupTemplate.deleteItem()
	   var confirmPopup = IonicComponent.Popup.confirm(popup)
	   confirmPopup.then(function(res) {
	     if(res) {
	     	Promise.resolve({method: 'DELETE',url:  '/api/cobject/v0/item/'+obj._id})
	     	.then(function(response){
     			var index = $scope.items.indexOf(obj)
					$scope.items.splice(index, 1); 
					YourItems.set($scope.items)
	     	},function(err){
	     		console.log(err)
	     	})
	     }
	   });
	}

	$scope.goToLogin = function(){
		Utils.State.go('settings', {})
	}
})
.controller('SettingsCtrl', function($scope, $timeout, Utils, User, IonicComponent, PopupTemplate, Promise) {
	
	$scope.user = Utils.LocalStorage.getObject('user')
	$scope.modal = {}

	$scope.logout = function(){
		$scope.user = {};
		Utils.LocalStorage.remove('user')
	}

	$scope.confirm= function(){
		var popup = PopupTemplate.confirmItem($scope)
		var myPopup = IonicComponent.Popup.show(popup);

	  myPopup.then(function(res) {
	  	if(res){
			 	IonicComponent.Loading.show({template: 'Publish...'});
		    Promise.resolve({method: 'PATCH', data : {publish: true}, timeout: 3000, url: '/api/cobject/v0/item/'+res})
		    .then(function(response){
					IonicComponent.Loading.hide();
		    },function(err){
					IonicComponent.Loading.hide();
	  	 		IonicComponent.Loading.show({template: 'Error'});
		    	$timeout(function(){IonicComponent.Loading.hide();},2000)	  	
		    })	  	 
  		}
	  });
	}	
})
.controller('LoginCtrl', function($scope, $timeout, Utils, User) {
		
	$scope.loginUser = {}
	$scope.signupUser = {}

	var loginOrSignUp = function(type){
		$scope[type+'User'].email = $scope[type+'User'].email.toLowerCase();
		User[type]($scope[type+'User']).then(function(response){
			Utils.LocalStorage.setObject('user', response.data)
			Utils.State.go('settings', {});
		},function(error){
			console.log(error)
			IonicComponent.Loading.show({template: 'Ops something went wrong...'});	 
	    $timeout(function() {IonicComponent.Loading.hide();}, 2000)
		})
	}
	$scope.login = function(){
		loginOrSignUp('login')
	}
	$scope.signup = function(){
		loginOrSignUp('signup')
	}
})