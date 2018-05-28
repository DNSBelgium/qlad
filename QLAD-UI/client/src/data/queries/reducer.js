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
  queries: [],
  saved_queries: [],
  saved_queries_status: 'INITIAL',
  activeTab: 0,
  error: null 
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {

    case actionTypes.SUBMIT:
      return (action.error) ?
        { ...state, error: action.error } : 
        { ...state, 
          // keep 10 queries max
          queries: state.queries.slice(Math.max(state.queries.length - 9, 0))
          .concat([{
            ...action.query,
            state: 'INITIAL',
            date: new Date(),
            result: [],
            filters: {}
          }]) 
        };

    case actionTypes.CANCEL:
      return (action.error) ?
        { ...state, error: action.error } :
        { ...state,
          queries: state.queries.map( query => (query.id === action.id) ?
            { ...query, state: 'CANCELLED' } :
            query
          )
        };

    case actionTypes.PROCESSING:
      return {
        ...state,
        queries: state.queries.map( query => (query.id === action.id) ?
          { ...query, state: 'PROCESSING', status_url: action.url } :
          query
        )
      };

    case actionTypes.FINISHED:
      return (action.error) ?
        { ...state,
          queries: state.queries.map( query => (query.id === action.id) ?
            { ...query, state: 'FAILED', error: action.error } : 
            query
          )
        } :
        { ...state,
          queries: state.queries.map( query => (query.id === action.id) ?
          { ...query, state: 'SUCCESS',
            result: query.result.concat(action.result)
          } :
          query
          )
        };

    case actionTypes.ADD_FILTER:
      var newFilter = {};
      newFilter[action.key] = action.value;
      return {
        ...state,
        queries: state.queries.map( query => (query.id === action.id) ?
          { ...query, filters: Object.assign({}, query.filters, newFilter) } :
          query
        )
      };

    case actionTypes.DEL_FILTER:
      return {
        ...state,
        queries: state.queries.map( query => (query.id === action.id) ?
          { ...query,
            filters: Object.keys(query.filters).reduce((result, key) => {
              if (key !== action.key) {
                result[key] = query.filters[key];
              }
              return result;
            }, {})
          } :
          query
        )
      };

    case actionTypes.LOAD:
      return {
        ...state,
        saved_queries_status: 'loading',
        saved_queries: initialState.saved_queries 
      };

    case actionTypes.UNLOAD:
      return {
        ...state,
        error: null,
        saved_queries_status: 'initial',
        saved_queries: initialState.saved_queries
      };

    case actionTypes.LOAD_SUCCESS:
      return {
        ...state,
        error: null,
        saved_queries_status: 'loaded',
        saved_queries: action.result
      };

    case actionTypes.LOAD_FAILURE:
      return {
        ...state,
        saved_queries_status: 'failed',
        error: action.error
      };

    case actionTypes.SAVE:
      return (action.error) ?
        { ...state, error: action.error } :
        { ...state, error: undefined,
          saved_queries: [...state.saved_queries, action.result],
          activeTab: 1
        };

    case actionTypes.UPDATE:
      return (action.error) ?
        { ...state, error: action.error } :
        { ...state, error: undefined,
          saved_queries: state.saved_queries.map(query => (query._id === action.result._id) ?
            action.result : 
            query
          )
        };

    case actionTypes.DELETE:
      return (action.error) ?
        { ...state, error: action.error } :
        { ...state, error: undefined,
          saved_queries: state.saved_queries.filter(el => el._id !== action.id)
        };

    default:
      return state;
  }
};
