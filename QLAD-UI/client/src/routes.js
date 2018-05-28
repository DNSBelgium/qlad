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

import Login from './scenes/Login';
import NotFound from './scenes/NotFound';
import Main from './scenes/Main';
import Dashboard from './scenes/Main/scenes/Dashboard';
import Traffic from './scenes/Main/scenes/Traffic';
import TrafficDetail from './scenes/Main/scenes/TrafficDetail';
import Anomalies from './scenes/Main/scenes/Anomalies';
import Data from './scenes/Main/scenes/Data';
import Queries from './scenes/Main/scenes/Queries';
import Settings from './scenes/Main/scenes/Settings';


export default {
  path: '/',
  component: Main,
  childRoutes: [
    { path: 'login', component: Login },
    { path: 'dashboard', component: Dashboard },
    { path: 'traffic', component: Traffic },
    { path: 'traffic/detail/:server/:ts', component: TrafficDetail },
    { path: 'anomalies', component: Anomalies },
    { path: 'data/:id', component: Data },
    { path: 'queries', component: Queries },
    { path: 'settings', component: Settings },
    { path: '*', component: NotFound }
  ],
  indexRoute: { component: Dashboard }
};
