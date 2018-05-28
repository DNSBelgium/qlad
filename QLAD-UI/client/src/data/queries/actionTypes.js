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

// Submitting queries for execution
export const SUBMIT = 'query/SUBMIT';
export const CANCEL = 'query/CANCEL';
export const PROCESSING = 'query/PROCESSING';
export const FINISHED = 'query/FINISHED';

// Display query data
export const ADD_FILTER = 'query/ADD_FILTER';
export const DEL_FILTER = 'query/DEL_FILTER';

// Saving queries
export const LOAD = 'query/LOAD';
export const LOAD_SUCCESS = 'query/LOAD_SUCCESS';
export const LOAD_FAILURE = 'query/LOAD_FAILURE';
export const UNLOAD = 'query/UNLOAD';
export const SAVE = 'query/SAVE';
export const UPDATE = 'query/UPDATE';
export const DELETE = 'query/DELETE';
