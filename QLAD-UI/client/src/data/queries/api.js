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

import { fetchApi, watchApi, unwatchApi } from 'services/api';
import { headers } from 'services/api/util';

export function executeQuery(sql) {
  const options = {
    headers: headers(),
    method: 'POST',
    body: JSON.stringify({
      sql: sql.replace(/(\u0060|\r\n|\n|\r|\t| +(?= ))/gm,"")
    })
  };
  return fetch('/impala_query/submit', options)
    .then(function(response) {
      if (response.ok) {
        return response.headers.get('Location');
      }
      return Promise.reject(response);
    });
}


export function watchQueryStatus(url) {
  return watchApi(url, 1000);
}

export function unwatchQueryStatus(url) {
  return unwatchApi(url);
}

export function getSavedQueries() {
  return fetchApi('/impala_query');
}

export function saveQuery(query) {
  return fetchApi('/impala_query/save', query, 'post');
}

export function updateSavedQuery(id, query) {
  return fetchApi(`/impala_query/${id}`, query, 'put');
}

export function deleteSavedQuery(id) {
  return fetchApi(`/impala_query/${id}`, {}, 'delete');
}
