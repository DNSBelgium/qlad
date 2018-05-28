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
import PropTypes from 'prop-types';
import * as d3 from 'd3';

import Distribution from 'grommet/components/Distribution';

class DistributionChart extends Component {

  //Transform the data to the right format
  _transformData(data, key) {
    const total = data.length;
    var groupedData = d3.nest()
        .key(function(d) { return d[key] })
        .rollup(function(queries) {
          return 100 * queries.length / total;
        })
        .entries(data);

    return groupedData;
  }

  render () {
    const data = this._transformData(this.props.data, "src");

    let boxes = data.filter( (src) => src.value >= 10).map( (src, i) => ({
      "label": src.key,
      "value": parseInt(src.value, 10),
      "colorIndex": "graph-"+(i+1)
    }) );
    let smallBoxes = data.filter( (src) => src.value < 10);
    boxes.push({
      "label": "Other sources",
      "value": parseInt(d3.sum(smallBoxes, (box) => box.value), 10),
      "colorIndex": "graph-10"
    })
    console.log(data);
    return (
      <div style={{height:"100%", width:"100%"}}>
        <Distribution series={boxes} units="%" />
      </div>
    )
  }

}

DistributionChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object)
};

export default DistributionChart;
