'use strict';


var nightControllers = angular.module('nightControllers', []);

nightControllers.controller('placesController', ['$scope', '$route', '$window','$location', 'nightService',
    function ($scope, $route, $window, $location, nightService) {

        var listPlaces = function() {
            nightService.listPlaces().then(function(data) {
                $scope.polls = data;
            });
        };

        listPlaces();
    }]);

nightControllers.controller('searchController', ['$scope', '$route', '$window','$location', 'nightService',
    function ($scope, $route, $window, $location, nightService) {

        //TODO
    }]);


nightControllers.controller('barController', ['$scope', '$rootScope', '$route', '$routeParams' ,'$window','$location', 'nightService',
    function ($scope, $rootScope, $route, $routeParams , $window, $location, nightService) {

        $rootScope.userDetails = {};
        $scope.twitterLogin = function() {
            nightService.doLogin().then(function(data) {
                window.open(data.location,  "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=400,height=400");
            });
        };

        $scope.twitterLogout = function() {
            nightService.doLogout().then(function() {
                $rootScope.userDetails = {};
                $location.path('/');
            });
        };

        nightService.userDetails().then(function(data) {
            $rootScope.userDetails = data;
        });
        
    }]);