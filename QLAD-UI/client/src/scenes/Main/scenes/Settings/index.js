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

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { loadSettings, unloadSettings } from 'data/settings/actions'
import {
  Article,
  Box,
  Header,
  List,
  Title 
} from 'grommet';
import NavControl from '../../components/NavControl';
import WhitelistSection from './components/WhitelistSection';
import WhitelistEdit from './components/WhitelistEdit';

const LAYERS = {
  whitelistEdit: WhitelistEdit,
};

class Settings extends React.Component {

  constructor (props) {
    super(props);

    this._onLayerOpen = this._onLayerOpen.bind(this);
    this._onLayerClose = this._onLayerClose.bind(this);

    this.state = {
      layer: null,
    };
  }

  componentDidMount () {
    this.props.dispatch(loadSettings());
  }

  componentWillUnmount () {
    this.props.dispatch(unloadSettings());
  }

  _onLayerOpen (name) {
    this.setState({ layer: name });
  }

  _onLayerClose (nextLayer=null) {
    if (nextLayer && typeof nextLayer !== 'string') {
      nextLayer = null;
    }
    this.setState({ layer: nextLayer });
  }

  _renderLayer () {
    let layer;
    if (this.state.layer) {
      const Layer = LAYERS[this.state.layer];
      layer = <Layer onClose={this._onLayerClose} />;
    }
    return layer;
  }

  render () {
    const { settings } = this.props;

    let layer = this._renderLayer();

    return (
        <Article full="vertical">
          <Header size="large" justify="between" pad={{horizontal: 'medium'}}>
            <Title responsive={false}>
              <NavControl />
              <span>Settings</span>
            </Title>
          </Header>

          <Box flex={true}>
            <List>
              <WhitelistSection settings={settings}
                onOpen={this._onLayerOpen.bind(this, 'whitelistEdit')} />
            </List>
          </Box>

          {layer}
        </Article>
    );

  }

}

Settings.propTypes = {
  settings: PropTypes.shape({
    whitelist: PropTypes.array
  }),
};

let select = (state) => ({
  settings: state.data.settings.settings,
});

export default connect(select)(Settings);
