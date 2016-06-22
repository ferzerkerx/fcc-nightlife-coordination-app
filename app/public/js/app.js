'use strict';


if (window.opener)  {
    window.opener.location.reload();
    window.close();
}

var nightApp = angular.module('nightApp', [
    'ngRoute',
    'nightControllers',
    'nightServices'
]);

nightApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/search', {
            templateUrl: 'public/partials/search.html',
            controller: 'searchController'
        }).
        otherwise({
            redirectTo: '/search'
        });
    }]);
