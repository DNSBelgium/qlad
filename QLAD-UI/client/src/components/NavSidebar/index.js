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

import {
  Sidebar,
  Header,
  Footer,
  Title,
  Menu,
  Button,
  Anchor
} from 'grommet';
import CloseIcon from 'grommet/components/icons/base/Close';
import Logo from 'grommet/components/icons/base/ServerCluster';


import SessionMenu from './components/SessionMenu';
import { navActivate } from './actions';

class NavSidebar extends Component {

  constructor() {
    super();
    this._onClose = this._onClose.bind(this);
  }

  _onClose() {
    this.props.dispatch(navActivate(false));
  }

  render() {
    const { nav: { items } } = this.props;

    const links = items.map(page => (
      <Anchor key={page.label} path={page.path} label={page.label} />
    ));

    return (
      <Sidebar colorIndex='neutral-1' fixed={true} size='small'>
        <Header size='large' justify='between' pad={{ horizontal: 'medium' }}>
          <Title onClick={this._onClose} a11yTitle='Close Menu'>
            <Logo size='small'/>
          </Title>
          <Button icon={<CloseIcon />} onClick={this._onClose} plain={true}
            a11yTitle='Close Menu' />
        </Header>
        <Menu fill={true} primary={true}>
          {links}
        </Menu>
        <Footer pad={{ horizontal: 'medium', vertical: 'small' }}>
          <SessionMenu dropAlign={{ bottom: 'bottom' }} />
        </Footer>
      </Sidebar>
    );
  }

}

NavSidebar.propTypes = {
  dispatch: PropTypes.func.isRequired,
  nav: PropTypes.shape({
    items: PropTypes.arrayOf(PropTypes.shape({
      path: PropTypes.string,
      label: PropTypes.string
    }))
  })
};

const select = state => ({
  nav: state.nav
});

export default connect(select)(NavSidebar);
