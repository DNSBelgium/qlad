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

import GoogleMapReact from 'google-map-react';
import { Box } from 'grommet';
import LocationPinIcon from 'grommet/components/icons/base/LocationPin';

import { getResolverInfo } from 'services/whois';

class IPinfo extends React.Component {

  constructor(props) {
    super(props);
    this.state = { info: undefined };
  }

  componentDidMount() {
    getResolverInfo(this.props.ip)
      .then(res => this.setState({ info: res }))
      .catch( err => this.setState({ error: err }));
  }

  render() {
    const { info } = this.state;
    const { showMap } = this.props;

    let content, map;

    if (info) {
      content = (
          <Box pad={{ horizontal: 'medium', vertical:'small' }} direction='column'>
            <span><strong>IP:</strong> {info.ip}</span>
            <span><strong>Hostname:</strong> {info.hostname}</span>
            <span><strong>Network:</strong> {info.org}</span>
            <span><strong>Location:</strong> {[info.city, info.region, info.country].filter(Boolean).join(", ")}</span>
          </Box>
      );
    }

    if (info && showMap) {
      map = (
          <Box pad={{ horizontal: 'medium', vertical:'small' }} flex='grow'
             size={{height: "small"}}>
            <GoogleMapReact
              bootstrapURLKeys={{key: "AIzaSyA1ZyJ9vP73QMr3f7xT8A8TS_CuprStTh4"}}
              defaultCenter={{lat: parseFloat(info.loc.split(",")[0]), lng: parseFloat(info.loc.split(",")[1])}}
              defaultZoom={11} >
              <LocationPinIcon
                 lat={parseFloat(info.loc.split(",")[0])}
                 lng={parseFloat(info.loc.split(",")[1])}
                 colorIndex='accent-2' />
            </GoogleMapReact>
          </Box>
      );
    }
    return (
        <Box direction='row'>
          { content }
          { map }
        </Box>
    );
  }

}

IPinfo.propTypes = {
  ip: PropTypes.string.isRequired,
  showMap: PropTypes.bool
};


export default IPinfo;
