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

import Box from 'grommet/components/Box';
import * as topojson from 'topojson';
import * as d3 from 'd3';

class WorldMap extends React.Component {

  constructor(props) {
      super(props);
      this.state = { width: 0, height: 0 }
      // Setup default D3 objects
      // projection - defines our geo projection, how the map looks
      this.projection = d3.geoEquirectangular();
      // geoPath - calculates d attribute of <path> so it looks like a map
      this.geoPath = d3.geoPath().projection(this.projection);
      // quantize - threshold scale with 9 buckets
      this.quantize = d3.scaleQuantize().range(d3.range(8));
  }

  _transformData(data) {
    // group by country
    var groupedData = d3.nest()
        .key(d => d.country)
        .rollup(queries => queries.length)
        .map(data);
    this.quantize.domain([0, Math.max(...groupedData.values())])
    return groupedData;
  }

  render() {
    const data = this._transformData(this.props.data);
    // Translate topojson data into geojson data for drawing
    // Prepare a mesh for states and a list of features for counties
    const countriesTopo = require("js/countries.json");
    const countries = topojson.feature(countriesTopo, countriesTopo.objects.countries).features;
    const colors = ['#efedf5','#dadaeb','#bcbddc','#9e9ac8','#807dba','#6a51a3','#54278f','#3f007d'];
    const _this = this;

    let countryNodes = countries.map((country, i) =>
      <path
        key={i}
        onClick={() => this.props.onApplyFilter('country', country.id)}
        style={{
          fill: data["$"+country.id] ? colors[_this.quantize(data["$"+country.id])] : 'none',
          stroke: '#D3D3D3',
          strokeLinejoin: 'round'
        }}
        className={country.id + data["$"+country.id]}
        d={_this.geoPath(country)} />
    );

    // Loop through counties and draw <County> components
    // Add a single <path> for state borders
    // Loop through counties and draw <County> components
    // Add a single <path> for state borders
    return (
      <Box direction="row" pad={{"between": "medium"}} flex="grow">
        <div style={{width:"1000px", height:"500px"}} id="map">
          <svg style={{width:"100%", height:"100%"}}>
            <g>
              {countryNodes}
            </g>
          </svg>
        </div>
      </Box>
    );
  }
}

export default WorldMap;
