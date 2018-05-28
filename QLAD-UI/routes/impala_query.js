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
var queue = require('../queue/impala_query');
var Query = require('../models/Query.js');

/* GET / List saved queries. */
router.get('/', function(req, res, next) {
  Query.find({}, function (err, queries) {
    if (err) return next(err);
    res.json(queries);
  });
});

/* PUT /:id Update a query its result. */
router.put('/:id', function(req, res, next) {
  Query.findById(req.params.id, function(err, query) {
    if (err) return next(err);

    // Update the existing query
    if (req.body.name)
      query.name = req.body.name;
    if (req.body.sql)
      query.sql = req.body.sql;

    query.save(function(err) {
      if (err) return next(err);
      res.json(query);
    });
  });
});

/* DELETE /:id Delete a query. */
router.delete('/:id', function(req, res, next) {
  Query.findByIdAndRemove(req.params.id, function(err) {
    if (err) return next(err);
    res.json({ message: 'Query successfully removed.' });
  });
});

/* POST /save Save a query. */
router.post('/save', function(req, res, next) {
  var query = new Query({
    name: req.body.name,
    sql: req.body.sql,
    result: req.body.result
  })
  query.save(function (err) {
    if (err) { return next(err) }
    res.json({ message: 'Query successfully saved.' });
  })
});

/* POST /submit Submit a query for execution. */
router.post('/submit', function(req, res, next) {
  queue.submit({ sql: req.body.sql }, function(err, job) {
    if (err) return next(err);
    res.location('/queue/job/' + job.id);
    res.end();
  });
});


module.exports = router;
