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
import * as whois from 'services/whois';
import * as actionTypes from './actionTypes';

const pageSize = 20;

function buildParams(config, query, filter, sort, from, to, disable_whitelist) {
  let result = {
    category: config.category,
    count: pageSize //number of results to return
  };
  if (query || config.query) {
    const queryString = (query ? query.toString() : undefined);
    const configQueryString = (
      config.query ? config.query.toString() : undefined
    );
    if (queryString && configQueryString) {
      result.query = `${queryString} AND ${configQueryString}`;
    } else if (queryString) {
      result.query = queryString;
    } else if (configQueryString) {
      result.query = configQueryString;
    }
  }
  if (filter || config.filter) {
    const useFilter = (filter || config.filter);
    result.filter = [];
    for (let name in useFilter) {
      result.filter.push(`${name}:${useFilter[name]}`);
    }
  }
  if (sort || config.sort) {
    result.sort = sort || config.sort;
  }
  if (from || config.from) {
    result.from = from || config.from;
  }
  if (to || config.to) {
    result.to = to || config.to;
  }
  if (disable_whitelist || config.disable_whitelist) {
    result.disable_whitelist = disable_whitelist || config.disable_whitelist;
  }
  return result;
}

export const loadAnomaliesSuccess = (result) => ({
  type: actionTypes.LOAD_SUCCESS,
  result: result
});

export const loadAnomaliesFailure = (error) => ({
  type: actionTypes.LOAD_FAILURE,
  error: error
});

export const loadAnomalies = (config) =>
  (dispatch) => {
    let params = buildParams(config);
    dispatch({ type: actionTypes.LOAD, config: config,
      query: config.query, filter: config.filter, 
      sort: config.sort, disable_whitelist: config.disable_whitelist });
    return api.watchAnomalies(params)
      .on('success', response => dispatch(loadAnomaliesSuccess(response)))
      .on('error', err => dispatch(loadAnomaliesFailure(err)))
      .start();
  }

export const unloadAnomalies = () => {
  api.unwatchAnomalies();
  return { type: actionTypes.UNLOAD };
};

export const filterAnomalies = (state, filter) =>
  (dispatch) => {
    dispatch({ type: actionTypes.FILTER, filter: filter });
    const params = buildParams(state.config, state.query, filter, state.sort, state.from, state.to, state.disable_whitelist);
    return api.watchAnomalies(params)
      .on('success', response => dispatch(loadAnomaliesSuccess(response)))
      .on('error', err => dispatch(loadAnomaliesFailure(err)))
      .start();
  };

export const sortAnomalies = (state, sort) =>
  (dispatch) => {
    dispatch({ type: actionTypes.SORT, sort: sort });
    const params = buildParams(state.config, state.query, state.filter, sort, state.from, state.to, state.disable_whitelist);
    return api.watchAnomalies(params)
      .on('success', response => dispatch(loadAnomaliesSuccess(response)))
      .on('error', err => dispatch(loadAnomaliesFailure(err)))
      .start();
  };


export const disableWhitelist = (state, disable) =>
  (dispatch) => {
    dispatch({ type: actionTypes.DISABLE_WHITELIST, disable_whitelist: disable });
    const params = buildParams(state.config, state.query, state.filter, state.sort, state.from, state.to, disable);
    return api.watchAnomalies(params)
      .on('success', response => dispatch(loadAnomaliesSuccess(response)))
      .on('error', err => dispatch(loadAnomaliesFailure(err)))
      .start();
  };


export const filterTimeRange = (state, range) =>
  (dispatch) => {
    dispatch({ type: actionTypes.FILTER_TIME_RANGE, from: range.from, to: range.to });
    const params = buildParams(state.config, state.query, state.filter, state.sort, range.from, range.to, state.whitelist);
    return api.watchAnomalies(params)
      .on('success', response => dispatch(loadAnomaliesSuccess(response)))
      .on('error', err => dispatch(loadAnomaliesFailure(err)))
      .start();
  };

export const queryAnomalies = (state, query) =>
  (dispatch) => {
    dispatch({ type: actionTypes.QUERY, query: query });
    const params = buildParams(state.config, query, state.filter, state.sort, state.from, state.to, state.disable_whitelist);
    return api.watchAnomalies(params)
      .on('success', response => dispatch(loadAnomaliesSuccess(response)))
      .on('error', err => dispatch(loadAnomaliesFailure(err)))
      .start();
  };

export const moreAnomalies = (state) =>
  (dispatch) => {
    dispatch({ type: actionTypes.MORE });
    let params = buildParams(state.config, state.query, state.filter, state.sort, state.from, state.to, state.disable_whitelist);
    params = { ...params, ...{ count: (state.result.count + pageSize) } };
    return api.watchAnomalies(params)
      .on('success', response => dispatch(loadAnomaliesSuccess(response)))
      .on('error', err => dispatch(loadAnomaliesFailure(err)))
      .start();
  };

export const selectAnomaly = (subject, type) =>
  (dispatch) => {
    dispatch({ type: actionTypes.SELECT_LOAD });
    if (type === "Resolver")
      return Promise.all([
          api.getAnomaly(subject),
          whois.getResolverInfo(subject)
        ])
        .then(([anomalies, info]) => {
          dispatch({ type: actionTypes.SELECT, selection: {anomalies: anomalies, info: info} });
        })
        .catch(err => dispatch({ type: actionTypes.SELECT, error: err }));
    else
      return api.getAnomaly(subject)
        .then(anomalies => {
          dispatch({ type: actionTypes.SELECT, selection: {anomalies: anomalies} });
        })
        .catch(err => dispatch({ type: actionTypes.SELECT, error: err }));
  }

export const deselectAnomaly = () => ({
  type: actionTypes.DESELECT
});
