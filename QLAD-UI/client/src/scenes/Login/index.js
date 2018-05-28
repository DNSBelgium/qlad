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
import { browserHistory as history } from 'react-router';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
  Box,
  LoginForm,
  Footer
} from 'grommet';
import Logo from 'grommet/components/icons/base/ServerCluster';

import * as session from 'services/session';
import * as api from 'services/api';
import { navEnable } from 'components/NavSidebar/actions';

class Login extends Component {

  constructor(props) {
    super(props);

    this.initialState = {
      error: null,
    };
    this.state = this.initialState;
    this._onPressLogin = this._onPressLogin.bind(this);
  }

  componentDidMount() {
    this.props.dispatch(navEnable(false));
  }

  componentWillUnmount() {
    this.props.dispatch(navEnable(true));
  }

  _onPressLogin(fields) {
    this.setState({
      error: '',
    });

    session.authenticate(fields.username, fields.password)
    .then(() => {
      this.setState(this.initialState);
      history.push("/");
    })
    .catch((exception) => {
      // Displays only the first error message
      const error = api.exceptionExtractError(exception);
      this.setState({
        error: (error ?  error  : undefined),
      });

      if (!error) {
        throw exception;
      }
    });
  }

  render() {
    const { error } = this.state;

    return (

      <Box full={true} colorIndex="light-2">
        <Box flex={true} align="center" justify="center">
          <LoginForm align='center'
            logo={<Logo className='logo' colorIndex='brand' size='large' />}
            onSubmit={this._onPressLogin} errors={[error]} usernameType='text' />
        </Box>
        <Footer direction='row' size='small'
          pad={{ horizontal: 'medium', vertical: 'small' }}>
          <Box direction='row' justify='center' flex={true}>
          <span className='secondary'>&copy; 2017 DNS Belgium</span>
          </Box>
        </Footer>
      </Box>

    );
  }
}

Login.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

export default connect()(Login);
