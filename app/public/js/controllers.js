'use strict';


var nightControllers = angular.module('nightControllers', []);

nightControllers.controller('searchController', ['$scope', '$route', '$rootScope', '$window','$location', 'nightService',
    function ($scope, $route, $rootScope, $window, $location, nightService) {

        $scope.form = {};
        $scope.places = {};

        var refreshSearch = function() {
            $scope.form.location = $rootScope.userDetails.location;
            $scope.searchLocation();
        };

        $scope.$on('userDataReceivedEvent', refreshSearch);

        $scope.searchLocation = function() {
            $scope.places = {};
            var location = $scope.form.location;
            $scope.lastLocationSearched = '';
            nightService.searchLocation(location).then(function(data) {
                $scope.lastLocationSearched = location;
                $scope.places = data;
            });
        };

        $scope.attendEvent = function(placeId) {
            var location = $scope.lastLocationSearched;
            nightService.markGoingToPlace(placeId, location).then(function(data) {
                $scope.searchLocation();
            });
        };

        $scope.leaveEvent = function(placeId) {
            nightService.unmarkGoingToPlace(placeId).then(function(data) {
                $scope.searchLocation();
            });
        };

        if ($rootScope.userDetails && $rootScope.userDetails.location) {
            refreshSearch();
        }
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
            $scope.$emit('userDataReceivedEvent', data);
        });

    }]);