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

var WhitelistItem = require('../models/WhitelistItem.js');

/* GET / listing. */
router.get('/', function(req, res, next) {
  WhitelistItem.find(function (err, items) {
    if (err) return next(err);
    res.json({whitelist: items});
  });
});

router.post('/whitelist', function(req, res, next) {
  WhitelistItem.collection.drop(function() {
    WhitelistItem.insertMany(req.body.whitelist)
    .then(function() {
      res.sendStatus(200)
    })
    .catch(function(err) {
      next(err);
    });
  });
});


module.exports = router;
