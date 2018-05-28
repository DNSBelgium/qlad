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
  state: 'initial',
  settings: {
  }
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.LOAD:
      return {
        ...state,
        state: 'loading',
        settings: initialState.settings
      };
    case actionTypes.UNLOAD:
      return {
        ...state,
        error: null,
        state: 'initial',
        settings: undefined,
      };
    case actionTypes.LOAD_SUCCESS:
      return {
        ...state,
        error: null,
        state: 'loaded',
        settings: action.result
      };
    case actionTypes.LOAD_FAILURE:
      return {
        ...state,
        error: action.error
      };
    case actionTypes.UPDATE_WHITELIST:
      return {
        ...state,
        error: action.error
      };
    default:
        return state;
  }
};

