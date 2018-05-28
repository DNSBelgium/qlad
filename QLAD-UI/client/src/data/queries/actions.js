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

import * as api from './api';
import * as actionTypes from './actionTypes';
import moment from 'moment';


/*
 * Submitting a query for execution.
 */

export const processQuerySuccess = (id, data) => ({
  type: actionTypes.FINISHED,
  id: id,
  result: data
});

export const processQueryFailure = (id, error) => ({
  type: actionTypes.FINISHED,
  id: id,
  error: error
});

export const submitQuery = (query, paginate = false, page = 0) =>
  (dispatch) => {
    // verify query object
    if (! query.id)
      query["id"] = new Date().getTime() + "";
    if (! query.sql)
      return dispatch({ type: actionTypes.SUBMIT, error: new Error("Invalid query")});
    if (! query.state) {
      query['state'] = 'INITIAL';
      dispatch({ type: actionTypes.SUBMIT, query: query });
    }
    // pagination (Beeswax can't return more than 1024 results)
    let sql = query.sql;
    if (paginate) {
      if (! new RegExp('ORDER', 'i').test(sql)
        && ! new RegExp('LIMIT', 'i').test(sql)) {
        sql += " ORDER BY fnv_hash(id), id";
      }
      if (! new RegExp('LIMIT', 'i').test(sql)) {
        sql += " LIMIT 1024";
        sql += ` OFFSET ${1024*page}`;
      } else {
        let limit = parseInt(sql.match(/LIMIT (\d+)/i)[1], 10);
        if (limit > 1024) {
          sql = sql.replace(/LIMIT (\d+)/i, "");
          sql += " ORDER BY fnv_hash(id), id";
          sql += ` LIMIT ${Math.min(limit - 1024*page, 1024)}`;
          sql += ` OFFSET ${1024*page} `;
        }
      }
    }
    // execute the query
    return api.executeQuery(sql)
      .then( function(status_url) {
        dispatch({ type: actionTypes.PROCESSING, id: query.id, url: status_url });
        dispatch(waitForData(query, paginate, page, status_url));
      })
      .catch(error => dispatch({
        type: actionTypes.SUBMIT,
        error: new Error("Could not submit the query")
      }))
  };


export const cancelQuery = (query) =>
  (dispatch) => {
    api.unwatchQueryStatus(query.status_url);
    dispatch({ type: actionTypes.CANCEL, id: query.id });
  };


function waitForData(query, paginate, page, status_url) {
  return function(dispatch) {
    return api.watchQueryStatus(status_url)
      .on('success', function(data) {
        if (data['state'] === 'complete') {
          if ('result' in data) {
            // data is ready
            dispatch(processQuerySuccess(query.id, data['result']));
            api.unwatchQueryStatus(status_url);
            if (paginate && data['result'].length === 1024)
              dispatch(submitQuery(query, true, page+1));
          } else {
            // something unexpected happened
            dispatch(processQueryFailure(query.id, new Error("No data found.")))
            api.unwatchQueryStatus(status_url);
          }
        } else if(data['state'] === 'failed') {
          dispatch(processQueryFailure(query.id, new Error(data['error'])))
          api.unwatchQueryStatus(status_url);
        }
      })
      .on('error', error => dispatch(processQueryFailure(query.id, error)))
      .start()
  };
}

/*
 * Filter data
 */
export const addFilter = (id, key, value) => ({
    type: actionTypes.ADD_FILTER,
    id,
    key,
    value
});

export const deleteFilter = (id, key) => ({
    type: actionTypes.DEL_FILTER,
    id,
    key
});

/*
 * Shortcuts for anomalies
 */

export const loadAnomalyData = (anomaly) =>
  (dispatch) => {
    var startDate = moment.unix(anomaly.start).utc();
    var endDate = moment.unix(anomaly.end).utc();

    let archiveTime = moment().utc().hour(0).minute(0).second(0);

    let table = (endDate.isBefore(archiveTime) ? 'dns.queries' : 'dns.staging');
    let sql;
    switch(anomaly.type) {
      case "Resolver":
        sql = ` SELECT *
        FROM ${table}
        WHERE src='${anomaly.subject}'
        AND unixtime >= ${startDate.unix()} and unixtime < ${endDate.unix()}
        AND (year = ${startDate.year()} OR year = ${endDate.year()})
        AND (month = ${startDate.month()+1} OR month = ${endDate.month()+1})
        AND (day = ${startDate.date()} OR day = ${endDate.date()})
        `
        break;
      case "Domain":
        sql = ` SELECT *
        FROM ${table}
        WHERE qname LIKE '%${anomaly.subject}'
        AND unixtime >= ${startDate.unix()} and unixtime < ${endDate.unix()}
        AND (year = ${startDate.year()} OR year = ${endDate.year()})
        AND (month = ${startDate.month()+1} OR month = ${endDate.month()+1})
        AND (day = ${startDate.date()} OR day = ${endDate.date()})
        `
        break;
      default:
        dispatch(processQueryFailure(new Error("Unknown anomaly type: " + anomaly.type)))
    }

    let query = {
      id: anomaly._id,
      sql: sql,
      info: anomaly
    };

    return dispatch(submitQuery(query, true));
  }


/*
 * Saving queries.
 */

export const loadSavedQueriesSuccess = (result) => ({
  type: actionTypes.LOAD_SUCCESS,
  result: result
});

export const loadSavedQueriesFailure = (error) => ({
  type: actionTypes.LOAD_FAILURE,
  error: error
});

export const getSavedQueries = () =>
  (dispatch) => {
    dispatch({ type: actionTypes.LOAD });
    return api.getSavedQueries()
      .then(response => dispatch(loadSavedQueriesSuccess(response)))
      .catch(err => dispatch(loadSavedQueriesFailure(err)));
  }

export const unloadSavedQueries = () => {
  return { type: actionTypes.UNLOAD };
};

export const saveQuery = (query) =>
  (dispatch) => {
    return api.saveQuery(query)
      .then(() => dispatch({ type: actionTypes.SAVE, result: query }))
      .catch(err => dispatch({ type: actionTypes.SAVE, error: err }));
  }

export const updateSavedQuery = (id, query) =>
  (dispatch) => {
    return api.updateSavedQuery(id, query)
      .then(() => dispatch({ type: actionTypes.UPDATE, result: query }))
      .catch(err => dispatch({ type: actionTypes.UPDATE, error: err }));
  }

export const deleteSavedQuery = (id) =>
  (dispatch) => {
    return api.deleteSavedQuery(id)
      .then(() => dispatch({ type: actionTypes.DELETE, id: id }))
      .catch(err => dispatch({ type: actionTypes.DELETE, error: err }));
  }
