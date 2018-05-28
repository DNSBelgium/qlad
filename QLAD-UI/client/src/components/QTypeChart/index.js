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
import Legend from 'grommet/components/Legend';
import StackedBarChartD3 from './components/StackedBarChartD3';

class QTypeChart extends Component {
  constructor(props) {
    super(props);
    // define the method this way so that we have a clear reference to it
    // this is necessary so that window.removeEventListener will work properly
    this.handleResize = (e => this._handleResize(e));
    this.totals = this._transformData(this.props.data)[1];
  }

  //Transform the data to the right format
  _transformData(data) {
      // first group by time epoch, next by query type
      var countsByQtype = d3.nest()
          .key((d) => d.unixtime)
          .key((d) => d.qtype)
          .rollup((queries) => queries.length)
          .entries(data)

      // group special types in category 'other'
      var popularQtypes = [ 1, 28, 255, 5, 15, 2, 12, 24, 6, 33, 16]
      var totals = {"other": 0, "all": data.length};
      popularQtypes.forEach((qtype) => totals[qtype] = 0);

      var filteredCountsByQtype = countsByQtype.map(function(ts) {
        var total = 0, count = {};
        ts.values.forEach(function(qtype) {
           if (popularQtypes.includes(parseInt(qtype.key, 10))) {
             totals[qtype.key] += qtype.value;
             count[qtype.key] = qtype.value;
           } else {
             totals["other"] += qtype.value;
             count["other"] = (count["other"] || 0) + qtype.value;
           }
           total += qtype.value;
         });

         var result = {
           "ts":new Date(ts.key*1000),
           "all":total
         };
         popularQtypes.forEach(function(qtype) {
           result[qtype] = count[qtype] || 0;
         })
         result["other"] = count['other'] || 0;
         return result;
    });
    return [filteredCountsByQtype, totals];
  }

  render () {
    return (
      <Box direction="row" pad={{"between": "medium"}} flex="grow">
        <Box flex="grow">
          <div style={{width:"100%", height:"100%"}} ref="chart"></div>
        </Box>
        <Box flex={false}>
          <Legend series={[
            {"label": "A", "value": d3.format('.2%')(this.totals[1]/this.totals['all']), "colorIndex": "graph-1", "onClick": (() => this.props.onClick('qtype', 1))},
            {"label": "AAAA", "value": d3.format('.2%')(this.totals[28]/this.totals['all']), "colorIndex": "graph-2", "onClick": (() => this.props.onClick('qtype', 28))},
            {"label": "ANY", "value": d3.format('.2%')(this.totals[255]/this.totals['all']), "colorIndex": "graph-3", "onClick": (() => this.props.onClick('qtype', 255))},
            {"label": "CNAME", "value": d3.format('.2%')(this.totals[5]/this.totals['all']), "colorIndex": "graph-4", "onClick": (() => this.props.onClick('qtype', 5))},
            {"label": "MX", "value": d3.format('.2%')(this.totals[15]/this.totals['all']), "colorIndex": "graph-5", "onClick": (() => this.props.onClick('qtype', 15))},
            {"label": "NS", "value": d3.format('.2%')(this.totals[2]/this.totals['all']), "colorIndex": "graph-6", "onClick": (() => this.props.onClick('qtype', 2))},
            {"label": "PTR", "value": d3.format('.2%')(this.totals[12]/this.totals['all']), "colorIndex": "graph-7", "onClick": (() => this.props.onClick('qtype', 12))},
            {"label": "SIG", "value": d3.format('.2%')(this.totals[24]/this.totals['all']), "colorIndex": "graph-8", "onClick": (() => this.props.onClick('qtype', 24))},
            {"label": "SOA", "value": d3.format('.2%')(this.totals[6]/this.totals['all']), "colorIndex": "graph-9", "onClick": (() => this.props.onClick('qtype', 6))},
            {"label": "SRV", "value": d3.format('.2%')(this.totals[33]/this.totals['all']), "colorIndex": "graph-10", "onClick": (() => this.props.onClick('qtype', 33))},
            {"label": "TXT", "value": d3.format('.2%')(this.totals[16]/this.totals['all']), "colorIndex": "graph-11", "onClick": (() => this.props.onClick('qtype', 16))},
            {"label": "other", "value": d3.format('.2%')(this.totals['other']/this.totals['all']), "colorIndex": "graph-12"},
          ]} />
        </Box>
      </Box>
    );
  }

  /** When we mount, intialize resize handler and create the chart */
  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
    this.qTypeChart = new StackedBarChartD3(this.refs.chart, this.getChartState());
  }

  /** When we update, update the chart */
  componentDidUpdate () {
    this.qTypeChart.update(this.refs.chart, this.getChartState());
  }

  /** Define what props get passed down to the d3 chart */
  getChartState () {
    return {
      data: this.props.data ? this._transformData(this.props.data)[0] : undefined,
      fixedDomain: this.props.fixedDomain,
      margin: this.props.margin,
      selectedKey: this.props.selectedKey,
      onClick: this.props.onClick || (() => {}),
      colorLegend: this.props.colorLegend,
      legendWidth: this.props.legendWidth
    }
  }

  /** When we're piecing out, remove the handler and destroy the chart */
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
    this.qTypeChart.destroy(this.refs.chart);
  }

  /** On a debounce, adjust the size of our graph area and then update the chart */
  _handleResize(e) {
    this.__resizeTimeout && clearTimeout(this.__resizeTimeout);
    this.__resizeTimeout = setTimeout(() => {
      this.qTypeChart.adjustSize(this.refs.chart, this.getChartState());
      this.qTypeChart.update(this.refs.chart, this.getChartState());
      delete this.__resizeTimeout;
    }, 100);
  }

}

QTypeChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object)
};

export default QTypeChart;
