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

import fetchival from 'fetchival';
import RequestWatcher from './request-watcher';
import { headers } from './util'

export const exceptionExtractError = (exception) => {
  if (!exception.message) return false;
  return exception.message;
};

export const fetchApi = (endPoint, payload = {}, method = 'get', add_headers = {}) => {
  return fetchival(`${endPoint}`, {
    headers: headers()
  })[method.toLowerCase()](payload)
  .catch((e) => {
    if (e.response && e.response.json) {
      e.response.json().then((json) => {
        if (json) throw json;
        throw e;
      });
    } else {
      throw e;
    }
  });
};

const requestWatcher = new RequestWatcher();
let statusWatchers = new Map();

export function watchApi(url, pollTimeout) {
  unwatchApi(url);
  var statusWatcher = requestWatcher.watch(url, pollTimeout);
  statusWatchers.set(url, statusWatcher);
  return statusWatcher;
}

export function unwatchApi(url) {
  if (statusWatchers.has(url)) {
    var statusWatcher = statusWatchers.get(url);
    if (statusWatcher) {
      statusWatcher.stop();
      statusWatchers.delete(url);
    }
  }
}
