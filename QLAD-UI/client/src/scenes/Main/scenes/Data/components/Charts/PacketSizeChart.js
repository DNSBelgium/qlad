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
import * as d3 from 'd3';

import { Box } from 'grommet';
import {
  XYPlot, XAxis, YAxis, HorizontalGridLines,
  makeWidthFlexible,
  VerticalRectSeries,
  DiscreteColorLegend
} from 'react-vis';

const colors = ['#8dd3c7','#ffffb3','#bebada','#fb8072','#80b1d3','#fdb462',
                '#b3de69','#fccde5','#d9d9d9','#bc80bd','#ccebc5','#ffed6f'];

const PacketSizeChart = ({data, onClick}) => {
    // first group by time epoch, next by query type
    // eg: [ ..., {
    //  key: "1486935347", 
    //  values: [{key: "1", value: 17}, {key: "28", value: 6}, ...]
    //  }, ...]

    const histograms = (function(data, keys) {
      var max = d3.max(keys.map((key) => d3.max(data, d => parseInt(d[key], 10))));
      var histogram = d3.histogram().domain([0, max]);
      return keys.map((key) => histogram(data.map((q) => q[key])));
    }(data, ['len', 'res_len']));

    const FlexibleXYPlot = makeWidthFlexible(XYPlot);

    let dataSeries = histograms.map((hist, i) =>
          <VerticalRectSeries
            key={i}
            color={colors[i]}
            opacity={0.8}
            data={
                hist.map(function(d, j) {
                  return ({x: d.x0, x0: d.x1, y: d.length, y0: 0 });
                }) }/>
    );

    let legend = (
      <DiscreteColorLegend
          height={300}
          orientation="vertical"
          items={[{title: 'Query', color: colors[0]}, {title: 'Response', color: colors[1]}]} />
    );

    return (
        <Box pad={{ horizontal: 'medium', vertical:'small', between:'small' }} direction='row'>
          <Box flex="grow">
            <FlexibleXYPlot
                xType='linear'
                height={300}>
              <HorizontalGridLines />
              { dataSeries }
              <XAxis title="packet size" />
              <YAxis title="number of packets"/>
            </FlexibleXYPlot>
          </Box>
          <Box>
            { legend }
          </Box>
        </Box>
    );
};

PacketSizeChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  onApplyFilter: PropTypes.func
};

export default PacketSizeChart;
