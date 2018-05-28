/*
 * QLAD - An anomaly detection system for DNS traffic
 * Copyright (C) 2017 DNS Belgium
 *
 * This file is part of QLAD.
 *
 * QLAD is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * QLAD is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with QLAD.  If not, see <http://www.gnu.org/licenses/>.
 */

var express = require('express');
var router = express.Router();

var User = require('../models/User.js');
var cfg = require("../config"); 
var jwt = require("jwt-simple");
var crypto = require('crypto');

var expires = 86400; //24h in s

/* GET create dummy user. */
router.get('/setup', function(req, res) {
  // create a default user
  var admin = new User({
    name: 'admin',
    password: 'password'
  });
  // save the default user
  admin.save(function(err) {
    if (err) throw err;
    console.log('Admin user created successfully.');
    res.json({ success: true });
  });
});

/* GET all users. */
router.get('/', function(req, res) {
  User.find({}, function(err, users) {
    res.json(users);
  });
});

/* POST authenticate. */
router.post('/auth', function(req, res) {

  // find the user
  User.findOne({ name: req.body.name }, function(err, user) {
    if (err) throw err;
    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {

      // check if password matches
      if (user.password != req.body.password) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {

        // if user is found and password is right, create a token
        var token = jwt.encode({
          id: user._id,
          exp: expires
        }, cfg.jwtSecret);

        // create a refresh token
        user.refreshToken = user._id.toString() + '.' + crypto.randomBytes(40).toString('hex');
        user.save(function(err) {
          if (err) 
            res.json({ success: false, message: 'Authentication failed. Could not create refresh token.' });
          else
            res.json({
              success: true,
              message: 'Enjoy your token!',
              user: {
                id: user._id,
                name: user.name
              },
              tokens: [
                { type: 'access', value: token, expiresIn: expires },
                { type: 'refresh', value: user.refreshToken }
              ]
            });
        });

      }
    }
  });
});


/* POST revoke token. */
router.post('/auth/revoke', function(req, res) {

  // find the user
  User.findOne({ refreshToken: req.body.refreshToken }, function(err, user) {
    if (err) throw err;
    if (!user) {
      res.json({ success: false, message: 'Token revoke failed. User not found.' });
    } else if (user) {
        // if user is found, remove the refresh token 
        user.refreshToken = undefined;
        user.save(function(err) {
          if (err) 
            res.json({ success: false, message: 'Token revoke failed. Could not remove refresh token.' });
          else
            res.json({
              success: true,
              message: 'Your token is gone!',
            });
        });
    }
  });
});

/* POST refresh token. */
router.post('/auth/refresh', function(req, res) {

  // find the user
  User.findById(req.body.user, function(err, user) {
    if (err) throw err;
    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {

      // check if refresh token matches
      if (user.refreshToken != req.body.refreshToken) {
        res.json({ success: false, message: 'Authentication failed. Wrong refresh token.' });
      } else {

        // if user is found and refresh token is right, create a new token
        var token = jwt.encode({
          id: user._id,
          exp: expires
        }, cfg.jwtSecret);

        // return the information including token as JSON
        res.json({
          success: true,
          message: 'Enjoy your token!',
          user: {
            id: user._id,
            name: user.name
          },
          tokens: [
            { type: 'access', value: token, expiresIn: expires },
            { type: 'refresh', value: user.refreshToken }
          ]
        });
      }

    }

  });
});

module.exports = router;
