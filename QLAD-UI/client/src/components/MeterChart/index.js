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

import Box from 'grommet/components/Box';
import Meter from 'grommet/components/Meter';
import Value from 'grommet/components/Value';

class MeterChart extends Component {

  constructor() {
    super();
    this.state = { activeIndex: undefined };
  }

  componentDidMount () {
  }

  componentDidUpdate () {
  }

  componentWillUnmount () {
  }

  //Transform the data to the right format
  _transformData(data, key) {
    const total = data.length
    return d3.nest()
        .key((d) => d[key] )
        .rollup((queries) => ({
            "count": queries.length / total
          }))
        .entries(data);
  }

  _onSetActive(id) {
    this.setState({ activeIndex: id });
  }

  _onClick(value) {
    this.setState({ activeIndex: undefined });
    this.props.onClick(this.props.kei, value);
  }

  render () {
    const { activeIndex } = this.state;
    const key = this.props.kei;
    const value2labelMap = this.props.value2labelMap || {};

    const data = this._transformData(this.props.data, key);
    const series = data.map((d,i) => ({
      "label": d.key,
      "value": d.value.count,
      "colorIndex": d.key === 'true' ? "graph-true" : (d.key === 'false' ? "graph-false" : "graph-"+(i+1))
    }));

    let label;
    if (data[activeIndex]) {
      if (value2labelMap[data[activeIndex].key]) {
        label = value2labelMap[data[activeIndex].key];
      } else {
        label = data[activeIndex].key;
      }
    } else {
      label = "";
    }

    return (
      <Box pad={{"between": "small"}}>
        <Box direction='row'
          flex="shrink"
          justify='between'
          align='center'
          pad={{"between": "small"}}
          announce={true}
          responsive={false}>
          <Value value={data[activeIndex] ? d3.format(".2%")(data[activeIndex].value.count) : key}
            size='small'
            align='start' />
          <span>
            {label}
          </span>
        </Box>
        <Meter series={series}
          vertical={false}
          stacked={true}
          size='small'
          max={1}
          onClick={(i) => this._onClick(data[activeIndex].key)}
          onActive={(i) => this._onSetActive(i)} />
      </Box>
    )
  }

}

MeterChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object)
};

export default MeterChart;
