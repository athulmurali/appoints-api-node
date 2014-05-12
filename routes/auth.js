var jwt = require('jsonwebtoken');
var config = require('../config');
var passport = require('passport');

exports.loggedin = function(req, res) {
  sendLoggedInResponseForUser(req.user, res);
}

exports.facebooktoken = function(req, res) {
  // NOTE: this (ab)uses the passport strategy-specific userProfile method to check if a token is valid.
  var fbStrategy = passport._strategies.facebook;
  fbStrategy.userProfile(req.body.token, function(err, profile) {
    if (err) {
      return sendTokenValidationError(res, err);
    }
    var user = createUserFromProfile(profile);
    sendLoggedInResponseForUser(user, res);
  });
}

exports.googletoken = function(req, res) {
  // NOTE: this (ab)uses the passport strategy-specific userProfile method to check if a token is valid.
  var googleStrategy = passport._strategies.google;
  googleStrategy.userProfile(req.body.token, function(err, profile) {
    if (err) {
      return sendTokenValidationError(res, err);
    }
    var user = createUserFromProfile(profile);
    sendLoggedInResponseForUser(user, res);
  });
}

function sendLoggedInResponseForUser(user, res) {
  res.send({
    message: 'Authentication successful',
    token: createTokenForUser(user),
    _links: [{ self: { href: '/'} }, { me: { href: '/me' } }, { appointments: { href: '/appointments' } }]
  });
}

function sendTokenValidationError(res, err) {
  res.send('401', {
    message: 'Access denied (unable to authenticate)',
    details: err
  });
}

function createUserFromProfile(profile) {
  return {
    provider: profile.provider,
    userId: profile.id,
    email: profile.emails[0].value,
    displayName: profile.displayName
  };
}

function createTokenForUser(user) {
  var token = jwt.sign(user, config.settings.tokenSecret, { expiresInMinutes: 60*5 });
  return token;
}