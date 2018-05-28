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
import Table from 'grommet/components/Table';
import TableRow from 'grommet/components/TableRow';
import QnameChartD3 from './components/QnameChartD3';

class QNameChart extends Component {

  constructor() {
    super();
    this._onSetActive = this._onSetActive.bind(this);
    this._onSetInactive = this._onSetInactive.bind(this);
    this.state = { activeIndex: undefined };
    // define the method this way so that we have a clear reference to it
    // this is necessary so that window.removeEventListener will work properly
    this.handleResize = (e => this._handleResize(e));
  }

  //Transform the data to the right format
  _transformData(data) {
    // group by domainname
    var groupedData = d3.nest()
        .key(function(d) { return d.domainname })
        .rollup(function(queries) {
          return {
            // total # queries for this domain name
            "count": queries.length,
            // total # of invalid queries for this domain name
            "error": d3.sum(queries, function(d) { return parseInt(d.rcode, 10) !== 0; }),
            // total # of unique qnames (subdomains) requested for this domain name
            "qnames": d3.map(queries, function(d) { return d.qname; }).keys().length,
            // list of qnames (subdomains) requested for this domain name
            "allqnames": d3.entries(queries).map(function(d) { return d.value.qname; })
          }
        })
        .entries(data);

    return groupedData;
  }

  _onSetActive(id) {
    return this.setState({ activeIndex: id });
  }

  _onSetInactive(id) {
    return this.setState({ activeIndex: undefined });
  }

  render () {
    const { activeIndex } = this.state;

    let activeInfo;
    if (activeIndex) {
      var histogramMap = {};
      for(var i=0, len=activeIndex.value.allqnames.length; i<len; i++){
          var key = activeIndex.value.allqnames[i];
          histogramMap[key] = (histogramMap[key] || 0) + 1;
      }
      // convert to an array of output objects
      var histogram = [];
      for(key in histogramMap) histogram.push({key: key, freq: histogramMap[key]});
      // sort the histogram
      histogram.sort(function(a,b){return b.freq - a.freq})
      // format as table
      const rows = (histogram || []).map((h, i) => (
        <TableRow key={i}><td>{histogram[i].key}</td><td>{histogram[i].freq}</td></TableRow>
      )).slice(0, 5);

      activeInfo = (
        <Box direction="column">
          <span><strong>Domain:</strong> {activeIndex.key}</span>
          <span><strong>Total # queries:</strong> {activeIndex.value.count}</span>
          <span><strong>Total # failed queries:</strong> {activeIndex.value.error}</span>
          <span><strong>Total # unique names:</strong> {activeIndex.value.qnames}</span>
          <span><strong>Most frequent queries:</strong></span>
          <Table>
            <thead>
              <tr><th>Name</th><th>#</th></tr>
            </thead>
            <tbody>
              {rows}
            </tbody>
          </Table>
        </Box>
      );
    }

    return (
      <Box direction="row" pad={{"between": "medium"}} flex="grow">
        <Box basis="2/3">
          <div style={{width:"100%", height:"100%"}} ref="chart"></div>
        </Box>
        <Box basis="1/3" direction="column">
          <div style={{width:"100%"}} ref="legend"></div>
          {activeInfo}
        </Box>
      </Box>
    );
  }

  /** When we mount, intialize resize handler and create the chart */
  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
    this.qNameChart = new QnameChartD3(this.refs.chart, this.refs.legend, this.getChartState());
  }

  /** When we update, update the chart */
  componentDidUpdate() {
    this.qNameChart.update(this.refs.chart, this.getChartState());
  }

  /** Define what props get passed down to the d3 chart */
  getChartState() {
    return {
      data: this.props.data ? this._transformData(this.props.data) : undefined,
      margin: this.props.margin,
      selectedKey: this.props.selectedKey,
      onClick: this.props.onClick || (() => {}),
      onSetActive: this._onSetActive,
      onSetInactive: this._onSetInactive,
      legendWidth: this.props.legendWidth || this.refs.legend.offsetWidth
    }
  }

  /** When we're piecing out, remove the handler and destroy the chart */
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
    this.qNameChart.destroy(this.props.chart);
  }

  /** On a debounce, adjust the size of our graph area and then update the chart */
  _handleResize(e) {
    this.__resizeTimeout && clearTimeout(this.__resizeTimeout);
    this.__resizeTimeout = setTimeout(() => {
      this.qNameChart.adjustSize(this.refs.chart, this.refs.legend, this.getChartState());
      this.qNameChart.update(this.refs.chart, this.getChartState());
      delete this.__resizeTimeout;
    }, 100);
  }

}


QNameChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object)
};


export default QNameChart;
