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
import {
  XYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  makeWidthFlexible,
  MarkSeries,
} from 'react-vis';

export default class EntropyChart extends React.Component {
  render() {
    const {data, domain, onWindowClick} = this.props;

    const FlexibleXYPlot = makeWidthFlexible(XYPlot);

    return (
      <FlexibleXYPlot
        onMouseLeave={this._onMouseLeave}
        colorType="literal"
        xType="time"
        xDomain={domain}
        margin={{left: 50, right: 10, top: 10, bottom: 30}}
        height={300}>
        <HorizontalGridLines />
        <MarkSeries
          onValueClick={value => onWindowClick(value.server, value.x / 1000)}
          data={data.map(function(window, i) {
            let xval = (window.start + (window.end - window.start) / 2) * 1000;
            let color = '#626dbc';
            if (window.anomaly) color = '#cf4d2a';
            return {
              x: xval,
              y: window.entropy,
              color: color,
              server: window.server,
            };
          })}
          style={{cursor: 'pointer'}}
        />
        <XAxis title="time" />
        <YAxis title="# queries per min" />
      </FlexibleXYPlot>
    );
  }
}

EntropyChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      start: PropTypes.number,
      end: PropTypes.number,
      entropy: PropTypes.number,
      anomaly: PropTypes.object,
    }),
  ).isRequired,
  onWindowClick: PropTypes.func,
};
