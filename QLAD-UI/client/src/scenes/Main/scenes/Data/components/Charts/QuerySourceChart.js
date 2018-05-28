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
  makeWidthFlexible,
  Treemap
} from 'react-vis';

class QuerySourceChart extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = { selected_asn: undefined };
    this.onLeafClick = this.onLeafClick.bind(this);
  }
  
  transformData() {
    const { data } = this.props;
    const { selected_asn } = this.state;
    let transformData;
    if (selected_asn === undefined)
      transformData = d3.nest()
        .key((d) => d.asn)
        .rollup((queries) => queries.length)
        .entries(data)
        .map(function(asn) {
            return ({ "title": asn.key, "size": asn.value, "color": Math.random() });
        });
    else
      transformData = d3.nest()
        .key((d) => d.src)
        .rollup((queries) => queries.length)
        .entries(data.filter(d => d["asn"] === selected_asn))
        .map(function(ip) {
          return ({ "title": ip.key, "size": ip.value });
        });
    return ({ "title": "Query sources", "children": transformData });
  }

  onLeafClick(leaf) {
    const { selected_asn } = this.state;
    if (selected_asn) {
      this.props.onApplyFilter('asn', selected_asn);
      this.setState({ selected_asn: undefined }); 
    } else {
      this.setState({ selected_asn: leaf.data.title }); 
      this.props.onApplyFilter('asn', leaf.data.title);
    }
  }

  render() {
    const FlexibleTreemap = makeWidthFlexible(Treemap);

    return (
        <Box pad={{ horizontal: 'medium', vertical:'small', between:'small' }} direction='row'>
        <FlexibleTreemap 
          data={this.transformData()} 
          height={300} width={900} padding={1} 
          onLeafClick={this.onLeafClick} 
          mode='squarify' />
        </Box>
    );
  }
};

QuerySourceChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  onApplyFilter: PropTypes.func
};

export default QuerySourceChart;
