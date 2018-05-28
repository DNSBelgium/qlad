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
  active: true, // start with nav active
  enabled: true, // start with nav disabled
  responsive: 'multiple',
  items: [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/traffic', label: 'Traffic' },
    { path: '/anomalies', label: 'Anomalies' },
    { path: '/queries', label: 'Queries' },
    { path: '/settings', label: 'Settings' }
  ]
};

export const reducer = (state = initialState, action) => {
	switch (action.type) {

    case actionTypes.ACTIVATE:
      return {
        ...state,
        active: action.active,
        activateOnMultiple: undefined
      };

    case actionTypes.ENABLE:
      return {
        ...state,
        enabled: action.enabled
      };

    case actionTypes.RESPONSIVE:
      const result = {
        ...state,
        responsive: action.responsive
      };
      if (action.responsive === 'single' && state.active) {
        result.active = false;
        result.activateOnMultiple = true;
      } else if (action.responsive === 'multiple' && state.activateOnMultiple) {
        result.active = true;
      }
      return result;

    default:
      return state;

  }
};
