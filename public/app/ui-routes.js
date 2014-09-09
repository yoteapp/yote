angular.module('Yote')

.config(function($routeProvider, $locationProvider, $stateProvider, $urlRouterProvider){
  console.log('configure ui router');
  
  $locationProvider.html5Mode(true);

  // add a route to 404 page here
  $urlRouterProvider.otherwise('/');

  $stateProvider

    /********************** 
    *  Default Routes
    ***********************/

    // root state of the application. Loades default template. Is abstract so it also defers to the first child template
    .state('root', {
      abstract: true
      , url: '/'
      , templateUrl: '/views/layouts/homepage-layout'
    })

    // first child of root. is the hompage. Empty url: '' signifies '/' + ''
    .state('root.home', {
      url: ''
      , templateUrl: '/views/homepage/index'
      , controller: 'HomeCtrl'
    })

    .state('static', {
      abstract: true
      , url: '/static'
      , templateUrl: '/views/layouts/default'
      , controller: 'StaticCtrl'
    })

    .state('static.about', {
      url: '^/about'
      , templateUrl: '/views/static/about'
    })

    .state('static.faq', {
      url: '^/frequently-asked-questions'
      , templateUrl: '/views/static/faq'
    })

    /********************** 
    *  Post Routes
    ***********************/
    
    // parent state of post.  
    .state('post', {
      abstract: true
      , url: '/post'
      , templateUrl: '/views/layouts/default'
      , controller: 'PostCtrl'
    })
    // first child of post. Empty url: '' signifies "/post" + " "
    .state('post.list', {
      url: ''
      , templateUrl: '/views/post/list'
      , controller: 'PostListCtrl'
    })
    .state('post.show', {
      url: '/show/:postId'
      , templateUrl: '/views/post/show'
      , controller: 'PostShowCtrl'
    })
})

// end of file
;