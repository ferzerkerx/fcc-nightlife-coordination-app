'use strict';

var path = process.cwd();
var Place = require(path + '/app/models/Place.js');
var OAuth = require('oauth');
var qs = require("qs");

function ApiService () {

    var yelpConsumerKey = process.env.YELP_CONSUMER_KEY;
    var yelpConsumerSecret = process.env.YELP_CONSUMER_SECRET;
    var yelpOAuth = new OAuth.OAuth(
        'https://api.yelp.com/oauth/request_token',
        'https://api.yelp.com/oauth/access_token',
        yelpConsumerKey,
        yelpConsumerSecret,
        '1.0',
        process.env.APP_URL + '/api/yelp/callback',
        'HMAC-SHA1'
    );

    this.search = function (req, res) {
        var urlParams = req.url.substring(req.url.indexOf('?') + 1);
        var urlComponents = qs.parse(urlParams);
        var location =  urlComponents.location;

        yelpOAuth.get('https://api.yelp.com/v2/search/?category_filter=nightlife&location=' + location,
            process.env.YELP_TOKEN,
            process.env.YELP_TOKEN_SECRET,
            function (err, yelpResponseData) {
                if (err) {
                    console.log(err);
                    return res.status(500).json(err);
                }

                var parsedData = JSON.parse(yelpResponseData);
                console.log(parsedData);
                res.json(parsedData);
            });

        // Populate attendatns

        //Place.find({}, function(err, places){
        //    if (err) {
        //        console.log(err);
        //        return res.json(500, {});
        //    }
        //    return res.json(places);
        //});
    };



    //TODO validate this service is only invoked whenever a session is present
    this.markGoingToPlace = function (req, res) {

        var placeId =  req.params.pollId;

        //TODO find place and update attendant counts
    };


    //TODO validate this service is only invoked whenever a session is present
    this.unmarkGoingToPlace = function(req, res) {
        var placeId =  req.params.pollId;

        //TODO find place and update attendant counts
    };



    this.userDetails = function(req, res) {
        var session = req.session;
        var userDetails = {
            name: undefined,
            isLogged: false
        };
        if (session.hasOwnProperty('userData')) {
            userDetails.isLogged = true;
            userDetails.name = session.userData.name;
            userDetails.username = session.userData.userName;
        }
        return res.json(userDetails);

    };

    var twitterConsumerKey = process.env.TWITTER_CONSUMER_KEY;
    var twitterConsumerSecret = process.env.TWITTER_CONSUMER_SECRET;
    var twitterOAuth = new OAuth.OAuth(
        'https://api.twitter.com/oauth/request_token',
        'https://api.twitter.com/oauth/access_token',
        twitterConsumerKey,
        twitterConsumerSecret,
        '1.0A',
        process.env.APP_URL + '/api/twitter/callback',
        'HMAC-SHA1'
    );


    this.twitterRequestLogin = function (req, res) {
        twitterOAuth.getOAuthRequestToken(function(err, oauth_token, oauth_token_secret){
            req.session.oauth_token_secret = oauth_token_secret;
            res.json({'location': 'https://api.twitter.com/oauth/authenticate?oauth_token=' + oauth_token});
        });
    };

    this.twitterCallback = function(req, res) {
        var urlParams = req.url.substring(req.url.indexOf('?') + 1);
        var urlComponents = qs.parse(urlParams);
        var oauth_token = urlComponents.oauth_token;
        var oauth_verifier = urlComponents.oauth_verifier;

        var getOAuthRequestTokenCallback = function (err, oAuthAccessToken,
                                                     oAuthAccessTokenSecret) {
            if (err) {
                console.log(err);
                return res.status(500).json(err);
            }

            twitterOAuth.get('https://api.twitter.com/1.1/account/verify_credentials.json',
                oAuthAccessToken,
                oAuthAccessTokenSecret,
                function (err, twitterResponseData) {
                    if (err) {
                        console.log(err);
                        return res.status(500).json(err);
                    }

                    var parsedData = JSON.parse(twitterResponseData);
                    req.session.userData = {name: parsedData.name, userName: parsedData.screen_name};

                    return res.redirect('/');
                });
        };

        twitterOAuth.getOAuthAccessToken(oauth_token, req.session.oauth_token_secret, oauth_verifier,
            getOAuthRequestTokenCallback);

    };

    this.doLogout = function(req, res) {
        req.session.destroy();
        return res.json({status: 'ok'});
    };
}

module.exports = ApiService;