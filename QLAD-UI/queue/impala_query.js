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

const impala = require('../impala.js');

let redisConfig;
if (process.env.NODE_ENV === 'production') {
  redisConfig = {
    redis: {
      port: process.env.REDIS_PORT,
      host: process.env.REDIS_HOST,
      auth: process.env.REDIS_PASS
    }
  };
} else {
  redisConfig = {};
}

const queue = require('kue').createQueue(redisConfig);

queue.watchStuckJobs(6000);

queue.on('ready', () => {
  console.info('Queue is ready!');
});

queue.on('error', (err) => {
  console.error('There was an error in the main queue!');
  console.error(err);
  console.error(err.stack);
});

function submitQuery(data, callback) {
  var job = queue.create('impala_query', data)
    .removeOnComplete(false)
    .save( function(err) {
      callback(err, job);
    });
}

// Process up to 5 jobs concurrently
queue.process('impala_query', 5, function(job, done) {
  console.log("Submitted a query: " + job.data.sql);
  impala.query(job.data.sql)
    .then(result => done(null, result))
    .catch(err => done(err));
});

module.exports = {
  submit: (data, done) => {
    submitQuery(data, done);
  }
};
