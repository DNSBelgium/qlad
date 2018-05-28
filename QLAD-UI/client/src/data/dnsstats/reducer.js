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

import * as actionTypes from './actionTypes';
import moment from 'moment';
import { SERVERS } from 'constants'; 

const initialState = {
  status: 'initial',
  timeRange: {
    label: 'Last 24h',
    from: moment().subtract(1, 'days').unix(),
    to: moment().unix()
  },
  server: SERVERS[0],
  stats: undefined,
  error: null
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.LOAD:
      return {
        ...state,
        status: 'loading',
        error: null,
        stats: initialState.stats 
      };
    case actionTypes.UNLOAD:
      return {
        ...state,
        error: null,
        status: 'initial',
        stats: initialState.stats
      };
    case actionTypes.LOAD_SUCCESS:
      return {
        ...state,
        error: null,
        status: 'loaded',
        stats: action.result
      };
    case actionTypes.LOAD_FAILURE:
      return {
        ...state,
        status: 'failed',
        error: action.error
      };
    case actionTypes.CHANGE_TIME_RANGE:
      return {
        ...state,
        error: null,
        status: 'loading',
        timeRange: action.range
      };
    case actionTypes.SET_SERVER:
      return {
        ...state,
        error: null,
        status: 'loading',
        server: action.server
      };
    default:
      return state;
  }
};
