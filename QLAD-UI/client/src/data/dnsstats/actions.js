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


export const loadDNSstatsSuccess = (result) => ({
  type: actionTypes.LOAD_SUCCESS,
  result: result
});

export const loadDNSstatsFailure = (error) => ({
  type: actionTypes.LOAD_FAILURE,
  error: error
});

export const loadDNSstats = (timeRange, server) =>
  (dispatch) => {
    dispatch({ type: actionTypes.LOAD });
    return api.watchDNSstats({ ...timeRange, server: server })
      .on('success', response => dispatch(loadDNSstatsSuccess(response)))
      .on('error', err => dispatch(loadDNSstatsFailure(err)))
      .start();
  }

export const getDNSstats = (timeRange, server) =>
  (dispatch) => {
    dispatch({ type: actionTypes.LOAD });
    return api.getDNSstats({ ...timeRange, server: server })
      .then(response => dispatch(loadDNSstatsSuccess(response)))
      .catch(err => dispatch(loadDNSstatsFailure(err)));
  }

export const changeTimeRange = (state, label, from, to) =>
  (dispatch) => {
    let timeRange = { label: label, from: from, to: to};
    dispatch({ type: actionTypes.CHANGE_TIME_RANGE, range: timeRange });
    return api.watchDNSstats({ ...timeRange, server: state.server.value })
      .on('success', response => dispatch(loadDNSstatsSuccess(response)))
      .on('error', err => dispatch(loadDNSstatsFailure(err)))
      .start();
  };

export const setServer = (state, server) =>
  (dispatch) => {
    dispatch({ type: actionTypes.SET_SERVER, server: server });
    return api.watchDNSstats({ ...state.timeRange, server: server.value })
      .on('success', response => dispatch(loadDNSstatsSuccess(response)))
      .on('error', err => dispatch(loadDNSstatsFailure(err)))
      .start();
  };

export const unloadDNSstats = () => {
  api.unwatchDNSstats();
  return { type: actionTypes.UNLOAD };
};

