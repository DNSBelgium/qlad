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
var WhitelistItem = require('../models/WhitelistItem.js');
var Anomaly = require('../models/Anomaly.js');

/* GET /anomalies listing. */
router.get('/', function(req, res, next) {
  // fetch the whitelist
  WhitelistItem.find({}, function(err, whitelist) {
    if (err) return next(err);
    Anomaly.aggregate(buildAnomalyQuery(req, whitelist), function (err, result) {
      if (err) {
        return next(err);
      } else {
        if (result.length > 0)
          res.json(result[0]);
        else
          res.json({ total: 0, results: [] });
      }
    });
  });
});

function buildAnomalyQuery(req, whitelist) {
  let aggregations = [];

  // query for a subject's name
  if (req.query.query) {
    let query = {
      $match: {
        $or: [
          {subject: {$regex: new RegExp(req.query.query, "ig")}},
          {asn: {$regex: new RegExp(req.query.query, "ig")}}
        ]
      }
    };
    aggregations.push(query);
  }

  // filter on specific field values
  if (req.query.filter) {
    let filterparams = req.query.filter;
    if(!(filterparams instanceof Array)){
       filterparams = [filterparams];
    }
    let filters = {
      $match: { $and:
        filterparams.map(function(filter) {
          var fields = filter.split(':');
          var filterKey = fields[0];
          var filterValue = fields[1];
          return {[filterKey]: filterValue};
        })
      }
    }
    aggregations.push(filters);
  }

  // filter on a time period
  if (req.query.from) {
    aggregations.push({
      $match: {
        start: {$gte: parseInt(req.query.from, 10)}
      }
    });
  }
  if (req.query.to) {
    aggregations.push({
      $match: {
        end: {$lte: parseInt(req.query.to, 10)}
      }
    });
  }


  // group by subject, type and label
  aggregations.push(
      {
        $group: {
          _id: {
            "subject": "$subject",
            "asn": "$asn",
            "type": "$type",
            "label": "$label"
          },
          most_recent: {$max: '$end'},
          count: {$sum: 1}
        }
      },
      {
        $project : {
          _id : 0 ,
          subject : "$_id.subject",
          asn : "$_id.asn",
          type : "$_id.type",
          label : "$_id.label",
          most_recent: 1,
          count: 1
        }
      }
  );

  // sort on specific field values
  if (req.query.sort) {
    let sortparams = req.query.sort;
    if(!(sortparams instanceof Array)){
       sortparams = [sortparams];
    }
    let sort = {
      $sort: sortparams.reduce(function(result, item) {
        var fields = item.split(':');
        var sortkey = fields[0];
        var sortdir = fields[1] === 'asc' ? 1 : -1;
        result[sortkey] = sortdir;
        return result;
      }, {})
    }
    aggregations.push(sort);
  }

  // ignore whitelisted items
  if (!req.query.disable_whitelist) {
    for (let i = 0, len = whitelist.length; i < len; i++) {
      aggregations.push(
        {
          $match: { 
            $and: [
              { subject: { $not: new RegExp(whitelist[i].filter) } },
              { asn: { $not: new RegExp(whitelist[i].filter) } },
            ]
          }
        }
      );
    }
  }

  // count the total number of results
  aggregations.push(
      {
        $group: {
          _id: null,
          total: {$sum: 1},
          results: {$push: '$$ROOT'}
        }
      }
  );

  // limit the number of results returned
  if (req.query.count) {
    aggregations.push(
        {
          $project: {
            total: 1,
            results: {
              $slice : ['$results', parseInt(req.query.count)]
            }
          }
        }
    );
  }

  return aggregations;
}

router.get('/count', function(req, res, next) {
  const fromTs = req.query.from || 0;
  const toTs = req.query.to || new Date().getTime() / 1000;
  const timespan = toTs - fromTs;
  const aggregations = [];

 aggregations.push({
    $match: {
      start: {$gt: fromTs, $lt: toTs}
    }
  });

  aggregations.push({
    "$project":{ 
      "_id": 0,
      "y": {
        "$year": {
          "$add": [
            new Date(0),
            { "$multiply": [1000, "$start"] }
          ]
        }
      },
      "m": {
        "$month": {
          "$add": [
            new Date(0),
            { "$multiply": [1000, "$start"] }
          ]
        }
      }, 
      "d": {
        "$dayOfMonth": {
          "$add": [
            new Date(0),
            { "$multiply": [1000, "$start"] }
          ]
        }
      },
      "h": {
        "$hour": {
          "$add": [
            new Date(0),
            { "$multiply": [1000, "$start"] }
          ]
        }
      }
    } 
  });

  // if timespan < 1 hour, then don't group
  if (timespan > 3600) {
    // if timespan < 1 day, then group by hour
    if (timespan <= 86400) {
      aggregations.push({ 
        "$group": {
          _id : {
            year : "$y",
            month : "$m",
            day : "$d",
            hour : "$h"
          },
          count : {
            $sum : 1
          }
        }
      });
      // if timespan < 1 month, then group by day
    } else if (timespan <= 2629744) {
      aggregations.push({ 
        "$group": {
          _id : {
            year : "$y",
            month : "$m",
            day: "$d"
          },
          count : {
            $sum : 1
          }
        }
      });
      // default: group by month, limited to 1 year
    } else {
      aggregations.push({ 
        "$group": {
          _id : {
            year : "$y",
            month : "$m"
          },
          count : {
            $sum : 1
          }
        }
      });
    }
  }

  Anomaly.aggregate(aggregations, function (err, result) {
    if (err) {
      return next(err);
    } else {
      res.json(result[0]);
    }
  });

});

/* POST /anomalies */
router.post('/', function(req, res, next) {
  Anomaly.create(req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* GET /anomalies/id */
router.get('/:id', function(req, res, next) {
  Anomaly.findById(req.params.id, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* GET /anomalies/all/subject */
router.get('/all/:subject', function(req, res, next) {
  var filters = {};
  filters['subject'] = req.params.subject;
  if (req.query.start && req.query.end)
    filters['start'] = { "$gte": req.query.start, "$lt": req.query.end };

  Anomaly.find(filters, null, {sort: {start: -1}}, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* PUT /anomalies/:id */
router.put('/:id', function(req, res, next) {
  Anomaly.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* DELETE /anomalies/:id */
router.delete('/:id', function(req, res, next) {
  Anomaly.findByIdAndRemove(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

module.exports = router;
