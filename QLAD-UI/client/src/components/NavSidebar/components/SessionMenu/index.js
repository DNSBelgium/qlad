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
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Menu from 'grommet/components/Menu';
import Anchor from 'grommet/components/Anchor';
import Box from 'grommet/components/Box';
import Heading from 'grommet/components/Heading';
import UserIcon from 'grommet/components/icons/base/User';

import { revoke } from 'services/session';

class SessionMenu extends Component {

  constructor() {
    super();
    this._onLogout = this._onLogout.bind(this);
  }

  _onLogout(event) {
    event.preventDefault();
    revoke();
  }

  render() {
    const { dropAlign, colorIndex } = this.props;
    const userName = this.props.user.name;

    return (
      <Menu icon={<UserIcon />} dropAlign={dropAlign}
        colorIndex={colorIndex} a11yTitle='Session'>
        <Box pad='medium'>
          <Heading tag='h3' margin='none'>{userName}</Heading>
        </Box>
        <Anchor href='#' onClick={this._onLogout} label='Logout' />
      </Menu>
    );
  }

}

SessionMenu.propTypes = {
  colorIndex: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  dropAlign: Menu.propTypes.dropAlign,
  user: PropTypes.object.isRequired
};

const select = state => ({
  user: state.services.session.user
});

export default connect(select)(SessionMenu);
