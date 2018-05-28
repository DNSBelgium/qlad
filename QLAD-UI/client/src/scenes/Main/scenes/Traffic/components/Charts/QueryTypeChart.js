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
import {Box, Section, Paragraph, CheckBox, Footer} from 'grommet';
import {
  XYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  makeWidthFlexible,
  AreaSeries,
  MarkSeries,
  DiscreteColorLegend,
} from 'react-vis';
import {DNS_QUERY_TYPES} from 'constants';
import EntropyChart from './EntropyChart';

const colors = [
  '#8dd3c7',
  '#ffffb3',
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

export default class QueryNameChart extends Component {
  constructor() {
    super();
    this.state = {
      showEntropy: false,
      selected: undefined,
    };
    this._selectQType = this._selectQType.bind(this);
  }

  _changeView() {
    this.setState({...this.state, showEntropy: !this.state.showEntropy});
  }

  _selectQType(name) {
    let qtype = DNS_QUERY_TYPES.find(qtype => qtype.type === name.title);
    let id = qtype ? qtype.id : parseInt(name.title, 10);
    if (this.state.selected === id) this.setState({selected: undefined});
    else this.setState({selected: id});
  }

  render() {
    const {showEntropy, selected} = this.state;
    const {data, domain, onWindowClick} = this.props;

    // filter data
    let filteredData = data;
    if (selected) {
      filteredData = data.map(window => ({
        ...window,
        histogram: window.histogram.filter(qtype => qtype.key === selected),
      }));
    }

    const FlexibleXYPlot = makeWidthFlexible(XYPlot);
    const FlexibleLegend = makeWidthFlexible(DiscreteColorLegend);

    let plot, legend;

    if (showEntropy) {
      plot = (
        <EntropyChart
          data={data}
          domain={domain}
          onWindowClick={onWindowClick}
        />
      );
    } else {
      // count the number of queries for each type
      // eg: [{key: "1", value: 599}, {key: "28", value: 317}, ... ]
      let countByQtypeMap = {};
      data.forEach(d => {
        d.histogram.forEach(qtype => {
          if (countByQtypeMap.hasOwnProperty(qtype)) {
            countByQtypeMap[qtype.key] += qtype.value;
          } else {
            countByQtypeMap[qtype.key] = qtype.value;
          }
        });
      });
      let countByQtype = Object.keys(countByQtypeMap)
        .map(key => ({key: key, value: countByQtypeMap[key]}))
        .sort((a, b) => b.value - a.value);

      if (selected) countByQtype = [{key: selected, value: 0}];

      let dataSeries = countByQtype.map((qtype, i) =>
        <AreaSeries
          key={qtype.key}
          color={colors[i]}
          onSeriesClick={event => {
            this._selectQType({title: qtype.key});
          }}
          data={filteredData.map(function(window, j) {
            let obj = window.histogram.find(
              x => x.key === parseInt(qtype.key, 10),
            );
            let count = obj ? obj.value : 0;
            return {
              x: (window.start + (window.end - window.start) / 2) * 1000,
              y: count,
              y0: 0,
            };
          })}
          style={{cursor: 'pointer'}}
        />,
      );

      plot = (
        <FlexibleXYPlot
          xType="time"
          margin={{left: 50, right: 10, top: 10, bottom: 30}}
          height={300}
          xDomain={domain}
          colorType="literal"
          stackBy="y">
          <HorizontalGridLines />
          {dataSeries}
          <MarkSeries
            size={3}
            data={data
              .filter(window => window.anomaly)
              .map(function(window, i) {
                let xval =
                  (window.start + (window.end - window.start) / 2) * 1000;
                return {
                  x: xval,
                  color: '#cf4d2a',
                  server: window.server,
                };
              })}
            onValueClick={value => onWindowClick(value.server, value.x / 1000)}
            style={{cursor: 'pointer'}}
          />
          <XAxis title="time" />
          <YAxis title="# queries per 5 min" />
        </FlexibleXYPlot>
      );

      legend = (
        <FlexibleLegend
          orientation="horizontal"
          onItemClick={this._selectQType}
          items={countByQtype.map(function(qtype, i) {
            let obj = DNS_QUERY_TYPES.find(
              x => x.id === parseInt(qtype.key, 10),
            );
            let qtypeName = obj ? obj.type : qtype.key;
            return {title: qtypeName, color: colors[i]};
          })}
        />
      );
    }

    return (
      <Section pad={{horizontal: 'medium', between: 'small'}} flex="grow">
        <Paragraph margin="none">
          Shows the breakdown of queries by DNS query type.
        </Paragraph>
        <Box flex="grow">
          {plot}
        </Box>
        <Footer
          pad={{horizontal: 'small', vertical: 'none', between: 'medium'}}
          justify="between"
          responsive={true}>
          <Box flex="grow">
            {legend}
          </Box>
          <Box align="end">
            <CheckBox
              label="Show entropy"
              onChange={e => this._changeView()}
              checked={showEntropy}
              toggle={true}
            />
          </Box>
        </Footer>
      </Section>
    );
  }
}
