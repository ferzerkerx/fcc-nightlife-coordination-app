
'use strict';

/* Services */

var nightServices = angular.module('nightServices', ['ngResource']);

nightServices.factory('nightService', ['$http', '$location',
    function($http, $location) {

        var appContext = $location.absUrl();
        if (appContext.indexOf("#")) {
            appContext =  appContext.substring(0, appContext.indexOf("#") - 1);
        }

        var searchLocation = function(location) {
            var url = appContext + '/api/search/?location=' + location;
            return $http.get(url).then(function (response) {
                return response.data;
            });
        };


        var markGoingToPlace = function(placeId) {
            var url = appContext + '/api/going/' + placeId;
            return $http.post(url, data).then(function (response) {
                return response.data;
            });
        };

        var unmarkGoingToPlace = function(placeId) {
            var url = appContext + '/api/going/' + placeId;
            return $http.delete(url).then(function (response) {
                return response.data;
            });
        };


        var doLogin = function() {
            var url = appContext + '/api/twitter/requestLogin';
            return $http.post(url).then(function (response) {
                return response.data;
            });
        };

        var doLogout = function() {
            var url = appContext + '/api/logout';
            return $http.get(url).then(function (response) {
                return response.data;
            });
        };

        var userDetails = function() {
            var url = appContext + '/api/userDetails';
            return $http.get(url).then(function (response) {
                return response.data;
            });
        };

        return {
            searchLocation: searchLocation,
            doLogin: doLogin,
            doLogout: doLogout,
            userDetails: userDetails
        };
    }]);

