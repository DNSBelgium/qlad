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
import * as d3 from 'd3';
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
import {DNS_RCODES} from 'constants';
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

export default class ResponseCodeChart extends Component {
  constructor() {
    super();
    this.state = {
      showEntropy: false,
      selected: undefined,
    };
    this._selectRCode = this._selectRCode.bind(this);
  }

  _changeView() {
    this.setState({...this.state, showEntropy: !this.state.showEntropy});
  }

  _selectRCode(name) {
    let rcode = DNS_RCODES.find(rcode => rcode.type === name.title);
    let id = rcode ? rcode.id : parseInt(name.title, 10);
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
        histogram: window.histogram.filter(rcode => rcode.key === selected),
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
      let countByRCodeMap = {};
      data.forEach(d => {
        d.histogram.forEach(rcode => {
          if (countByRCodeMap.hasOwnProperty(rcode)) {
            countByRCodeMap[rcode.key] += rcode.value;
          } else {
            countByRCodeMap[rcode.key] = rcode.value;
          }
        });
      });
      let countByRCode = Object.keys(countByRCodeMap)
        .map(key => ({key: key, value: countByRCodeMap[key]}))
        .sort((a, b) => b.value - a.value);

      if (selected) countByRCode = [{key: selected, value: 0}];

      let dataSeries = countByRCode.map((rcode, i) =>
        <AreaSeries
          key={rcode.key}
          color={colors[i]}
          onSeriesClick={event => {
            this._selectRCode({title: rcode.key});
          }}
          data={filteredData.map(function(window, j) {
            let obj = window.histogram.find(
              x => x.key === parseInt(rcode.key, 10),
            );
            let yval = obj ? obj.value : 0;
            if (!selected)
              yval *= 100.0 / d3.sum(window.histogram, d => d.value);
            return {
              x: (window.start + (window.end - window.start) / 2) * 1000,
              y: yval,
              y0: 0,
            };
          })}
          style={{cursor: 'pointer'}}
        />,
      );

      plot = (
        <FlexibleXYPlot
          xType="time"
          xDomain={domain}
          margin={{left: 50, right: 10, top: 10, bottom: 30}}
          height={300}
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
          <YAxis title={selected ? '# queries' : '% of queries'} />
        </FlexibleXYPlot>
      );

      legend = (
        <FlexibleLegend
          orientation="horizontal"
          onItemClick={this._selectRCode}
          items={countByRCode.map(function(rcode, i) {
            let obj = DNS_RCODES.find(x => x.id === parseInt(rcode.key, 10));
            let rcodeName = obj ? obj.type : rcode.key;
            return {title: rcodeName, color: colors[i]};
          })}
        />
      );
    }

    return (
      <Section pad={{horizontal: 'medium', between: 'small'}} flex="grow">
        <Paragraph margin="none">
          Shows the breakdown of queries by DNS response code.
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
