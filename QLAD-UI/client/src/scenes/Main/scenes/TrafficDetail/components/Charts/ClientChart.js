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
import { getResolverInfo } from 'services/whois';
import { Box, Section, Paragraph } from 'grommet';
import Spinning from 'grommet/components/icons/Spinning';
import {
  XYPlot, XAxis, YAxis, HorizontalGridLines,
  makeWidthFlexible,
  HorizontalBarSeries,
  Hint
} from 'react-vis';

export default class ClientChart extends Component {

  constructor() {
    super();
    this.state = {
      value: null,
      ipInfo: null
    };
    this._rememberValue = this._rememberValue.bind(this);
  }

  _rememberValue(value) {
    this.setState({ ...this.state, value: value })
    getResolverInfo(value.y)
        .then(result => this.setState({ ...this.state, ipInfo: result }));
  }

  render() {
    const { value, ipInfo } = this.state;
    const { data } = this.props;

    const FlexibleXYPlot = makeWidthFlexible(XYPlot);

    let dataSeries = (
      <HorizontalBarSeries
        onValueClick={ this._rememberValue}
        data={data.histogram.slice(0,Math.max(20, data.histogram.length)).map(function(client) {
            return ({ x: client.value, y: client.key })
        }) }
      />);

    let hint = <Spinning />;
    if (ipInfo) {
      hint = (<Box pad={{ horizontal: 'medium', vertical:'small' }} direction='column'>
                  <span><strong>IP:</strong> {ipInfo.ip}</span>
                  <span><strong>Hostname:</strong> {ipInfo.hostname}</span>
                  <span><strong>Network:</strong> {ipInfo.org}</span>
                  <span><strong>Location:</strong> {[ipInfo.city, ipInfo.region, ipInfo.country].filter(Boolean).join(", ")}</span>
                </Box>);
    }

    return (
        <Section pad={{horizontal: 'medium', between: 'small'}} flex="grow">
          <Paragraph margin="none">
            The clients that generate most queries.
          </Paragraph>
          <Box flex="grow">
            <FlexibleXYPlot
                margin={{left: 100, right: 10, top: 10, bottom: 40}}
                yType="ordinal"
                height={300}>
              <HorizontalGridLines />
              { dataSeries }
              {value ?
                <Hint
                  value={value}
                  align={ {horizontal: Hint.ALIGN.AUTO, vertical: Hint.ALIGN.TOP_EDGE} }
                >
                  <div className="rv-hint__content">
                  { hint }
                  </div>
                </Hint> : null
              }
              <XAxis title="# queries"/>
              <YAxis />
            </FlexibleXYPlot>
          </Box>
        </Section>
    )
  }
}
