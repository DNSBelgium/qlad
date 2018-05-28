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

import React, { Component } from 'react';
import { Router, browserHistory as history } from 'react-router';
import { Provider } from 'react-redux';
import store from './store';
import routes from './routes';
import * as session from 'services/session';


class App extends Component {

  constructor() {
    super();
    this.state = { ready: false };
  }

  autoLogin() {
    session.refreshToken().then(() => {
      this.setState({ ready: true });
    }).catch((e) => {
      console.log("Autologin failed: " + e);
      history.push('/login');
      this.setState({ ready: true });
    });
  }

  componentDidMount() {
    // Waits for the redux store to be populated with the previously saved state,
    // then it will try to auto-login the user.
    const unsubscribe = store.subscribe(() => {
      if (store.getState().services.persist.isHydrated) {
        unsubscribe();
        this.autoLogin();
      }
    });
  }

  render() {
    if (this.state.ready)
      return (
        <Provider store={store}>
          <Router routes={routes} history={history}
            onUpdate={() => document.getElementById('content').focus()} />
        </Provider>
      );
    return null;
  }
}

export default App;
