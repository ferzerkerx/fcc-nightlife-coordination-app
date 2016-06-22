'use strict';

var path = process.cwd();
var PlaceAttendant = require(path + '/app/models/PlaceAttendant.js');
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
        null,
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

                var businesses = parsedData.businesses;
                var placesIds = businesses.map(function (e) {
                    return e.id;
                });

                PlaceAttendant
                    .aggregate(
                        {$match: {place_id: {$in: placesIds}}},
                        {$group : {
                            _id : "$place_id",
                            count: { $sum: 1 },
                            attendants: {$push : "$username"}
                        }}

                    )
                    .exec(
                        function (mongoErr, placeAttendant) {
                            if (mongoErr) {
                                console.log(mongoErr);
                                return res.status(500).json(mongoErr);

                            }

                            console.log('##' + JSON.stringify(placeAttendant));

                            var attendantsPerPlace = {};
                            placeAttendant.forEach(function (currentValue) {
                                attendantsPerPlace[currentValue._id] = currentValue.attendants;
                            });

                            console.log('attendantsPerPlace:' + JSON.stringify(attendantsPerPlace));


                            businesses.forEach(function (currentValue) {
                                var attendants = attendantsPerPlace[currentValue.id];
                                if (!attendants) {
                                    attendants = [];
                                }

                                currentValue.attendants = attendants;
                                currentValue.attendantsCount = attendants.length;

                                var session = req.session;
                                var currentUserIsGoing = false;
                                if (session.hasOwnProperty('userData')) {
                                    currentUserIsGoing = attendants.indexOf(session.userData.userName) >= 0;
                                }
                                currentValue.currentUserIsGoing = currentUserIsGoing;

                            });
                            res.json(businesses);
                    });
            });
    };



    //TODO validate this service is only invoked whenever a session is present
    this.markGoingToPlace = function (req, res) {

        var placeId =  req.params.placeId;
        var searchedLocation = req.body.location;

        var userData = req.session.userData;
        userData.location = searchedLocation;

        var placeAttendant = new PlaceAttendant({
            place_id: placeId,
            username: userData.userName
        });

        placeAttendant.save(function (err, placeAttendant) {
            if (err) {
                console.log(err);
                return res.status(500).json(err);
            }
            return res.json(placeAttendant);
        });
    };


    //TODO validate this service is only invoked whenever a session is present
    this.unmarkGoingToPlace = function(req, res) {
        var placeId =  req.params.placeId;

        PlaceAttendant.findOneAndRemove({ place_id: placeId, username: req.session.userData.userName}, function(err, placeAttendant) {

            if (err) {
                console.log(err);
                return res.status(500).json(err);
            }

            return res.json(placeAttendant);
        });
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
            userDetails.location = session.userData.location;
        }

        console.log('##userDetails' + JSON.stringify(userDetails));
        res.setHeader('Cache-Control', 'no-cache');
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