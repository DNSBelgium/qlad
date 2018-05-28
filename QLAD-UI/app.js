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

#!/usr/bin/env node
var express = require('express');
var mongoose = require('mongoose');
var kue = require('kue');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var auth = require("./middleware/auth.js")();

var cfg = require("./config");

var index = require('./routes/index');
var users = require('./routes/users');
var dnsstats = require('./routes/dnsstats');
var anomalies = require('./routes/anomalies');
var impalaQuery = require('./routes/impala_query');
var settings = require('./routes/settings');

// Use native Node promises
mongoose.Promise = global.Promise;
// connect to MongoDB
mongoose.connect(`mongodb://${cfg.mongo.host}/${cfg.mongo.db}`)
  .then(() =>  console.log('Connection to MongoDB succesful'))
  .catch(err => console.error(err));

var app = express();
app.set('port', process.env.PORT || 3001);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Express only serves static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
}

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(auth.initialize());
app.use(express.static(path.join(__dirname, 'public')));

// auth.authenticate()
app.use('/', index);
app.use('/users', users);
app.use('/queue', kue.app);
app.use('/dnsstats', dnsstats);
app.use('/anomalies', anomalies);
app.use('/impala_query', impalaQuery);
app.use('/settings', settings);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(app.get('port'), () => {
  console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
});
