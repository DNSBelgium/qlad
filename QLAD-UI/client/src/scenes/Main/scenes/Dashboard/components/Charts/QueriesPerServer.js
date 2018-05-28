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

import React, {Component} from 'react';
import {browserHistory as history} from 'react-router';
import moment from 'moment';
import {Box} from 'grommet';
import {
  XYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  makeWidthFlexible,
  DiscreteColorLegend,
  LineSeries,
  MarkSeries,
} from 'react-vis';

const colors = [
  '#8dd3c7',
  '#bebada',
  '#fb8072',
  '#80b1d3',
  '#fdb462',
  '#b3de69',
  '#fccde5',
  '#d9d9d9',
  '#bc80bd',
  '#ccebc5',
  '#ffed6f',
];

// eslint-disable-next-line no-extend-native
Object.defineProperty(Array.prototype, 'group', {
  enumerable: false,
  value: function(key) {
    let map = {};
    this.map(e => ({k: key(e), d: e})).forEach(e => {
      map[e.k] = map[e.k] || [];
      map[e.k].push(e.d);
    });
    return Object.keys(map).map(k => ({key: k, data: map[k]}));
  },
});

export default class QuueriesPerServerChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedServer: null,
    };
  }

  _onValueClick(data, e) {
    history.push(`/traffic/detail/${data.server}/${data.x / 1000}`);
  }

  _selectServer(name) {
    if (this.state.selectedServer === name) {
      this.setState({selectedServer: null});
    } else {
      this.setState({selectedServer: name});
    }
  }

  render() {
    const {data} = this.props;
    const {selectedServer} = this.state;
    let byServer = data.group(d => d.server);
    if (selectedServer) {
      byServer = byServer.filter(s => s.key === selectedServer);
    }

    const FlexibleXYPlot = makeWidthFlexible(XYPlot);
    const FlexibleLegend = makeWidthFlexible(DiscreteColorLegend);

    const lineSeries = byServer.map((g, i) =>
      <LineSeries
        key={g.key}
        color={colors[i]}
        data={g.data.map(function(window, j) {
          return {
            x: (window.start + (window.end - window.start) / 2) * 1000,
            y: window.nb_queries,
          };
        })}
        style={{strokeLinejoin: 'round'}}
      />,
    );

    const markSeries = byServer.map((g, i) =>
      <MarkSeries
        key={g.key}
        sizeRange={[1, 3]}
        data={g.data.map(function(window, j) {
          let color = colors[i],
            size = 2;
          if (window.anomalies.length > 0) {
            color = '#cf4d2a';
            size = 3;
          }
          return {
            x: (window.start + (window.end - window.start) / 2) * 1000,
            y: window.nb_queries,
            color: color,
            size: size,
            server: g.key,
          };
        })}
        style={{cursor: 'pointer'}}
        onValueClick={this._onValueClick}
      />,
    );

    const legend = (
      <FlexibleLegend
        orientation="horizontal"
        onItemClick={(item) => this._selectServer(item.title)}
        items={byServer.map((g, i) => ({title: g.key, color: colors[i]}))}
      />
    );

    return (
      <Box flex="grow">
        <FlexibleXYPlot
          xType="time"
          xDomain={[
            moment().subtract(1, 'days').unix() * 1000,
            moment().unix() * 1000,
          ]}
          yType="linear"
          colorType="literal"
          margin={{left: 60, right: 10, top: 10, bottom: 40}}
          height={200}>
          <HorizontalGridLines />
          {lineSeries}
          {markSeries}
          <XAxis title="time" />
          <YAxis title="# queries per 5 min" />
        </FlexibleXYPlot>
        {legend}
      </Box>
    );
  }
}
