'use strict';

var path = process.cwd();
var ApiService = require(path + '/app/service/ApiService.js');

module.exports = function (app) {

    var apiService = new ApiService();

    app.route('/api/search')
        .get(apiService.search);

    app.route('/api/going/:placeId')
        .post(apiService.markGoingToPlace);

    app.route('/api/going/:placeId')
        .delete(apiService.unmarkGoingToPlace);

    app.route('/api/userDetails')
        .get(apiService.userDetails);

    app.route('/api/twitter/requestLogin')
        .post(apiService.twitterRequestLogin);

    app.route('/api/twitter/callback')
        .get(apiService.twitterCallback);

    app.route('/api/logout')
        .get(apiService.doLogout);

};