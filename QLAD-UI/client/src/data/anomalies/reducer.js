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

const initialState = {
  config: undefined,
  responsive: 'multiple',
  result: undefined,
  selection: undefined
  // filter
  // query
  // sort
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.LOAD:
      return {
        ...state,
        config: action.config,
        filter: action.filter,
        query: action.query,
        result: undefined,
        sort: action.sort,
        disable_whitelist: action.whitelist,
        from: action.from,
        to: action.to
      };
    case actionTypes.UNLOAD:
      return {
        ...state,
        result: undefined
      };
    case actionTypes.QUERY:
      return {
        ...state,
        query: action.query
      };
    case actionTypes.FILTER:
      return {
        ...state,
        filter: action.filter
      };
    case actionTypes.SORT:
      return {
        ...state,
        sort: action.sort
      };
    case actionTypes.FILTER_TIME_RANGE:
      return {
        ...state,
        from: action.from,
        to: action.to
      };
    case actionTypes.DISABLE_WHITELIST:
      return {
        ...state,
        disable_whitelist: action.disable_whitelist
      };
    case actionTypes.LOAD_SUCCESS:
      return {
        ...state,
        error: undefined,
        result: convertTimestamps(action.result)
      };
    case actionTypes.LOAD_FAILURE:
      return {
        ...state,
        error: action.error
      };
    case actionTypes.SELECT_LOAD:
      return {
        ...state,
        error: undefined,
        selection: {loading: true}
    };
    case actionTypes.SELECT:
      return {
        ...state,
        error: action.error,
        selection: {
          anomalies: action.selection.anomalies,
          info: action.selection.info,
          loading: false
        }
      };
    case actionTypes.DESELECT:
      return {
        ...state,
        selection: undefined
      };
    default:
      return state;
  }
};

function convertTimestamps(result) {
  // convert epoch timestamps to Date objects
  let items = result.results.map((item) => ({
    ...item, most_recent: new Date(item.most_recent * 1000)
  }));
  return { ...result, items: items, count: items.length };
}
