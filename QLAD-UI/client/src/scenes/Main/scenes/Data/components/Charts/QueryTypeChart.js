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
  VerticalBarSeries,
  DiscreteColorLegend
} from 'react-vis';
import { DNS_QUERY_TYPES } from 'constants';

const colors = ['#8dd3c7','#ffffb3','#bebada','#fb8072','#80b1d3','#fdb462',
                '#b3de69','#fccde5','#d9d9d9','#bc80bd','#ccebc5','#ffed6f'];

const QueryTypeChart =({data, fixedDomain, onClick}) => {
    // first group by time epoch, next by query type
    // eg: [ ..., {
    //  key: "1486935347", 
    //  values: [{key: "1", value: 17}, {key: "28", value: 6}, ...]
    //  }, ...]
    const transformData = d3.nest()
        .key((d) => d.unixtime)
        .key((d) => d.qtype)
        .rollup((queries) => queries.length)
        .entries(data);

    // count the number of queries for each type
    // eg: [{key: "1", value: 599}, {key: "28", value: 317}, ... ]
    const countByQtype = d3.nest()
        .key((d) => d.qtype)
        .rollup((queries) => queries.length)
        .entries(data)
        .sort((a, b) => b.value - a.value);

    const FlexibleXYPlot = makeWidthFlexible(XYPlot);

    let dataSeries = countByQtype.map((qtype, i) =>
          <VerticalBarSeries
            key={qtype.key}
            color={colors[i]}
            data={
                transformData.map(function(ts, j) {
                  let obj = ts.values.find(x => x.key === qtype.key);
                  let count = (obj ? obj.value : 0);
                  return ({x: parseInt(ts.key, 10)*1000, y: count});
                }) }/>
    );

    let legend = (
          <DiscreteColorLegend
              height={300}
              orientation="vertical"
              onItemClick={(obj, number) => onClick('qtype', countByQtype[number].key)}
              items={countByQtype.map(function(qtype, i) {
                let obj = DNS_QUERY_TYPES.find(x => x.id === parseInt(qtype.key,10));
                let qtypeName = (obj ? obj.type : qtype.key);
                return ({title: qtypeName, color: colors[i]});
              })} />
          );

    return (
        <Box pad={{ horizontal: 'medium', vertical:'small', between:'small' }} direction='row'>
          <Box flex="grow">
            <FlexibleXYPlot
                xType='time'
                height={300}
                xDomain={fixedDomain}
                stackBy="y">
              <HorizontalGridLines />
              { dataSeries }
              <XAxis title="time" />
              <YAxis title="queries/s"/>
            </FlexibleXYPlot>
          </Box>
          <Box>
            { legend }
          </Box>
        </Box>
    );
};

QueryTypeChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object)
};

export default QueryTypeChart;
