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

var DNSStat = require('../models/DNSStat.js');


Object.defineProperty(Array.prototype, 'group', {
  enumerable: false,
  value: function (key) {
    let map = {};
    this.map(e => ({k: key(e), d: e})).forEach(e => {
      map[e.k] = map[e.k] || [];
      map[e.k].push(e.d);
    });
    return Object.keys(map).map(k => ({key: k, data: map[k]}));
  }
});

/* GET /dnsstats listing. */
router.get('/', function(req, res, next) {
  let filters = {};
  if (req.query.ts) {
    filters['start'] = { $lte: req.query.ts };
    filters['end'] = { $gte: req.query.ts };
  }
  if (req.query.from) {
    filters['start'] = { $gte: req.query.from };
  }
  if (req.query.to) {
    filters['end'] = { $lte: req.query.to };
  }
  if (req.query.server) {
    filters['server'] = req.query.server;
  }
  DNSStat.find(filters, function (err, stats) {
    if (err) return next(err);
    res.json(stats);
  });
});

/* GET /dnsstats/name */
router.get('/:name', function(req, res, next) {
  if (req.query.ts) {
    DNSStat.find({  'name': req.params.name, 'start': req.query.ts }, function (err, post) {
      if (err) return next(err);
      res.json(post);
    });
  } else {
    DNSStat.find({ 'name': req.params.name }, function (err, post) {
      if (err) return next(err);
      res.json(post);
    });
  }
});

module.exports = router;
