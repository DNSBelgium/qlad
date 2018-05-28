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

import { createStore, combineReducers, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { persistStore, autoRehydrate } from 'redux-persist';
import createFilter from 'redux-persist-transform-filter';

import { reducer as dataReducer } from './data/reducer';
import { reducer as servicesReducer } from './services/reducer';
import { reducer as navigationReducer } from './components/NavSidebar/reducer';
import * as persistActionCreators from './services/persist/actions';

const appReducer = combineReducers({
  services: servicesReducer,
  data: dataReducer,
  nav: navigationReducer
});

const enhancer = compose(
  applyMiddleware(
    thunk,
  )
);

const store = createStore(
  appReducer,
  enhancer,
  autoRehydrate(),
);

const saveAndLoadSessionFilter = createFilter(
  'services',
  ['session'],
  ['session']
);

export const persist = persistStore(store, {
  blacklist: ['data'], // to large to persist if a lot of queries are executed
  transforms: [saveAndLoadSessionFilter],
}, () => store.dispatch(persistActionCreators.update({ isHydrated: true })));

export default store;
