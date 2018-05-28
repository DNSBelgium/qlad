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

import { fetchApi } from 'services/api';

const endPoints = {
  authenticate: '/users/auth',
  revoke: '/users/auth/revoke',
  refresh: '/users/auth/refresh',
};

export const authenticate = (name, password) =>
  fetchApi(endPoints.authenticate, {
    name: name,
    password: password
  }, 'post');

export const refresh = (token, user) =>
  fetchApi(endPoints.refresh, {
    refreshToken: token,
    user: user.id
  }, 'post');

export const revoke = tokens =>
  fetchApi(endPoints.revoke, { tokens }, 'post');
