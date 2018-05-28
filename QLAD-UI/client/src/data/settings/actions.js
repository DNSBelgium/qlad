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


export const loadSettingsSuccess = (result) => ({
  type: actionTypes.LOAD_SUCCESS,
  result: result
});

export const loadSettingsFailure = (error) => ({
  type: actionTypes.LOAD_FAILURE,
  error: error
});

export const loadSettings = () =>
  (dispatch) => {
    dispatch({ type: actionTypes.LOAD });
    return api.watchSettings()
      .on('success', response => dispatch(loadSettingsSuccess(response)))
      .on('error', err => dispatch(loadSettingsFailure(err)))
      .start();
  }

export const unloadSettings = () => {
  api.unwatchSettings();
  return { type: actionTypes.UNLOAD };
};


export const updateWhitelist = (whitelist) =>
  (dispatch) => {
    return api.updateWhitelist(whitelist)
      .then( res => dispatch({ type: actionTypes.UPDATE_WHITELIST, error: null }) )
      .catch( err => dispatch({ type: actionTypes.UPDATE_WHITELIST, error: err }) )
  }
