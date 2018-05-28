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
  YAxis,
  HorizontalGridLines,
  makeWidthFlexible,
  LineSeries,
  MarkSeries,
  DiscreteColorLegend,
} from 'react-vis';
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

export default class ResponseSizeChart extends Component {
  constructor() {
    super();
    this.state = {
      showEntropy: false,
    };
  }

  _changeView() {
    this.setState({...this.state, showEntropy: !this.state.showEntropy});
  }

  render() {
    const {showEntropy} = this.state;
    const {data, domain, onWindowClick} = this.props;

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
      plot = (
        <FlexibleXYPlot
          xType="time"
          colorType="literal"
          xDomain={domain}
          margin={{left: 50, right: 10, top: 10, bottom: 30}}
          height={300}>
          <HorizontalGridLines />
          <LineSeries
            color={colors[0]}
            data={data.map(function(window, j) {
              return {
                x: (window.start + (window.end - window.start) / 2) * 1000,
                y: window.avg,
              };
            })}
          />
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
          <YAxis title="avg response size" />
        </FlexibleXYPlot>
      );

      legend = (
        <FlexibleLegend
          orientation="horizontal"
          onItemClick={this._selectDomain}
          items={[{title: 'Response size'}]}
        />
      );
    }

    return (
      <Section pad={{horizontal: 'medium', between: 'small'}} flex="grow">
        <Paragraph margin="none">Shows the response sizes.</Paragraph>
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
