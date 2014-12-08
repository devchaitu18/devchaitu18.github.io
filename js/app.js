(function(){
var app = angular.module('syncBudget',['ngRoute','ui.bootstrap','ngTouch']);



	//Routing Configuration

	app.config(function($routeProvider) {


		$routeProvider

		// route for the categories page
		.when('/addCategories', {
			templateUrl : 'addCategories.html'
		})

		.when('/addExpense', {
			templateUrl : 'addExpense.html'
		})

		.when('/showCategories', {
			templateUrl : 'showCategories.html'
		})

		.when('/showGraphs', {
			templateUrl : 'showGraphs.html'
		})

		.when('/showExpenses', {
			templateUrl : 'showExpenses.html'
		})

		.when('/contact', {
			templateUrl : 'contact.html'
		})

		//route to sync budget medium collection blog
		.when('/blog', {
			templateUrl : 'blog.html'
		})

		.when('/home', {
			templateUrl : 'addExpense.html'
		});



	});

	//Dropbox Intialization is done here
	app.run(function($rootScope) {

		var APP_KEY = 'iiz72ijenjkeuw9';
		var client = $rootScope.myClient = new Dropbox.Client({key: APP_KEY});

		$rootScope.isClientAuthenticated = false;


		// Try to finish OAuth authorization.
		client.authenticate({interactive: false}, function (error) {
			if (error) {
				alert('Authentication error: ' + error);
			}

		});



		$rootScope.getUser = function(){
			client.getAccountInfo(function (error, info) {
				$rootScope.user = info.name;
				$rootScope.$apply();
			});
			var datastoreManager = client.getDatastoreManager();
			datastoreManager.openDefaultDatastore(function (error, defaultDatastore) {
				if (error) {
					alert('Error opening default datastore: ' + error);
				}

				// Now you have a datastore. The next few examples can be included here.
				$rootScope.datastore = defaultDatastore;
				$rootScope.$apply();
			});
		};







		if(client.isAuthenticated()){
			console.log("First check client is Authenticated::");
			console.log(client.isAuthenticated());
			$rootScope.isClientAuthenticated = true;

			$rootScope.getUser();



		}

		// Authenticate when the user clicks the connect button.
		$('#connectDropbox').click(function (e) {
			e.preventDefault();
			client.authenticate();
			console.log("Client.autenticate called when connect to dropbox is clicked");
			if(client.isAuthenticated()){
				$rootScope.isClientAuthenticated = true;
				$rootScope.getUser();
			}

		});

		});

		app.controller('showCategoriesController', function($scope){



			$scope.getCategories = function(){
				console.log("Get Categories called");
				var store = $scope.datastore;
				console.log(store);
				var categoriesTable = store.getTable('categories');
				$scope.categories = categoriesTable.query();
				console.log($scope.categories);
				console.log($scope.categories[0].get('name'));

			};

			$scope.getCategories();



		});

		app.controller('showExpensesController', function($scope){

			$scope.getExpenses = function(){
				console.log("Get Expenses called");
				var store = $scope.datastore;
				var expensesTable = store.getTable('expenses');
				$scope.expenses = expensesTable.query();
				console.log("expenses Array by day");
				console.log(expensesTable.query({date: 7,month: 12}));

			};

			$scope.getExpenses();
			var expensesChartData = [];

			/*for(var i = 0; i < $scope.expenses.length; i++ ){
				var expenseChartElement = {}
				expenseChartElement.date = $scope.expenses[0].get('date');
				expenseChartElement.amount = Number($scope.expenses[0].get('amount'));
				expensesChartData.push(expenseChartElement);
			}*/
			console.log("expensesChartData");
			console.log(expensesChartData);

			//Show Chart
			$('#dailyChart').highcharts({
				chart: {
					type: 'column'
				},
				title: {
					text: 'Your Expenses Summary'
				},
				yAxis: {
					title: {
						text: 'Amount'
					}
				},
				series: [{
					data: [1,5]
				}]
			});

		});




		app.controller('addExpenseController', function($scope){

			$scope.thisExpenseTags = [];
			$scope.allTags = [];
			var tagsRecords = $scope.datastore.getTable('tags').query();
			for (var i=0; i < tagsRecords.length; i++) {
				$scope.allTags.push(tagsRecords[i].get('name'));
			}
			console.log("All Tags")


			$("#expense_tag_handler").tagHandler({
				availableTags: $scope.allTags,
				onAdd: function(tag) {$scope.thisExpenseTags.push(tag);$scope.$apply();console.log($scope.thisExpenseTags);},
				onDelete: function(tag) {$scope.thisExpenseTags.pop(tag);$scope.$apply();},
				autocomplete: true
			});




			$scope.addExpense = function(){
				console.log("Add expense called");
				var store = $scope.datastore;
				var expensesTable = store.getTable('expenses');
				// Add expense to expenses table
				var newExpenseRecord = expensesTable.insert({
					amount : $scope.expenseAmount,
					category : $scope.expenseCategory,
					date: $scope.dt.getDate(),
					month: $scope.dt.getMonth(),
					year: $scope.dt.getFullYear(),
					tags: $scope.thisExpenseTags

				});
				// Add new tags to tags table
				var tagsTable = store.getTable('tags');
				$scope.newTags = _.difference($scope.thisExpenseTags, $scope.allTags);
				console.log("New Tags");
				console.log($scope.newTags);
				var insertTags = $scope.newTags;
				for (var i=0; i < insertTags.length; i++) {
					tagsTable.insert({
					name: insertTags[i]
				});
				}


			};

			$scope.open = function($event) {
				$event.preventDefault();
				$event.stopPropagation();

				$scope.opened = true;
			};

			$scope.dateOptions = {
				formatYear: 'yy',
				startingDay: 1
			};

			$scope.today = function() {
				$scope.dt = new Date().toDateString();
			};
			$scope.today();

			$scope.clear = function () {
				$scope.dt = null;
			};


		});

		app.controller('addCategoriesController', function($scope) {
			$scope.iconName = "glass";
			$scope.categoryType = "Primary";
			$scope.addNewCategory = function(){
				var store = $scope.datastore;
				var categoriesTable = store.getTable('categories');
				var newCategoryRecord = categoriesTable.insert({
					name : $scope.categoryName,
					icon : $scope.iconName,
					type : $scope.categoryType

				});

			};


			console.log("Entered categoryIconCarousel");
			//$scope.myInterval = 80000;
			var slides = $scope.slides = ["coffee",
			"credit-card",
			"cut",
			"glass",
			"hospital-o",
			"heart-o",
			"bus",
			"bicycle",
			"bank",
			"book",
			"beer",
			"cab",
			"child",
			"wrench",
			"video-camera",
			"trophy",
			"spoon",
			"shopping-cart",
			"shield",
			"rocket",
			"plane",
			"phone",
			"music",
			"lemon-o",
			"gift",
			"cutlery",
			"cog",
			"briefcase"



			];



		});



	/*app.controller('SyncDropBox', function($scope){

		console.log("Rootscope::");
		console.log($scope.client);

		//console.log("client authenticated");
				/*var datastoreManager = $rootScope.client.getDatastoreManager();
				datastoreManager.openDefaultDatastore(function (error, datastore) {
					if (error) {
						alert('Error opening default datastore: ' + error);
					}
				 $rootScope.userDatastore = datastore;
				 var testExpensesTable = datastore.getTable('testExpensesTable');
		    	 console.log("testExpensesTable ::::")
		    	 console.log(testExpensesTable);



	});*/




})();
