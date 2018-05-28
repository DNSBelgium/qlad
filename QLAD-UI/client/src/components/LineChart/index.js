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

import Chart, {Axis, Line, Base, Layers, MarkerLabel, Marker, HotSpots} from 'grommet/components/chart/Chart';
import Legend from 'grommet/components/Legend';
import Value from 'grommet/components/Value';

class LineChart extends Component {

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
  _transformData(data, keys) {
    var max = d3.max(keys.map((key) => d3.max(data, d => d[key])));
    var histogram = d3.histogram().domain([0, max]);
    return keys.map((key) => histogram(data.map((q) => q[key])))
  }

  _onSetActive(id) {
    this.setState({ activeIndex: id });
  }

  render () {
    const { activeIndex } = this.state;

    const histograms = this._transformData(this.props.data, ["len", "res_len"]);
    const max = Math.max(d3.max(histograms[0], d => d.length), d3.max(histograms[1], d => d.length))
    return (
      <Chart vertical={true} width='full'>
          <MarkerLabel count={histograms[0].length}
          index={activeIndex}
          label={
            <div>
              <Value
                value={activeIndex ? d3.format(".2%")(histograms[0][activeIndex].length / this.props.data.length) : " "}
                colorIndex='graph-1'
                size='small'
                /><br/>
              <Value
                value={activeIndex ? d3.format(".2%")(histograms[1][activeIndex].length / this.props.data.length) : " "}
                colorIndex='graph-2'
                size='small'
              />
            </div>
          } />
          <Base height='small' width='full' />
          <Layers>
            <Marker colorIndex='neutral-2'
              count={histograms[0].length}
              vertical={true}
              index={activeIndex} />
            <Line values={histograms[0].map(d => d.length)} max={max}
              colorIndex='graph-1' smooth={true}
              activeIndex={activeIndex} />
            <Line values={histograms[1].map(d => d.length)} max={max}
              colorIndex='graph-2' smooth={true}
              activeIndex={activeIndex} />
            <HotSpots count={histograms[0].length}
              max={100}
              activeIndex={activeIndex}
              onActive={(i) => this._onSetActive(i)} />
          </Layers>
          <Axis count={histograms[0].length}
            labels={histograms[0].map((d,i) => ({"index": i, "label": d.x0}))}
            ticks={true} />
          <Legend series={[{"label": "Query length", "colorIndex": "graph-1"}, {"label": "Response length", "colorIndex": "graph-2"}]} />
      </Chart>
    )
  }

}

LineChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object)
};

export default LineChart;
