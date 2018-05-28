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

import store from 'store';
import { browserHistory as history } from 'react-router';

import * as api from './api';
import * as selectors from './selectors';
import * as actionCreators from './actions';
import { initialState } from './reducer';

const SESSION_TIMEOUT_THRESHOLD = 300; // Will refresh the access token 5 minutes before it expires

let sessionTimeout = null;

const setSessionTimeout = (duration) => {
  clearTimeout(sessionTimeout);
  sessionTimeout = setTimeout(
    refreshToken, // eslint-disable-line no-use-before-define
    (duration - SESSION_TIMEOUT_THRESHOLD)*1000
  );
};

const clearSession = () => {
  clearTimeout(sessionTimeout);
  history.push('/login');
  store.dispatch(actionCreators.update(initialState));
};

const onRequestSuccess = (response) => {
  const tokens = response.tokens.reduce((prev, item) => ({
    ...prev,
    [item.type]: item,
  }), {});
  store.dispatch(actionCreators.update({ tokens, user: response.user }));
  setSessionTimeout(tokens.access.expiresIn);
};

const onRequestFailed = (exception) => {
  clearSession();
  throw exception;
};

export const refreshToken = () => {
  const session = selectors.get();

  if (!session.tokens.refresh.value || !session.user.id) {
    return Promise.reject();
  }

  return api.refresh(session.tokens.refresh.value, session.user)
  .then(response => {
    if (response.success)
      return onRequestSuccess(response);
    return onRequestFailed(response);
  })
  .catch(onRequestFailed);
};

export const authenticate = (name, password) =>
  api.authenticate(name, password)
  .then(response => {
    if (response.success)
      return onRequestSuccess(response);
    return onRequestFailed(response);
  })
  .catch(onRequestFailed);

export const revoke = () => {
  const session = selectors.get();
  return api.revoke(Object.keys(session.tokens).map(tokenKey => ({
    type: session.tokens[tokenKey].type,
    value: session.tokens[tokenKey].value,
  })))
  .then(clearSession())
  .catch(() => {});
};
