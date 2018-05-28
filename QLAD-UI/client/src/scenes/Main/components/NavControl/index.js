// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
  Box,
  Button,
  Title
} from 'grommet';
import Logo from 'grommet/components/icons/base/ServerCluster';

import { navActivate } from 'components/NavSidebar/actions';

class NavControl extends Component {
  render() {
    const { name, nav: { active } } = this.props;

    let result;
    const title = <Title>{name || ''}</Title>;
    if (!active) {
      result = (
        <Button onClick={() => this.props.dispatch(navActivate(true))}>
          <Box direction='row' responsive={false}
            pad={{ between: 'small' }}>
            <Logo />
            {title}
          </Box>
        </Button>
      );
    } else {
      result = title;
    }
    return result;
  }
}

NavControl.propTypes = {
  dispatch: PropTypes.func.isRequired,
  name: PropTypes.string,
  nav: PropTypes.object
};

const select = state => ({
  nav: state.nav
});

export default connect(select)(NavControl);
