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
import { Box, Section, Paragraph } from 'grommet';
import {
  XYPlot, XAxis, YAxis, HorizontalGridLines,
  makeWidthFlexible,
  HorizontalBarSeries
} from 'react-vis';
import { DNS_QUERY_TYPES } from 'constants';


export default class QueryTypeChart extends Component {

  render() {
    const { data } = this.props;

    const FlexibleXYPlot = makeWidthFlexible(XYPlot);

    let dataSeries = (
      <HorizontalBarSeries
        data={data.histogram.map(function(qtype, i) {
          let obj = DNS_QUERY_TYPES.find(x => x.id === parseInt(qtype.key, 10));
          let qtypeName = (obj ? obj.type : qtype.key);
          return ({y: qtypeName, x: qtype.value});
        })}
      />);

    return (
        <Section pad={{horizontal: 'medium', between: 'small'}} flex="grow">
          <Paragraph margin="none">
            Shows the breakdown of queries by DNS query type.
          </Paragraph>
          <Box flex="grow">
            <FlexibleXYPlot
                yType="ordinal"
                margin={{left: 100, right: 10, top: 10, bottom: 40}}
                height={300}>
              <HorizontalGridLines />
              { dataSeries }
              <XAxis title="# queries"/>
              <YAxis />
            </FlexibleXYPlot>
          </Box>
        </Section>
    )
  }
}
