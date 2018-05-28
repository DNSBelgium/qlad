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
import moment from 'moment';

import { Tile, Value, Box} from 'grommet';

class AnomalyTile extends Component {

  render() {
    let item = this.props.item;

    function hashCode(str) { // java String#hashCode
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
           hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return hash;
    } 

    function intToRGB(num){
      num >>>= 0;
      var b = num & 0xFF,
      g = (num & 0xFF00) >>> 8,
      r = (num & 0xFF0000) >>> 16,
      a = 0.1 ;
      return "rgba(" + [r, g, b, a].join(",") + ")";
    }

    return (
      <Tile align="stretch" pad="small" direction="column" size="small"
        onClick={this.props.onClick} selected={this.props.selected}
        style={{backgroundColor:intToRGB(hashCode(item.asn)) }}>
        <Box direction="row">
          <strong>{item.asn.substr(item.asn.indexOf(" ") + 1)}</strong>
        <Box flex="grow" direction="row" justify="end">
          <Value value={item.count} size="small" colorIndex="neutral-4"/>
        </Box>
        </Box>
        <div>
          <span className="secondary">{item.subject}</span><br/>
          <span className="secondary">{moment(item.most_recent).fromNow()}</span>
        </div>
      </Tile>
    );
  }
}

AnomalyTile.propTypes = {
  editable: PropTypes.bool,
  item: PropTypes.object.isRequired,
  onClick: PropTypes.func,
  selected: PropTypes.bool
};

AnomalyTile.defaultProps = {
  editable: true
};

// Using export default doesn't seem to pull in the defaultProps correctly
module.exports = AnomalyTile;
